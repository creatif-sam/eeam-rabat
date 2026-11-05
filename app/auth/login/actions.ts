"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { CAPTCHA_ERROR, isHuman } from "@/lib/turnstile"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Turnstile adds its token to the form as "cf-turnstile-response"
  if (!(await isHuman(formData.get("cf-turnstile-response")))) {
    throw new Error(CAPTCHA_ERROR)
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error("Email ou mot de passe incorrect")
  }

  redirect("/dashboard")
}
