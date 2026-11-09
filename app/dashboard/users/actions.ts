"use server"

import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { notifyUserApproved, notifyUserInvited } from "@/lib/accounts/notify"
import { DELETE_PHRASE, deletionName } from "@/lib/accounts/delete"
import { generateTempPassword } from "@/lib/accounts/temp-password"

const APPROVER_ROLES = ["admin", "pastor", "corps_pastoral"]
const GRANTABLE_ROLES = ["admin", "pastor", "membre_cp", "treasurer"]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Signed-in caller, only if they are an administrator. */
async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Session expirée. Reconnectez-vous." as const }
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if ((me?.role ?? "").trim().toLowerCase() !== "admin") {
    return { error: "Seuls les administrateurs peuvent gérer les accès." as const }
  }
  return { supabase, user }
}

export type GrantAccessResult =
  | { ok: true; tempPassword: string; profile: { id: string; email: string; full_name: string | null; role: string; approved: true; completed: false; church: null; created_at: string } ; emailSent: boolean }
  | { ok: false; error: string }

/**
 * Creates an account for someone with a one-time password. The person must
 * replace it at first sign-in (app_metadata.must_change_password, which only
 * the service role can write — users cannot clear it themselves).
 * Administrators only. The password is returned once and never stored or logged.
 */
export async function grantAccess(input: {
  email: string
  fullName?: string
  role?: string
  sendWelcomeEmail?: boolean
}): Promise<GrantAccessResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return { ok: false, error: auth.error! }

  const email = (input.email ?? "").trim().toLowerCase()
  const fullName = (input.fullName ?? "").trim() || null
  const role = GRANTABLE_ROLES.includes(input.role ?? "") ? input.role! : "membre_cp"
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Adresse e-mail invalide." }

  const admin = createSupabaseAdminClient()
  if (!admin) return { ok: false, error: "Indisponible : la clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée." }

  const tempPassword = generateTempPassword()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    app_metadata: { must_change_password: true },
    user_metadata: fullName ? { full_name: fullName } : undefined,
  })
  if (error || !data.user) {
    if (/already|exists|registered/i.test(error?.message ?? "")) {
      return { ok: false, error: "Un compte existe déjà avec cette adresse. Utilisez « Nouveau mot de passe temporaire » sur sa ligne." }
    }
    console.error("[users] grant access:", error?.message)
    return { ok: false, error: "Impossible de créer l'accès pour le moment." }
  }

  const created_at = new Date().toISOString()
  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: data.user.id, email, full_name: fullName, role, approved: true }, { onConflict: "id" })
  if (profileError) {
    // Don't leave a half-created account behind
    await admin.auth.admin.deleteUser(data.user.id)
    console.error("[users] grant access profile:", profileError.message)
    return { ok: false, error: "Impossible de créer le profil. Aucun compte n'a été créé." }
  }

  await auth.supabase.from("activity_logs").insert({
    actor_user_id: auth.user.id,
    action: "user_invited",
    entity_type: "profiles",
    entity_id: data.user.id,
    description: `Granted access to ${email} (${role})`,
    metadata: { target_user_id: data.user.id, target_email: email, role },
  })

  let emailSent = false
  if (input.sendWelcomeEmail) {
    const origin = (await headers()).get("origin")
    emailSent = !!(await notifyUserInvited({ email, fullName, origin }))
  }

  return {
    ok: true,
    tempPassword,
    emailSent,
    profile: { id: data.user.id, email, full_name: fullName, role, approved: true, completed: false, church: null, created_at },
  }
}

/**
 * Replaces someone's password with a new one-time password (forgotten
 * password, never signed in…). They must change it at next sign-in.
 */
export async function resetTempPassword(targetId: string): Promise<{ ok: true; tempPassword: string; email: string | null } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if ("error" in auth) return { ok: false, error: auth.error! }
  if (targetId === auth.user.id) {
    return { ok: false, error: "Changez votre propre mot de passe depuis votre profil." }
  }

  const admin = createSupabaseAdminClient()
  if (!admin) return { ok: false, error: "Indisponible : la clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée." }

  const tempPassword = generateTempPassword()
  const { data, error } = await admin.auth.admin.updateUserById(targetId, {
    password: tempPassword,
    app_metadata: { must_change_password: true },
  })
  if (error || !data.user) {
    console.error("[users] reset temp password:", error?.message)
    return { ok: false, error: "Impossible de réinitialiser le mot de passe." }
  }

  await auth.supabase.from("activity_logs").insert({
    actor_user_id: auth.user.id,
    action: "user_password_reset",
    entity_type: "profiles",
    entity_id: targetId,
    description: `Issued a temporary password to ${data.user.email ?? targetId}`,
    metadata: { target_user_id: targetId },
  })

  return { ok: true, tempPassword, email: data.user.email ?? null }
}

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
