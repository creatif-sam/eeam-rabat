"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ANNOUNCEMENT_COLUMNS, YEAR_THEME_KEYS, type Announcement, type YearTheme } from "@/lib/site/announcements"

/**
 * Writes for the "Annonces" page. They run on the server, where the session
 * cookie (httpOnly) is readable, so Supabase sees the logged-in user and the
 * is_site_editor() RLS policies apply. The browser client can't read that
 * cookie and would be treated as anonymous.
 */

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

async function editor() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null }
  return { supabase, user }
}

const fail = (message: string): Result<never> => ({ ok: false, error: message })

export async function saveYearTheme(theme: YearTheme): Promise<Result> {
  const { supabase, user } = await editor()
  if (!user) return fail("Session expirée. Reconnectez-vous.")
  const now = new Date().toISOString()
  const rows = [
    { key: YEAR_THEME_KEYS.label, value: (theme.label ?? "").trim().slice(0, 80) },
    { key: YEAR_THEME_KEYS.theme, value: (theme.theme ?? "").trim().slice(0, 160) },
    { key: YEAR_THEME_KEYS.reference, value: (theme.reference ?? "").trim().slice(0, 80) },
  ].map((r) => ({ ...r, updated_at: now, updated_by: user.id }))

  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" })
  return error ? fail(error.message) : { ok: true }
}

export type AnnouncementInput = Omit<Announcement, "id" | "created_at">

export async function saveAnnouncement(input: AnnouncementInput, id?: string): Promise<Result<Announcement>> {
  const { supabase, user } = await editor()
  if (!user) return fail("Session expirée. Reconnectez-vous.")

  const payload = {
    label: String(input.label ?? "").trim().slice(0, 24) || "Annonce",
    tone: ["info", "urgent", "event", "success"].includes(input.tone) ? input.tone : "info",
    message: String(input.message ?? "").trim().slice(0, 220),
    link_url: input.link_url ? String(input.link_url).trim().slice(0, 500) : null,
    link_label: input.link_label ? String(input.link_label).trim().slice(0, 30) : null,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    is_active: !!input.is_active,
    priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : 0,
    updated_at: new Date().toISOString(),
  }
  if (!payload.message) return fail("Le message est obligatoire.")

  const query = id
    ? supabase.from("site_announcements").update(payload).eq("id", id).select(ANNOUNCEMENT_COLUMNS).single()
    : supabase.from("site_announcements").insert({ ...payload, created_by: user.id }).select(ANNOUNCEMENT_COLUMNS).single()

  const { data, error } = await query
  if (error || !data) return fail(error?.message ?? "Erreur inconnue")
  return { ok: true, data: data as Announcement }
}

export async function setAnnouncementActive(id: string, active: boolean): Promise<Result> {
  const { supabase, user } = await editor()
  if (!user) return fail("Session expirée. Reconnectez-vous.")
  const { error } = await supabase
    .from("site_announcements")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", id)
  return error ? fail(error.message) : { ok: true }
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  const { supabase, user } = await editor()
  if (!user) return fail("Session expirée. Reconnectez-vous.")
  const { error } = await supabase.from("site_announcements").delete().eq("id", id)
  return error ? fail(error.message) : { ok: true }
}
