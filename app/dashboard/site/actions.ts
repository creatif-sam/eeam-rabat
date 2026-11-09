"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  HERO_IMAGE_BUCKET,
  HERO_IMAGE_KEYS,
  HERO_KEYS,
  HERO_LIMITS,
  HERO_SLIDES,
  type HeroContent,
  type HeroSlideId,
} from "@/lib/site/hero"

const EDITOR_ROLES = ["admin", "pastor", "corps_pastoral"]
const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024 // images are compressed in the browser first
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

type Fail = { ok: false; error: string }

/** Logged-in site editor (same roles as the "Site public" page). */
async function siteEditor() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Session expirée. Reconnectez-vous." }
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!EDITOR_ROLES.includes((me?.role ?? "").trim().toLowerCase())) return { error: "Accès réservé aux éditeurs du site." }
  return { supabase, user }
}

/** Storage path inside the bucket, from a public URL we generated earlier. */
function pathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${HERO_IMAGE_BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0])
}

/**
 * Uploads a slide's background photo to the public "site-media" bucket
 * (created on first use) and points the slide at it. Replaces the old file.
 */
export async function uploadHeroImage(formData: FormData): Promise<{ ok: true; url: string } | Fail> {
  const auth = await siteEditor()
  if ("error" in auth) return { ok: false, error: auth.error! }

  const slide = String(formData.get("slide") ?? "") as HeroSlideId
  const file = formData.get("file")
  if (!HERO_SLIDES.includes(slide)) return { ok: false, error: "Diapositive inconnue." }
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Aucune image reçue." }
  const ext = IMAGE_TYPES[file.type]
  if (!ext) return { ok: false, error: "Format non pris en charge (JPG, PNG ou WebP)." }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Image trop lourde (2,5 Mo maximum)." }

  const admin = createSupabaseAdminClient()
  if (!admin) return { ok: false, error: "Indisponible : la clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée." }

  // Public bucket so visitors can load the photos; create it the first time.
  const { error: bucketError } = await admin.storage.getBucket(HERO_IMAGE_BUCKET)
  if (bucketError) {
    const { error: createError } = await admin.storage.createBucket(HERO_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: Object.keys(IMAGE_TYPES),
    })
    if (createError && !/already exists/i.test(createError.message)) {
      console.error("[site] create bucket:", createError.message)
      return { ok: false, error: "Impossible de préparer le stockage des images." }
    }
  }

  const path = `hero/${slide}-${Date.now()}.${ext}`
  const { error: uploadError } = await admin.storage
    .from(HERO_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false })
  if (uploadError) {
    console.error("[site] upload hero image:", uploadError.message)
    return { ok: false, error: "Le téléversement a échoué. Réessayez." }
  }
  const url = admin.storage.from(HERO_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl

  const key = HERO_IMAGE_KEYS[slide]
  const { data: previous } = await auth.supabase.from("site_settings").select("value").eq("key", key).maybeSingle()
  const { error } = await auth.supabase
    .from("site_settings")
    .upsert({ key, value: url, updated_at: new Date().toISOString(), updated_by: auth.user.id }, { onConflict: "key" })
  if (error) {
    await admin.storage.from(HERO_IMAGE_BUCKET).remove([path])
    console.error("[site] save hero image:", error.message)
    return { ok: false, error: "Impossible d'enregistrer la photo. Vérifiez vos droits d'édition du site." }
  }

  const oldPath = previous?.value ? pathFromPublicUrl(previous.value) : null
  if (oldPath) await admin.storage.from(HERO_IMAGE_BUCKET).remove([oldPath])

  return { ok: true, url }
}

/** Goes back to the default photo for a slide and deletes the uploaded one. */
export async function removeHeroImage(slide: HeroSlideId): Promise<{ ok: true } | Fail> {
  const auth = await siteEditor()
  if ("error" in auth) return { ok: false, error: auth.error! }
  if (!HERO_SLIDES.includes(slide)) return { ok: false, error: "Diapositive inconnue." }

  const key = HERO_IMAGE_KEYS[slide]
  const { data: previous } = await auth.supabase.from("site_settings").select("value").eq("key", key).maybeSingle()
  const { error } = await auth.supabase
    .from("site_settings")
    .upsert({ key, value: "", updated_at: new Date().toISOString(), updated_by: auth.user.id }, { onConflict: "key" })
  if (error) return { ok: false, error: "Impossible de retirer la photo." }

  const oldPath = previous?.value ? pathFromPublicUrl(previous.value) : null
  const admin = createSupabaseAdminClient()
  if (oldPath && admin) await admin.storage.from(HERO_IMAGE_BUCKET).remove([oldPath])
  return { ok: true }
}

/**
 * Saves the homepage hero texts. Runs with the logged-in session so the
 * is_site_editor() RLS policy on site_settings applies (same as the year theme).
 */
export async function saveHeroContent(hero: HeroContent): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Session expirée. Reconnectez-vous." }

  const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max)
  const now = new Date().toISOString()
  const rows = [
    { key: HERO_KEYS.yearVision, value: clean(hero.yearVision, HERO_LIMITS.text) },
    { key: HERO_KEYS.quarterLabel, value: clean(hero.quarterLabel, HERO_LIMITS.label) },
    { key: HERO_KEYS.quarterTitle, value: clean(hero.quarterTitle, HERO_LIMITS.title) },
    { key: HERO_KEYS.quarterText, value: clean(hero.quarterText, HERO_LIMITS.text) },
  ].map((r) => ({ ...r, updated_at: now, updated_by: user.id }))

  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" })
  if (error) {
    console.error("[site] save hero:", error.message)
    return { ok: false, error: "Impossible d'enregistrer la bannière. Vérifiez vos droits d'édition du site." }
  }
  return { ok: true }
}
