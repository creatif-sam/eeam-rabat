import { createSupabaseServerClient } from "@/lib/supabase/server"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle()

  const role = profile?.role ?? null

  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")

  const settingsMap: Record<string, string> = Object.fromEntries(
    (settings ?? []).map((s: { key: string; value: string }) => [s.key, s.value])
  )

  return <SettingsClient role={role} initialSettings={settingsMap} />
}
