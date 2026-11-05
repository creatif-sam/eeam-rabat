"use server"

import { after } from "next/server"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { notifyApproversOfSignup } from "@/lib/accounts/notify"
import { CAPTCHA_ERROR, isHuman } from "@/lib/turnstile"

/** Supabase auth errors are in English — show French messages instead. */
function frenchAuthError(message: string) {
  if (/already registered|already exists/i.test(message)) return "Un compte existe déjà avec cette adresse e-mail."
  if (/at least \d+ characters|password should/i.test(message)) return "Le mot de passe est trop court (8 caractères minimum recommandés)."
  if (/invalid email|email address .* invalid/i.test(message)) return "Adresse e-mail invalide."
  if (/rate limit|too many/i.test(message)) return "Trop de tentatives. Réessayez dans quelques minutes."
  if (/weak|pwned|compromised/i.test(message)) return "Ce mot de passe est trop faible. Choisissez-en un plus sûr."
  return "Impossible de créer le compte pour le moment. Veuillez réessayer."
}

export type SignUpResult = { ok: true } | { ok: false; error: string }

async function requestOrigin() {
  const h = await headers()
  const origin = h.get("origin")
  if (origin) return origin
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  return host ? `${proto}://${host}` : null
}

export async function signUpAction(email: string, password: string, turnstileToken: string | null): Promise<SignUpResult> {
  if (!(await isHuman(turnstileToken))) return { ok: false, error: CAPTCHA_ERROR }

  const cleanEmail = (email ?? "").trim().toLowerCase()
  if (!cleanEmail || !password) {
    return { ok: false, error: "Email et mot de passe requis" }
  }

  const origin = await requestOrigin()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      // Lands on our confirm route, which signs the user in and sends them
      // straight to profile setup → pending approval.
      emailRedirectTo: origin ? `${origin}/auth/confirm?next=/profile/setup` : undefined,
    },
  })

  if (error) return { ok: false, error: frenchAuthError(error.message) }

  const user = data.user
  // Supabase returns a user with no identities when the email is already
  // registered (anti-enumeration). Don't alert admins in that case.
  const isNewAccount = !!user && (user.identities?.length ?? 0) > 0

  if (user && isNewAccount) {
    // Run after the response is sent so sign-up stays fast.
    after(async () => {
      const admin = createSupabaseAdminClient()
      if (admin) {
        // Make sure a profile row exists so the account shows up in
        // "Utilisateurs" for approval immediately (no-op if a trigger made it).
        const { error: profileError } = await admin
          .from("profiles")
          .upsert({ id: user.id, email: cleanEmail }, { onConflict: "id" })
        if (profileError) console.error("[sign-up] profile upsert failed:", profileError.message)
      }
      await notifyApproversOfSignup({ userId: user.id, email: cleanEmail, origin })
    })
  }

  return { ok: true }
}
