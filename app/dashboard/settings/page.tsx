import { createSupabaseServerClient } from "@/lib/supabase/server"
import SettingsClient from "./SettingsClient"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) { redirect("/auth/login") }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const role = profile?.role ?? null

  // Server-side role guard
  if (!role || !["admin", "pastor"].includes(role.trim().toLowerCase())) {
    redirect("/dashboard")
  }

  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")

  const settingsMap: Record<string, string> = Object.fromEntries(
    (settings ?? []).map((s: { key: string; value: string }) => [s.key, s.value])
  )

  return <SettingsClient role={role} initialSettings={settingsMap} />
}
