import webpush from "web-push"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

/**
 * Server-only fan-out: writes a row in `notifications` for every recipient
 * (the bell in the dashboard) and sends a web push to each of their devices.
 * Never throws — a failed notification must not break the action that
 * triggered it.
 */

export type Audience = "members" | "leaders"
export type NotifType = "info" | "success" | "warning"

const PRIVILEGED = ["admin", "pastor", "corps_pastoral", "treasurer"]
const LEADERS = ["admin", "pastor", "corps_pastoral"]

let vapidReady: boolean | null = null
function pushEnabled() {
  if (vapidReady !== null) return vapidReady
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return (vapidReady = false)
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:cpeeamrabat@gmail.com", pub, priv)
  return (vapidReady = true)
}

export async function notify(opts: {
  audience: Audience
  title: string
  body?: string
  url?: string
  type?: NotifType
  excludeUserId?: string | null
}) {
  try {
    const admin = createSupabaseAdminClient()
    if (!admin) {
      console.warn("[notify] SUPABASE_SERVICE_ROLE_KEY missing — notification skipped")
      return
    }

    // Recipients
    const { data: profiles, error } = await admin.from("profiles").select("id, role, approved")
    if (error) {
      console.error("[notify] recipients:", error.message)
      return
    }
    const recipients = (profiles ?? [])
      .filter((p) => {
        const role = String(p.role ?? "").trim().toLowerCase()
        if (opts.audience === "leaders") return LEADERS.includes(role)
        return p.approved === true || PRIVILEGED.includes(role)
      })
      .map((p) => p.id as string)
      .filter((id) => id !== opts.excludeUserId)
    if (!recipients.length) return

    // 1) Bell notifications
    const message = opts.body ? `${opts.title} — ${opts.body}` : opts.title
    const rows = recipients.map((user_id) => ({
      user_id,
      type: opts.type ?? "info",
      message: message.slice(0, 300),
      read: false,
      link: opts.url ?? null,
    }))
    let { error: insertError } = await admin.from("notifications").insert(rows)
    if (insertError && /link/i.test(insertError.message)) {
      // `link` column not added yet: insert without it
      ;({ error: insertError } = await admin.from("notifications").insert(rows.map(({ link: _l, ...r }) => r)))
    }
    if (insertError) console.error("[notify] insert:", insertError.message)

    // 2) Web push
    if (!pushEnabled()) return
    const { data: subs, error: subsError } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, keys")
      .in("user_id", recipients)
    if (subsError || !subs?.length) return

    const payload = JSON.stringify({ title: opts.title, body: opts.body ?? "", url: opts.url ?? "/dashboard" })
    const expired: string[] = []
    await Promise.allSettled(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 60 * 60 * 24 })
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode
          if (status === 404 || status === 410) expired.push(s.id)
          else console.warn("[notify] push failed:", status ?? err)
        }
      })
    )
    if (expired.length) await admin.from("push_subscriptions").delete().in("id", expired)
  } catch (err) {
    console.error("[notify] unexpected:", err)
  }
}
