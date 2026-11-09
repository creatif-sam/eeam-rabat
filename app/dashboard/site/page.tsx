import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import PublicSiteHub, { type SiteTab } from "@/components/dashboard/site/PublicSiteHub"
import {
  ANNOUNCEMENT_COLUMNS,
  YEAR_THEME_KEYS,
  settingsToTheme,
  sortAnnouncements,
  type Announcement,
} from "@/lib/site/announcements"
import { HERO_IMAGE_KEYS, HERO_KEYS, settingsToHero, settingsToHeroImages } from "@/lib/site/hero"

/** Everything that changes the public website, in one place. */
const EDITOR_ROLES = ["admin", "pastor", "corps_pastoral"]
/** Public form passwords are more sensitive. */
const FORM_ACCESS_ROLES = ["admin", "pastor"]

export default async function PublicSitePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const role = (profile?.role ?? "").trim().toLowerCase()
  if (!EDITOR_ROLES.includes(role)) redirect("/dashboard")
  const canEditFormAccess = FORM_ACCESS_ROLES.includes(role)

  const [settings, announcements, appSettings] = await Promise.all([
    supabase.from("site_settings").select("key, value").in("key", [...Object.values(YEAR_THEME_KEYS), ...Object.values(HERO_KEYS), ...Object.values(HERO_IMAGE_KEYS)]),
    supabase.from("site_announcements").select(ANNOUNCEMENT_COLUMNS),
    canEditFormAccess ? supabase.from("app_settings").select("key, value") : Promise.resolve({ data: [] }),
  ])

  const formSettings: Record<string, string> = Object.fromEntries(
    ((appSettings.data ?? []) as { key: string; value: string }[]).map((s) => [s.key, s.value])
  )

  const requested = (await searchParams).tab
  const initialTab: SiteTab =
    requested === "formulaires" && canEditFormAccess ? "formulaires" : requested === "annonces" ? "annonces" : "banniere"

  return (
    <PublicSiteHub
      initialTab={initialTab}
      userId={user.id}
      role={role}
      canEditFormAccess={canEditFormAccess}
      setupMissing={!!(settings.error || announcements.error)}
      initialTheme={settingsToTheme(settings.data)}
      initialAnnouncements={sortAnnouncements((announcements.data ?? []) as Announcement[])}
      initialHero={settingsToHero(settings.data)}
      initialHeroImages={settingsToHeroImages(settings.data)}
      formSettings={formSettings}
    />
  )
}
