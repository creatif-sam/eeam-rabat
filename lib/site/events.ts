/** Public events: date helpers and recurrence expansion shared by the calendar and the hero. */

export type DbEvent = {
  id: string
  title: string
  description: string | null
  event_date: string // YYYY-MM-DD
  start_time: string | null // HH:MM or HH:MM:SS
  end_time: string | null
  location: string | null
  color: string | null // Tailwind bg class, e.g. "bg-blue-500"
  is_recurring: boolean | null
  recurring_type: string | null
  recurring_end_date: string | null
}

export type Occurrence = DbEvent & { key: string; date: Date; dateStr: string }

export const EVENT_COLUMNS =
  "id,title,description,event_date,start_time,end_time,location,color,is_recurring,recurring_type,recurring_end_date"

const DAY_MS = 86_400_000

/** "YYYY-MM-DD" → local Date (no UTC shift). */
export function parseLocalDate(s: string) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Local Date → "YYYY-MM-DD" (never toISOString, which converts to UTC). */
export function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "19:00:00" → "19h00" */
export function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  return `${Number(h)}h${m ?? "00"}`
}

export function fmtTimeRange(e: Pick<DbEvent, "start_time" | "end_time">) {
  const s = fmtTime(e.start_time)
  const end = fmtTime(e.end_time)
  if (!s) return "Toute la journée"
  return end ? `${s} – ${end}` : s
}

export function fmtLongDate(d: Date) {
  const s = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Add n months keeping the day, clamped to the target month's length (Jan 31 → Feb 28). */
function addMonthsClamped(start: Date, n: number) {
  const y = start.getFullYear()
  const m = start.getMonth() + n
  const last = new Date(y, m + 1, 0).getDate()
  return new Date(y, m, Math.min(start.getDate(), last))
}

/** All occurrences of every event that fall within [from, to] (inclusive, local days). */
export function expandEvents(events: DbEvent[], from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = []
  const push = (e: DbEvent, d: Date) => {
    const dateStr = toDateStr(d)
    out.push({ ...e, key: `${e.id}_${dateStr}`, date: d, dateStr })
  }

  for (const e of events) {
    const start = parseLocalDate(e.event_date)
    const type = e.is_recurring ? e.recurring_type : null

    if (!type || type === "none") {
      if (start >= from && start <= to) push(e, start)
      continue
    }

    const recurEnd = e.recurring_end_date ? parseLocalDate(e.recurring_end_date) : to
    const limit = recurEnd < to ? recurEnd : to
    if (start > limit) continue

    if (type === "daily" || type === "weekly") {
      const step = type === "daily" ? 1 : 7
      // Jump straight to the first occurrence in range instead of iterating from the series start
      const daysBetween = Math.round((from.getTime() - start.getTime()) / DAY_MS)
      let n = Math.max(0, Math.ceil(daysBetween / step))
      for (;;) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + n * step)
        if (d > limit) break
        if (d >= from) push(e, d)
        n++
      }
    } else if (type === "monthly" || type === "yearly") {
      const step = type === "monthly" ? 1 : 12
      const monthsBetween = (from.getFullYear() - start.getFullYear()) * 12 + (from.getMonth() - start.getMonth())
      let n = Math.max(0, Math.floor(monthsBetween / step) - 1)
      for (;;) {
        const d = addMonthsClamped(start, n * step)
        if (d > limit) break
        if (d >= from) push(e, d)
        n++
      }
    } else if (start >= from && start <= to) {
      push(e, start)
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || (a.start_time ?? "").localeCompare(b.start_time ?? ""))
}
