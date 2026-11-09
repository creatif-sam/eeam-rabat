/**
 * Homepage hero ("Bannière d'accueil"). Texts live in `site_settings`
 * (key/value, publicly readable). Slide 1 also uses the year theme
 * (YEAR_THEME_KEYS); the event slides are filled from `events`.
 */

export type HeroContent = {
  yearVision: string
  quarterLabel: string
  quarterTitle: string
  quarterText: string
}

export const HERO_KEYS = {
  yearVision: "hero_year_vision",
  quarterLabel: "hero_quarter_label",
  quarterTitle: "hero_quarter_title",
  quarterText: "hero_quarter_text",
} as const

/** The four slides, in display order. */
export const HERO_SLIDES = ["annee", "trimestre", "evenement", "semaine"] as const
export type HeroSlideId = (typeof HERO_SLIDES)[number]

/** Background photo per slide (public URL in Supabase Storage); empty = default photo. */
export type HeroImages = Record<HeroSlideId, string>
export const HERO_IMAGE_KEYS: Record<HeroSlideId, string> = {
  annee: "hero_image_annee",
  trimestre: "hero_image_trimestre",
  evenement: "hero_image_evenement",
  semaine: "hero_image_semaine",
}
/**
 * Default photo per slide (public/images), used until an editor uploads one.
 * `focus` is the object-position that keeps faces in frame when cropped.
 */
export const DEFAULT_HERO_IMAGES: Record<HeroSlideId, { src: string; focus: string }> = {
  annee: { src: "/images/photo-assembly.jpg", focus: "50% 62%" },
  trimestre: { src: "/images/photo2.jpg", focus: "55% 28%" },
  evenement: { src: "/images/photo3-pastor-jess.jpg", focus: "50% 35%" },
  semaine: { src: "/images/photo-assembly.jpg", focus: "85% 70%" },
}
/** Uploaded photos: centred framing (we don't know the subject). */
export const UPLOADED_IMAGE_FOCUS = "50% 45%"
export const HERO_IMAGE_BUCKET = "site-media"

export function settingsToHeroImages(rows: { key: string; value: string | null }[] | null | undefined): HeroImages {
  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value ?? ""]))
  return Object.fromEntries(HERO_SLIDES.map((id) => [id, map[HERO_IMAGE_KEYS[id]] ?? ""])) as HeroImages
}

export const HERO_LIMITS = {
  title: 120,
  text: 240,
  label: 40,
} as const

export function settingsToHero(rows: { key: string; value: string | null }[] | null | undefined): HeroContent {
  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value ?? ""]))
  return {
    yearVision: map[HERO_KEYS.yearVision] ?? "",
    quarterLabel: map[HERO_KEYS.quarterLabel] ?? "",
    quarterTitle: map[HERO_KEYS.quarterTitle] ?? "",
    quarterText: map[HERO_KEYS.quarterText] ?? "",
  }
}

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Calendar quarter of `now`: "4e trimestre 2026", "Octobre – Décembre", weeks left. */
export function currentQuarter(now = new Date()) {
  const q = Math.floor(now.getMonth() / 3) // 0..3
  const year = now.getFullYear()
  const end = new Date(year, q * 3 + 3, 0) // last day of the quarter
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000))
  return {
    label: `${q === 0 ? "1er" : `${q + 1}e`} trimestre ${year}`,
    months: `${cap(MONTHS[q * 3])} – ${cap(MONTHS[q * 3 + 2])}`,
    weeksLeft: Math.ceil(daysLeft / 7),
  }
}
