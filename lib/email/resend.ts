import { Resend } from "resend"

export const EMAIL_FROM = "EEAM Rabat <eeam-rabat@samuelgyasi.com>"

let client: Resend | null = null

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  client ??= new Resend(process.env.RESEND_API_KEY)
  return client
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Sends one email. Never throws — returns false and logs on failure. */
export async function sendEmail(opts: { to: string | string[]; subject: string; html: string }) {
  const resend = getResend()
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — email not sent:", opts.subject)
    return false
  }
  try {
    const { error } = await resend.emails.send({ from: EMAIL_FROM, ...opts })
    if (error) {
      console.error("[email] Resend error:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("[email] Resend request failed:", err)
    return false
  }
}

/** Minimal branded layout shared by transactional emails. */
export function emailLayout({ title, body, ctaLabel, ctaUrl }: { title: string; body: string; ctaLabel?: string; ctaUrl?: string }) {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="margin:28px 0 8px"><a href="${ctaUrl}" style="background:#28868f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">${escapeHtml(ctaLabel)}</a></p>`
      : ""
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Roboto,Segoe UI,Arial,sans-serif;color:#1f2937">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:#b72736;color:#fff;border-radius:14px 14px 0 0;padding:18px 24px;font-weight:700;font-size:18px">EEAM Rabat</div>
    <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px;border:1px solid #e5e7eb;border-top:0">
      <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
      ${body}
      ${cta}
    </div>
    <p style="font-size:12px;color:#6b7280;text-align:center;margin-top:16px">Message automatique — merci de ne pas répondre.</p>
  </div></body></html>`
}
