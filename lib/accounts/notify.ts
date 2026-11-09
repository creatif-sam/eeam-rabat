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
 * Welcomes someone an administrator just gave access to. Deliberately does
 * NOT contain the temporary password: the administrator hands that over
 * through another channel, so a leaked mailbox alone is not enough.
 */
export async function notifyUserInvited({ email, fullName, origin }: { email: string; fullName?: string | null; origin?: string | null }) {
  const html = emailLayout({
    title: "Votre accès à l'intranet EEAM Rabat",
    body: `<p style="margin:0">Bonjour${fullName ? ` ${escapeHtml(fullName)}` : ""},</p>
      <p>Un administrateur vous a donné accès à l'intranet EEAM Rabat avec l'adresse <strong>${escapeHtml(email)}</strong>.</p>
      <p>Il vous transmettra un mot de passe temporaire. À votre première connexion, vous choisirez votre propre mot de passe.</p>`,
    ctaLabel: "Se connecter",
    ctaUrl: `${siteUrl(origin)}/auth/login`,
  })
  return sendEmail({ to: email, subject: "Votre accès à l'intranet EEAM Rabat", html })
}
