import { headers } from "next/headers"

// Cloudflare's official "always passes" test secret, used only outside
// production so local development works without real keys.
const TEST_SECRET = "1x0000000000000000000000000000000AA"
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export const CAPTCHA_ERROR = "Vérification anti-robot échouée. Veuillez réessayer."

function secret() {
  if (process.env.TURNSTILE_SECRET_KEY) return process.env.TURNSTILE_SECRET_KEY
  if (process.env.NODE_ENV !== "production") return TEST_SECRET
  return null
}

/** Validates a Turnstile token with Cloudflare. Server-only. */
export async function verifyTurnstile(token: unknown, remoteip?: string | null): Promise<boolean> {
  const key = secret()
  if (!key) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set — rejecting submission")
    return false
  }
  if (typeof token !== "string" || !token || token.length > 2048) return false

  const body = new URLSearchParams({ secret: key, response: token })
  if (remoteip) body.set("remoteip", remoteip)

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store" })
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] }
    if (!data.success) console.warn("[turnstile] rejected:", data["error-codes"])
    return !!data.success
  } catch (err) {
    console.error("[turnstile] verification request failed:", err)
    return false
  }
}

/** Visitor IP from the incoming request headers (server actions / route handlers). */
export async function requestIp(req?: Request) {
  const h = req ? req.headers : await headers()
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

/** Convenience for server actions: true when the token is valid for this request. */
export async function isHuman(token: unknown) {
  return verifyTurnstile(token, await requestIp())
}
