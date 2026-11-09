"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

/**
 * Profile writes run on the server so they use the logged-in session
 * (the browser Supabase client can't read the httpOnly auth cookie).
 */

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export type SavedProfile = { full_name: string; phone: string | null; church: string | null; avatar_url: string | null }

export async function updateProfile(formData: FormData): Promise<Result<SavedProfile>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Session expirée. Reconnectez-vous." }

  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120)
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 30) || null
  const church = String(formData.get("church") ?? "").trim().slice(0, 120) || null
  const removeAvatar = formData.get("remove_avatar") === "1"
  const avatar = formData.get("avatar")

  if (!fullName) return { ok: false, error: "Le nom complet est obligatoire." }

  const { data: current } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle()
  let avatarUrl: string | null = current?.avatar_url ?? null

  if (avatar instanceof File && avatar.size > 0) {
    const ext = AVATAR_TYPES[avatar.type]
    if (!ext) return { ok: false, error: "Format d'image non pris en charge (JPG, PNG ou WebP)." }
    if (avatar.size > MAX_AVATAR_BYTES) return { ok: false, error: "L'image ne doit pas dépasser 2 Mo." }

    const path = `${user.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, { upsert: true, contentType: avatar.type, cacheControl: "3600" })
    if (uploadError) {
      console.error("[profile] avatar upload:", uploadError.message)
      return { ok: false, error: "Impossible de téléverser la photo de profil." }
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    // Same file name on re-upload: add a version so browsers show the new photo
    avatarUrl = `${data.publicUrl}?v=${Date.now()}`
  } else if (removeAvatar) {
    avatarUrl = null
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, church, avatar_url: avatarUrl })
    .eq("id", user.id)

  if (error) {
    console.error("[profile] update:", error.message)
    return { ok: false, error: "Échec de la mise à jour du profil." }
  }

  revalidatePath("/dashboard/profile")
  return { ok: true, data: { full_name: fullName, phone, church, avatar_url: avatarUrl } }
}

/**
 * `signOutAfter`: used by the password page (first sign-in / reset link) so
 * the person then signs in fresh with the password they just chose.
 */
export async function changePassword(password: string, signOutAfter = false): Promise<Result> {
  if (typeof password !== "string" || password.length < 8) {
    return { ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." }
  }
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Session expirée. Reconnectez-vous." }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (/same|different from the old/i.test(error.message)) {
      return { ok: false, error: "Le nouveau mot de passe doit être différent de l'ancien." }
    }
    if (/weak|pwned/i.test(error.message)) return { ok: false, error: "Ce mot de passe est trop faible." }
    console.error("[profile] password:", error.message)
    return { ok: false, error: "Impossible de changer le mot de passe pour le moment." }
  }

  // The one-time password set by an administrator has now been replaced.
  if ((user.app_metadata as Record<string, unknown> | null)?.must_change_password === true) {
    const admin = createSupabaseAdminClient()
    const { error: flagError } = admin
      ? await admin.auth.admin.updateUserById(user.id, { app_metadata: { must_change_password: false } })
      : { error: new Error("SUPABASE_SERVICE_ROLE_KEY not set") }
    if (flagError) {
      console.error("[profile] clear must_change_password:", flagError.message)
      return { ok: false, error: "Mot de passe changé, mais l'accès n'a pas pu être débloqué. Contactez un administrateur." }
    }
  }

  if (signOutAfter) await supabase.auth.signOut()
  return { ok: true }
}
