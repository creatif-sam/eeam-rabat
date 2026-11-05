"use server"

import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { notifyUserApproved } from "@/lib/accounts/notify"
import { DELETE_PHRASE, deletionName } from "@/lib/accounts/delete"

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

/**
 * Permanently deletes a user's account (auth user + profile).
 * Administrators only. Both typed confirmations are re-checked here.
 */
export async function deleteUserAccount(
  targetId: string,
  typedName: string,
  typedPhrase: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Session expirée. Reconnectez-vous." }

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if ((me?.role ?? "").trim().toLowerCase() !== "admin") {
    return { ok: false, error: "Seuls les administrateurs peuvent supprimer un compte." }
  }
  if (targetId === user.id) return { ok: false, error: "Vous ne pouvez pas supprimer votre propre compte." }

  const admin = createSupabaseAdminClient()
  if (!admin) {
    return { ok: false, error: "Suppression indisponible : la clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée." }
  }

  const { data: target } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", targetId)
    .maybeSingle()

  let email = target?.email ?? null
  if (!email) {
    const { data } = await admin.auth.admin.getUserById(targetId)
    email = data.user?.email ?? null
  }
  const expectedName = deletionName({ full_name: target?.full_name ?? null, email })
  if (!expectedName) return { ok: false, error: "Compte introuvable." }

  if ((typedName ?? "").trim() !== expectedName) return { ok: false, error: "Le nom saisi ne correspond pas." }
  if ((typedPhrase ?? "").trim().toLowerCase() !== DELETE_PHRASE) {
    return { ok: false, error: `Veuillez saisir « ${DELETE_PHRASE} » pour confirmer.` }
  }

  // Never remove the last administrator
  if ((target?.role ?? "").trim().toLowerCase() === "admin") {
    const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin")
    if ((count ?? 0) <= 1) return { ok: false, error: "Impossible de supprimer le dernier administrateur." }
  }

  // Profile photo (best effort)
  await admin.storage.from("avatars").remove(["jpg", "png", "webp", "jpeg"].map((ext) => `${targetId}.${ext}`))

  const { error: authError } = await admin.auth.admin.deleteUser(targetId)
  if (authError && !/not found/i.test(authError.message)) {
    console.error("[users] delete auth user:", authError.message)
    return {
      ok: false,
      error:
        "Suppression impossible : ce compte est encore lié à des données (transactions, tâches…). Vous pouvez plutôt révoquer son accès.",
    }
  }

  // Remove the profile if it wasn't cascaded with the auth user
  await admin.from("profiles").delete().eq("id", targetId)

  await supabase.from("activity_logs").insert({
    actor_user_id: user.id,
    action: "user_deleted",
    entity_type: "profiles",
    entity_id: targetId,
    description: `Deleted account of ${expectedName}`,
    metadata: { target_user_id: targetId, target_email: email },
  })

  return { ok: true }
}

export type UserDetails = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string | null
  church: string | null
  approved: boolean | null
  completed: boolean | null
  avatar_url: string | null
  created_at: string | null
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

/** Full details of one account (incl. email from auth). Admins and pastors only. */
export async function getUserDetails(targetId: string): Promise<{ ok: true; data: UserDetails } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Session expirée. Reconnectez-vous." }

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!APPROVER_ROLES.includes((me?.role ?? "").trim().toLowerCase())) return { ok: false, error: "Accès réservé." }

  const admin = createSupabaseAdminClient()
  const db = admin ?? supabase
  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, email, phone, role, church, approved, completed, avatar_url, created_at")
    .eq("id", targetId)
    .maybeSingle()

  let authUser: { email?: string | null; created_at?: string | null; last_sign_in_at?: string | null; email_confirmed_at?: string | null } | null = null
  if (admin) {
    const { data } = await admin.auth.admin.getUserById(targetId)
    authUser = data.user ?? null
  }
  if (!profile && !authUser) return { ok: false, error: "Compte introuvable." }

  return {
    ok: true,
    data: {
      id: targetId,
      full_name: profile?.full_name ?? null,
      email: authUser?.email ?? profile?.email ?? null,
      phone: profile?.phone ?? null,
      role: profile?.role ?? null,
      church: profile?.church ?? null,
      approved: profile?.approved ?? null,
      completed: profile?.completed ?? null,
      avatar_url: profile?.avatar_url ?? null,
      created_at: profile?.created_at ?? authUser?.created_at ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    },
  }
}
