import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import AnnouncementsManager from "@/components/dashboard/annonces/AnnouncementsManager"
import {
  ANNOUNCEMENT_COLUMNS,
  YEAR_THEME_KEYS,
  settingsToTheme,
  sortAnnouncements,
  type Announcement,
} from "@/lib/site/announcements"

const EDITOR_ROLES = ["admin", "pastor", "corps_pastoral"]

export default async function AnnoncesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!EDITOR_ROLES.includes((profile?.role ?? "").trim().toLowerCase())) redirect("/dashboard")

  const [settings, announcements] = await Promise.all([
    supabase.from("site_settings").select("key, value").in("key", Object.values(YEAR_THEME_KEYS)),
    supabase.from("site_announcements").select(ANNOUNCEMENT_COLUMNS),
  ])

  const setupMissing = !!(settings.error || announcements.error)

  return (
    <AnnouncementsManager
      userId={user.id}
      setupMissing={setupMissing}
      initialTheme={settingsToTheme(settings.data)}
      initialAnnouncements={sortAnnouncements((announcements.data ?? []) as Announcement[])}
    />
  )
}
