"use server"

import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { notifyUserApproved } from "@/lib/accounts/notify"

const APPROVER_ROLES = ["admin", "pastor", "corps_pastoral"]

/** Emails a user that their account was approved. Caller must be an approver. */
export async function sendApprovalEmail(profileId: string): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!APPROVER_ROLES.includes((me?.role ?? "").trim().toLowerCase())) return { ok: false }

  const { data: target } = await supabase
    .from("profiles")
    .select("id, email, full_name, approved")
    .eq("id", profileId)
    .maybeSingle()
  if (!target?.approved) return { ok: false }

  let email: string | null = target.email ?? null
  if (!email) {
    const admin = createSupabaseAdminClient()
    const { data } = (await admin?.auth.admin.getUserById(profileId)) ?? { data: null }
    email = data?.user?.email ?? null
  }
  if (!email) return { ok: false }

  const origin = (await headers()).get("origin")
  const ok = await notifyUserApproved({ email, fullName: target.full_name, origin })
  return { ok }
}
