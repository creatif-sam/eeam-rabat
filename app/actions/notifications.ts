"use server"

import { after } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { notify } from "@/lib/notifications/server"

/**
 * Bell + push notification actions for the logged-in user. They run on the
 * server (the session cookie isn't readable by the browser client).
 */

export type BellNotification = {
  id: string
  type: "info" | "success" | "warning"
  message: string
  read: boolean
  created_at: string
  link: string | null
}

async function session() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, db: createSupabaseAdminClient() ?? supabase }
}

export async function getMyNotifications(): Promise<{ items: BellNotification[] }> {
  const { user, db } = await session()
  if (!user) return { items: [] }
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30)
  if (error) {
    console.error("[bell] load:", error.message)
    return { items: [] }
  }
  return {
    items: (data ?? []).map((n) => ({
      id: n.id,
      type: n.type ?? "info",
      message: n.message ?? "",
      read: !!n.read,
      created_at: n.created_at,
      link: n.link ?? null,
    })),
  }
}

export async function markNotificationsRead(ids?: string[]): Promise<{ ok: boolean }> {
  const { user, db } = await session()
  if (!user) return { ok: false }
  let q = db.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
  if (ids?.length) q = q.in("id", ids)
  const { error } = await q
  return { ok: !error }
}

export async function deleteNotification(id: string): Promise<{ ok: boolean }> {
  const { user, db } = await session()
  if (!user) return { ok: false }
  const { error } = await db.from("notifications").delete().eq("id", id).eq("user_id", user.id)
  return { ok: !error }
}

/* ---------------- Web push subscriptions ---------------- */

type SubscriptionJSON = { endpoint?: string; keys?: { p256dh?: string; auth?: string } }

export async function savePushSubscription(sub: SubscriptionJSON, userAgent?: string): Promise<{ ok: boolean; error?: string }> {
  const { user, db } = await session()
  if (!user) return { ok: false, error: "Session expirée." }
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth || !/^https:\/\//.test(sub.endpoint)) {
    return { ok: false, error: "Abonnement invalide." }
  }
  const { error } = await db.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      user_agent: (userAgent ?? "").slice(0, 300) || null,
    },
    { onConflict: "endpoint" }
  )
  if (error) {
    console.error("[push] save:", error.message)
    return { ok: false, error: "Impossible d'activer les notifications sur cet appareil." }
  }
  return { ok: true }
}

export async function removePushSubscription(endpoint: string): Promise<{ ok: boolean }> {
  const { user, db } = await session()
  if (!user) return { ok: false }
  const { error } = await db.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id)
  return { ok: !error }
}

/* ---------------- Broadcast a change to all members ---------------- */

export type ChangeKind =
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "formation_created"
  | "resource_added"

const CHANGES: Record<ChangeKind, { title: string; url: string; type: "info" | "warning" | "success" }> = {
  event_created: { title: "Nouvel événement", url: "/dashboard/events", type: "info" },
  event_updated: { title: "Événement modifié", url: "/dashboard/events", type: "info" },
  event_deleted: { title: "Événement annulé", url: "/dashboard/events", type: "warning" },
  formation_created: { title: "Nouvelle formation", url: "/dashboard/formations", type: "success" },
  resource_added: { title: "Nouvelle ressource", url: "/dashboard/ressources", type: "info" },
}

const lastBroadcast = new Map<string, number>()

/** Called by dashboard pages after a successful change; notifies every member. */
export async function announceChange(kind: ChangeKind, label: string): Promise<{ ok: boolean }> {
  const cfg = CHANGES[kind]
  if (!cfg) return { ok: false }
  const { user, db } = await session()
  if (!user) return { ok: false }

  // Only approved members / leaders may trigger broadcasts
  const { data: me } = await db.from("profiles").select("role, approved, full_name").eq("id", user.id).maybeSingle()
  const role = String(me?.role ?? "").toLowerCase()
  if (!me || !(me.approved || ["admin", "pastor", "corps_pastoral", "treasurer"].includes(role))) return { ok: false }

  // Light anti-spam: same user + same item within 30 s is ignored
  const key = `${user.id}:${kind}:${label}`
  const now = Date.now()
  if (now - (lastBroadcast.get(key) ?? 0) < 30_000) return { ok: true }
  lastBroadcast.set(key, now)

  const body = String(label ?? "").trim().slice(0, 140)
  after(() => notify({ audience: "members", title: cfg.title, body, url: cfg.url, type: cfg.type, excludeUserId: user.id }))
  return { ok: true }
}
