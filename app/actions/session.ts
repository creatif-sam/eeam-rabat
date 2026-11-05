"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type BrowserSession = {
  accessToken: string
  /** Unix seconds */
  expiresAt: number
  user: { id: string; email: string | null; user_metadata: Record<string, unknown> }
} | null

/**
 * Gives the browser Supabase client the current short-lived access token.
 * The refresh token stays in the httpOnly cookie and never reaches
 * JavaScript; the proxy refreshes the session on every request.
 */
export async function getBrowserSession(): Promise<BrowserSession> {
  const supabase = await createSupabaseServerClient()
  // getUser() validates the token with Supabase (getSession alone doesn't)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return null
  return {
    accessToken: session.access_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + 300,
    user: { id: user.id, email: user.email ?? null, user_metadata: user.user_metadata ?? {} },
  }
}
