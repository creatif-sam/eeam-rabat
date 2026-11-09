import { emailLayout, escapeHtml, sendEmail } from "@/lib/email/resend"

function siteUrl(origin?: string | null) {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    origin ||
    (vercel ? `https://${vercel}` : "http://localhost:3000")
  ).replace(/\/$/, "")
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

/**
 * Sends someone their temporary password (new access or reset). The
 * password only works once: the app forces them to replace it at sign-in.
 */
export async function notifyTempPassword({
  email,
  fullName,
  tempPassword,
  isNew,
  origin,
}: {
  email: string
  fullName?: string | null
  tempPassword: string
  isNew: boolean
  origin?: string | null
}) {
  const html = emailLayout({
    title: isNew ? "Votre accès à l'intranet EEAM Rabat" : "Votre nouveau mot de passe temporaire",
    body: `<p style="margin:0">Bonjour${fullName ? ` ${escapeHtml(fullName)}` : ""},</p>
      <p>${isNew
        ? "Un administrateur vous a donné accès à l'intranet EEAM Rabat."
        : "Un administrateur a réinitialisé votre mot de passe pour l'intranet EEAM Rabat."}</p>
      <table style="font-size:14px;border-collapse:collapse;margin:8px 0 4px">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">E-mail</td><td style="padding:4px 0;font-weight:600">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Mot de passe temporaire</td><td style="padding:4px 0"><code style="font-family:Consolas,Menlo,monospace;font-size:17px;font-weight:700;letter-spacing:1px;background:#edfbfd;border:1px solid #bbe8ec;border-radius:6px;padding:4px 8px">${escapeHtml(tempPassword)}</code></td></tr>
      </table>
      <p>À votre première connexion, vous choisirez votre propre mot de passe. Ce mot de passe temporaire ne fonctionnera plus ensuite.</p>
      <p style="font-size:13px;color:#6b7280">Si vous n'attendiez pas cet e-mail, prévenez un administrateur de l'église.</p>`,
    ctaLabel: "Se connecter",
    ctaUrl: `${siteUrl(origin)}/auth/login`,
  })
  return sendEmail({
    to: email,
    subject: isNew ? "Votre accès à l'intranet EEAM Rabat" : "Votre nouveau mot de passe EEAM Rabat",
    html,
  })
}
