"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

/**
 * Formulaires tab data. Runs on the server with the logged-in session, so it
 * works regardless of the browser client (which can't read the httpOnly
 * session cookie) and keeps the request tables closed to anonymous visitors.
 */

const TABLES = ["volunteer_requests", "prayer_requests", "commission_requests", "group_join_requests"] as const
type RequestTable = (typeof TABLES)[number]
type Status = "pending" | "processed" | "all"

const PRIVILEGED = ["admin", "pastor", "corps_pastoral", "treasurer"]
// Column list / embedded relation, e.g. "id, full_name, groupes_commissions(name)" or "*"
const SELECT_RE = /^[\w\s,*()]+$/

async function access() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: me } = await supabase.from("profiles").select("role, approved").eq("id", user.id).maybeSingle()
  const role = String(me?.role ?? "").trim().toLowerCase()
  if (!me || !(me.approved || PRIVILEGED.includes(role))) return null
  return createSupabaseAdminClient() ?? supabase
}

export async function listRequests(
  table: string,
  select: string,
  status: Status
): Promise<{ ok: true; rows: Record<string, unknown>[] } | { ok: false; error: string }> {
  if (!TABLES.includes(table as RequestTable) || !SELECT_RE.test(select)) return { ok: false, error: "Requête invalide." }
  const db = await access()
  if (!db) return { ok: false, error: "Accès refusé. Reconnectez-vous." }

  let q = db.from(table).select(select).order("created_at", { ascending: false }).limit(500)
  if (status === "pending") q = q.eq("processed", false)
  if (status === "processed") q = q.eq("processed", true)

  const { data, error } = await q
  if (error) {
    console.error(`[formulaires] ${table}:`, error.message)
    return { ok: false, error: "Impossible de charger les demandes." }
  }
  return { ok: true, rows: (data ?? []) as unknown as Record<string, unknown>[] }
}

export async function setRequestProcessed(table: string, id: string, processed: boolean): Promise<{ ok: boolean; error?: string }> {
  if (!TABLES.includes(table as RequestTable)) return { ok: false, error: "Requête invalide." }
  const db = await access()
  if (!db) return { ok: false, error: "Accès refusé. Reconnectez-vous." }
  const { error } = await db.from(table).update({ processed }).eq("id", id)
  if (error) {
    console.error(`[formulaires] update ${table}:`, error.message)
    return { ok: false, error: "Échec de la mise à jour." }
  }
  return { ok: true }
}

/** Pending counts for the tab badges. */
export async function pendingCounts(): Promise<Record<string, number>> {
  const db = await access()
  if (!db) return {}
  const today = new Date().toISOString().slice(0, 10)
  const count = async (table: string) => {
    const { count, error } = await db.from(table).select("id", { count: "exact", head: true }).eq("processed", false)
    return error ? undefined : count ?? 0
  }
  const [volunteer, group, prayer, request, pastoral] = await Promise.all([
    count("volunteer_requests"),
    count("group_join_requests"),
    count("prayer_requests"),
    count("commission_requests"),
    db
      .from("pastoral_counselling")
      .select("id", { count: "exact", head: true })
      .not("confirmed", "is", true)
      .gte("counselling_date", today)
      .then((r) => (r.error ? undefined : r.count ?? 0)),
  ])
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries({ volunteer, group, prayer, request, pastoral })) if (v !== undefined) out[k] = v
  return out
}
