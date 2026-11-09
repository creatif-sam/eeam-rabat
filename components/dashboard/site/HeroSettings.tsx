"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarClock, CalendarDays, Loader2, Save, Sparkles, Target } from "lucide-react"
import { toast } from "sonner"
import { saveHeroContent } from "@/app/dashboard/site/actions"
import { HERO_LIMITS, currentQuarter, type HeroContent, type HeroImages, type HeroSlideId } from "@/lib/site/hero"
import HeroImagePicker from "@/components/dashboard/site/HeroImagePicker"
import type { YearTheme } from "@/lib/site/announcements"

const inputCls =
  "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"

function Field({
  id,
  label,
  hint,
  value,
  max,
  multiline,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  value: string
  max: number
  multiline?: boolean
  placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-xs tabular-nums text-gray-400">{value.length}/{max}</span>
      </div>
      {multiline ? (
        <textarea id={id} rows={3} maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y`} />
      ) : (
        <input id={id} maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  )
}

function SlideCard({ n, icon: Icon, title, auto, children }: { n: number; icon: typeof Sparkles; title: string; auto?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-600 text-xs font-bold text-white">{n}</span>
        <Icon size={17} className="text-cyan-600 dark:text-cyan-400" />
        <h3 className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {auto && (
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Automatique
          </span>
        )}
      </header>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  )
}

/** Editor for the homepage hero ("Bannière d'accueil"). */
export default function HeroSettings({
  initialHero,
  initialImages,
  yearTheme,
  onEditYearTheme,
}: {
  initialHero: HeroContent
  initialImages: HeroImages
  yearTheme: YearTheme
  onEditYearTheme: () => void
}) {
  const [hero, setHero] = useState(initialHero)
  const [saved, setSaved] = useState(initialHero)
  const [saving, setSaving] = useState(false)
  // Photos are saved as soon as they are uploaded, separately from the texts
  const [images, setImages] = useState(initialImages)
  const picker = (slide: HeroSlideId) => (
    <HeroImagePicker slide={slide} url={images[slide]} onChange={(url) => setImages((m) => ({ ...m, [slide]: url }))} />
  )
  const dirty = JSON.stringify(hero) !== JSON.stringify(saved)
  const quarter = currentQuarter()
  const set = (k: keyof HeroContent) => (v: string) => setHero((h) => ({ ...h, [k]: v }))

  async function save() {
    setSaving(true)
    const result = await saveHeroContent(hero)
    setSaving(false)
    if (!result.ok) return void toast.error(result.error)
    setSaved(hero)
    toast.success("Bannière enregistrée. Elle est déjà visible sur le site.")
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Le grand bandeau en haut de la page d&apos;accueil fait défiler jusqu&apos;à 4 diapositives. Les diapositives sans contenu sont masquées automatiquement.
      </p>

      <SlideCard n={1} icon={Sparkles} title="Vision de l'année">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-3.5 py-3 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Titre (thème de l&apos;année)</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">{yearTheme.theme || "Servir et Bâtir selon le modèle de Christ (par défaut)"}</p>
          {(yearTheme.label || yearTheme.reference) && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{[yearTheme.label, yearTheme.reference].filter(Boolean).join(" · ")}</p>
          )}
          <button type="button" onClick={onEditYearTheme} className="mt-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:underline">
            Modifier dans « Thème &amp; annonces »
          </button>
        </div>
        <Field
          id="hero-year-vision"
          label="Texte de la vision de l'année"
          hint="Une ou deux phrases sous le titre. Facultatif."
          value={hero.yearVision}
          max={HERO_LIMITS.text}
          multiline
          onChange={set("yearVision")}
        />
        {picker("annee")}
      </SlideCard>

      <SlideCard n={2} icon={Target} title="Vision du trimestre">
        <Field
          id="hero-quarter-title"
          label="Titre"
          hint="Laissez vide pour masquer cette diapositive."
          value={hero.quarterTitle}
          max={HERO_LIMITS.title}
          placeholder="Ex. : Un trimestre pour former des disciples"
          onChange={set("quarterTitle")}
        />
        <Field
          id="hero-quarter-text"
          label="Texte"
          value={hero.quarterText}
          max={HERO_LIMITS.text}
          multiline
          onChange={set("quarterText")}
        />
        <Field
          id="hero-quarter-label"
          label="Libellé du trimestre"
          hint={`Vide = automatique : « ${quarter.label} » (${quarter.months}).`}
          value={hero.quarterLabel}
          max={HERO_LIMITS.label}
          placeholder={quarter.label}
          onChange={set("quarterLabel")}
        />
        {picker("trimestre")}
      </SlideCard>

      <SlideCard n={3} icon={CalendarClock} title="Prochain événement" auto>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Affiche le prochain événement à venir (titre, date, heure, lieu), y compris les cultes récurrents.
        </p>
        {picker("evenement")}
      </SlideCard>

      <SlideCard n={4} icon={CalendarDays} title="Programmes de cette semaine" auto>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Liste les événements d&apos;aujourd&apos;hui à dimanche (3 au maximum dans la carte).
        </p>
        <Link href="/dashboard/events" className="inline-flex text-sm font-semibold text-cyan-700 dark:text-cyan-400 hover:underline">
          Gérer les événements →
        </Link>
        {picker("semaine")}
      </SlideCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-cyan-700 disabled:opacity-50 disabled:shadow-none transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {dirty ? "Enregistrer les textes" : "Textes enregistrés"}
        </button>
      </div>
    </div>
  )
}
