import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email/resend"

/** Roles allowed to approve accounts (see UsersAdminPanel.canApprove). */
const APPROVER_ROLES = ["admin", "pastor", "corps_pastoral"]

function siteUrl(origin?: string | null) {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    origin ||
    (vercel ? `https://${vercel}` : "http://localhost:3000")
  ).replace(/\/$/, "")
}

/** Extra recipients from env (comma separated) — useful before the service key is set. */
function envRecipients() {
  return (process.env.ADMIN_ALERT_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Emails + in-app notifies every admin/pastor that a new account is waiting
 * for approval. Never throws: sign-up must not fail because of an alert.
 */
export async function notifyApproversOfSignup({
  userId,
  email,
  origin,
}: {
  userId: string
  email: string
  origin?: string | null
}) {
  try {
    const admin = createSupabaseAdminClient()
    const recipients = new Set(envRecipients())

    if (admin) {
      const { data: approvers, error } = await admin
        .from("profiles")
        .select("id, email, role")
        .in("role", APPROVER_ROLES)

      if (error) console.error("[signup-alert] could not load approvers:", error.message)

      for (const p of approvers ?? []) {
        let addr: string | null = p.email ?? null
        if (!addr) {
          const { data } = await admin.auth.admin.getUserById(p.id)
          addr = data.user?.email ?? null
        }
        if (addr) recipients.add(addr.toLowerCase())
      }

      // In-app bell notification for each approver
      if (approvers?.length) {
        const { error: notifError } = await admin.from("notifications").insert(
          approvers.map((p) => ({
            user_id: p.id,
            type: "warning",
            message: `Nouveau compte en attente d'approbation : ${email}`,
            read: false,
          }))
        )
        if (notifError) console.error("[signup-alert] in-app notification failed:", notifError.message)
      }
    } else {
      console.warn("[signup-alert] SUPABASE_SERVICE_ROLE_KEY not set — only ADMIN_ALERT_EMAILS will be alerted")
    }

    recipients.delete(email.toLowerCase())
    if (recipients.size === 0) {
      console.warn("[signup-alert] no approver email found for new user", userId)
      return
    }

    const usersUrl = `${siteUrl(origin)}/dashboard/users`
    const when = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" })

    const html = emailLayout({
      title: "Nouveau compte en attente d'approbation",
      body: `
        <p style="margin:0 0 12px">Une nouvelle personne vient de créer un compte sur l'intranet EEAM Rabat.</p>
        <table style="font-size:14px;border-collapse:collapse;margin:8px 0">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td style="padding:4px 0;font-weight:600">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Date</td><td style="padding:4px 0">${escapeHtml(when)}</td></tr>
        </table>
        <p style="margin:12px 0 0">Merci d'approuver ou de refuser cet accès depuis la page Utilisateurs.</p>`,
      ctaLabel: "Examiner le compte",
      ctaUrl: usersUrl,
    })

    // One email per recipient so admins don't see each other's addresses
    await Promise.all(
      [...recipients].map((to) =>
        sendEmail({ to, subject: `Nouveau compte à approuver : ${email}`, html })
      )
    )
  } catch (err) {
    console.error("[signup-alert] unexpected failure:", err)
  }
}

/** Tells a user their account was approved. Never throws. */
export async function notifyUserApproved({ email, fullName, origin }: { email: string; fullName?: string | null; origin?: string | null }) {
  const html = emailLayout({
    title: "Votre compte est approuvé",
    body: `<p style="margin:0">Bonjour${fullName ? ` ${escapeHtml(fullName)}` : ""},</p>
      <p>Votre accès à l'intranet EEAM Rabat a été approuvé. Vous pouvez maintenant vous connecter.</p>`,
    ctaLabel: "Accéder au tableau de bord",
    ctaUrl: `${siteUrl(origin)}/dashboard`,
  })
  return sendEmail({ to: email, subject: "Votre compte EEAM Rabat est approuvé", html })
}
