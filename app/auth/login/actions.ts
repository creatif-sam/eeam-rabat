"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { CAPTCHA_ERROR, isHuman } from "@/lib/turnstile"

export type LoginResult = { ok: true } | { ok: false; error: string }

/**
 * Returns a result instead of redirecting: a server-side redirect() is
 * delivered as a thrown signal, which the form's error handling caught and
 * reported as a failed login even though the sign-in had succeeded.
 */
export async function login(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  // Turnstile adds its token to the form as "cf-turnstile-response"
  if (!(await isHuman(formData.get("cf-turnstile-response")))) {
    return { ok: false, error: CAPTCHA_ERROR }
  }

  if (!email || !password) return { ok: false, error: "Veuillez saisir votre email et votre mot de passe." }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (/not confirmed/i.test(error.message)) {
      return { ok: false, error: "Veuillez d'abord confirmer votre adresse e-mail (lien reçu par e-mail)." }
    }
    if (/rate limit|too many/i.test(error.message)) {
      return { ok: false, error: "Trop de tentatives. Réessayez dans quelques minutes." }
    }
    return { ok: false, error: "Email ou mot de passe incorrect." }
  }

  return { ok: true }
}
