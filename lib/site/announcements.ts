export type AnnouncementTone = "info" | "urgent" | "event" | "success"

export type Announcement = {
  id: string
  label: string
  tone: AnnouncementTone
  message: string
  link_url: string | null
  link_label: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  priority: number
  created_at: string
}

export type YearTheme = {
  label: string
  theme: string
  reference: string
}

export const YEAR_THEME_KEYS = {
  label: "year_label",
  theme: "year_theme",
  reference: "year_theme_reference",
} as const

/** Badge styles for the public bar (Tailwind) and dashboard (hex). */
export const TONES: Record<AnnouncementTone, { name: string; badge: string; hex: string }> = {
  info: { name: "Information", badge: "bg-sky-500 text-white", hex: "#4ec2cd" },
  urgent: { name: "Urgent", badge: "bg-rose-600 text-white", hex: "#b72736" },
  event: { name: "Événement", badge: "bg-amber-400 text-gray-900", hex: "#f59e0b" },
  success: { name: "Bonne nouvelle", badge: "bg-emerald-500 text-white", hex: "#10b981" },
}

export const ANNOUNCEMENT_COLUMNS =
  "id, label, tone, message, link_url, link_label, starts_at, ends_at, is_active, priority, created_at"

export function settingsToTheme(rows: { key: string; value: string }[] | null | undefined): YearTheme {
  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value ?? ""]))
  return {
    label: map[YEAR_THEME_KEYS.label] ?? "",
    theme: map[YEAR_THEME_KEYS.theme] ?? "",
    reference: map[YEAR_THEME_KEYS.reference] ?? "",
  }
}

/** Is the announcement currently visible to the public? */
export function isLive(a: Pick<Announcement, "is_active" | "starts_at" | "ends_at">, now = new Date()) {
  if (!a.is_active) return false
  if (a.starts_at && new Date(a.starts_at) > now) return false
  if (a.ends_at && new Date(a.ends_at) <= now) return false
  return true
}

export function sortAnnouncements<T extends Pick<Announcement, "priority" | "created_at">>(list: T[]) {
  return [...list].sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at))
}
