"use server"

import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { CAPTCHA_ERROR, isHuman } from "@/lib/turnstile"

export async function requestPasswordReset(
  email: string,
  turnstileToken: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isHuman(turnstileToken))) return { ok: false, error: CAPTCHA_ERROR }

  const cleanEmail = (email ?? "").trim().toLowerCase()
  if (!cleanEmail) return { ok: false, error: "Adresse e-mail requise." }

  const h = await headers()
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    h.get("origin") ||
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    // Must be listed in Supabase > Auth > URL configuration > Redirect URLs
    redirectTo: `${origin.replace(/\/$/, "")}/auth/update-password`,
  })

  if (error) {
    console.error("[forgot-password]", error.message)
    return { ok: false, error: "Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard." }
  }
  return { ok: true }
}
