"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, ChevronRight, ExternalLink, GalleryHorizontal, Globe, KeyRound, Megaphone } from "lucide-react"
import HeroSettings from "@/components/dashboard/site/HeroSettings"
import type { HeroContent, HeroImages } from "@/lib/site/hero"
import AnnouncementsManager from "@/components/dashboard/annonces/AnnouncementsManager"
import SettingsClient from "@/app/dashboard/settings/SettingsClient"
import type { Announcement, YearTheme } from "@/lib/site/announcements"

export type SiteTab = "banniere" | "annonces" | "formulaires"

/**
 * "Site public": every dashboard control that changes what visitors see on
 * the public website, grouped in one tab.
 */
export default function PublicSiteHub({
  initialTab,
  userId,
  role,
  canEditFormAccess,
  setupMissing,
  initialTheme,
  initialAnnouncements,
  initialHero,
  initialHeroImages,
  formSettings,
}: {
  initialTab: SiteTab
  userId: string
  role: string
  canEditFormAccess: boolean
  setupMissing: boolean
  initialTheme: YearTheme
  initialAnnouncements: Announcement[]
  initialHero: HeroContent
  initialHeroImages: HeroImages
  formSettings: Record<string, string>
}) {
  const [tab, setTab] = useState<SiteTab>(initialTab)
  const router = useRouter()

  const tabs: { id: SiteTab; label: string; icon: typeof Megaphone }[] = [
    { id: "banniere", label: "Bannière d'accueil", icon: GalleryHorizontal },
    { id: "annonces", label: "Thème & annonces", icon: Megaphone },
    ...(canEditFormAccess ? [{ id: "formulaires" as const, label: "Accès aux formulaires", icon: KeyRound }] : []),
  ]

  function select(next: SiteTab) {
    setTab(next)
    // Pull fresh data so each tab reflects saves made in the others (e.g. the year theme)
    router.refresh()
    // Keep the URL shareable without a navigation
    const url = new URL(window.location.href)
    if (next === "banniere") url.searchParams.delete("tab")
    else url.searchParams.set("tab", next)
    window.history.replaceState(null, "", url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="text-cyan-600 dark:text-cyan-400" size={26} />
            Site public
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Tout ce qui modifie le site visible par les visiteurs, au même endroit.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
        >
          <ExternalLink size={16} />
          Voir le site
        </a>
      </div>

      {tabs.length > 1 && (
        <div role="tablist" aria-label="Sections du site public" className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                role="tab"
                id={`site-tab-${id}`}
                aria-selected={active}
                aria-controls={`site-panel-${id}`}
                onClick={() => select(id)}
                className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-cyan-600 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>
      )}

      <div role="tabpanel" id={`site-panel-${tab}`} aria-labelledby={`site-tab-${tab}`}>
        {tab === "banniere" && (
          <HeroSettings initialHero={initialHero} initialImages={initialHeroImages} yearTheme={initialTheme} onEditYearTheme={() => select("annonces")} />
        )}
        {tab === "annonces" && (
          <AnnouncementsManager
            embedded
            userId={userId}
            setupMissing={setupMissing}
            initialTheme={initialTheme}
            initialAnnouncements={initialAnnouncements}
          />
        )}
        {tab === "formulaires" && canEditFormAccess && (
          <SettingsClient embedded role={role} initialSettings={formSettings} />
        )}
      </div>

      <Link
        href="/dashboard/events"
        className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors"
      >
        <div className="shrink-0 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 p-2 text-cyan-600 dark:text-cyan-400">
          <CalendarDays size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Événements et calendrier</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Les événements créés dans Événements apparaissent aussi dans le calendrier et la section Événements du site.
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-gray-400" />
      </Link>
    </div>
  )
}
