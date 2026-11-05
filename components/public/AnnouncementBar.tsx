"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ANNOUNCEMENT_COLUMNS,
  TONES,
  YEAR_THEME_KEYS,
  settingsToTheme,
  sortAnnouncements,
  type Announcement,
  type YearTheme,
} from "@/lib/site/announcements";

const ROTATE_MS = 7000;

type Props = {
  /** Dashboard preview: render these instead of loading from Supabase. */
  preview?: { theme: YearTheme; announcements: Announcement[] };
};

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function AnnouncementBar({ preview }: Props) {
  const [theme, setTheme] = useState<YearTheme | null>(preview?.theme ?? null);
  const [items, setItems] = useState<Announcement[]>(preview?.announcements ?? []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Live data (public pages)
  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const [settings, announcements] = await Promise.all([
        supabase.from("site_settings").select("key, value").in("key", Object.values(YEAR_THEME_KEYS)),
        // RLS only returns active announcements inside their date window
        supabase.from("site_announcements").select(ANNOUNCEMENT_COLUMNS).limit(10),
      ]);
      if (cancelled) return;
      if (!settings.error) setTheme(settingsToTheme(settings.data));
      if (!announcements.error) setItems(sortAnnouncements((announcements.data ?? []) as Announcement[]));
    })();
    return () => {
      cancelled = true;
    };
  }, [preview]);

  // Keep preview in sync with the editor
  useEffect(() => {
    if (!preview) return;
    setTheme(preview.theme);
    setItems(preview.announcements);
  }, [preview]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  // Rotate announcements (paused on hover/focus)
  useEffect(() => {
    if (items.length < 2 || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length, paused]);

  const hasTheme = !!theme?.theme.trim();
  const current = items[index] ?? null;
  if (!hasTheme && !current) return null;

  const step = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <div
      role="region"
      aria-label="Annonces de la paroisse"
      className="bg-[#0b2a45] text-white/85 text-[12px] leading-snug border-b border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between md:gap-6">
        {/* Year theme */}
        {hasTheme && (
          <p className="flex min-w-0 items-start md:items-center gap-2">
            <span className="mt-1.5 md:mt-0 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
            <span className="min-w-0 line-clamp-2 md:line-clamp-none md:!flex md:items-center md:gap-2 md:overflow-hidden">
              <span className="font-bold uppercase tracking-wide text-white md:shrink-0">
                {theme!.label || "Thème de l'année"}
              </span>
              <span className="hidden md:inline-block h-3 w-px shrink-0 bg-white/25" aria-hidden />
              <span className="md:hidden"> · </span>
              <span className="md:min-w-0 md:truncate">
              « {theme!.theme.trim()} »
              {theme!.reference.trim() && <span className="text-white/60"> — {theme!.reference.trim()}</span>}
              </span>
            </span>
          </p>
        )}

        {/* Announcement */}
        {current && (
          <div className="flex min-w-0 items-start md:items-center gap-2 md:justify-end md:max-w-[55%]" aria-live="polite">
            <span
              className={`shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${TONES[current.tone]?.badge ?? TONES.info.badge}`}
            >
              {current.label || TONES[current.tone]?.name || "Annonce"}
            </span>
            <span key={current.id} className="min-w-0 line-clamp-2 md:line-clamp-none md:truncate motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
              {current.message}
            </span>
            {current.link_url && (
              <>
                <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden />
                <a
                  href={current.link_url}
                  {...(isExternal(current.link_url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="shrink-0 font-semibold text-white underline-offset-2 hover:underline"
                >
                  {current.link_label || "En savoir plus"}
                </a>
              </>
            )}
            {items.length > 1 && (
              <span className="ml-1 flex shrink-0 items-center">
                <button type="button" onClick={() => step(-1)} aria-label="Annonce précédente" className="rounded p-0.5 text-white/60 hover:bg-white/10 hover:text-white">
                  <ChevronLeft size={14} />
                </button>
                <span className="tabular-nums text-[10px] text-white/60">
                  {index + 1}/{items.length}
                </span>
                <button type="button" onClick={() => step(1)} aria-label="Annonce suivante" className="rounded p-0.5 text-white/60 hover:bg-white/10 hover:text-white">
                  <ChevronRight size={14} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
