import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              maxAge: Math.min(options?.maxAge ?? Infinity, 8 * 60 * 60),
            })
          } catch {
            // Cookie writes are not allowed from all server contexts (e.g. Server Components).
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete({ name, ...options })
          } catch {
            // Cookie deletes are not allowed from all server contexts (e.g. Server Components).
          }
        }
      }
    }
  )
}
