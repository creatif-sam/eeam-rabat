"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Pause, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { YEAR_THEME_KEYS, settingsToTheme, type YearTheme } from "@/lib/site/announcements";
import {
  DEFAULT_HERO_IMAGES,
  HERO_IMAGE_KEYS,
  HERO_KEYS,
  HERO_SLIDES,
  UPLOADED_IMAGE_FOCUS,
  currentQuarter,
  settingsToHero,
  settingsToHeroImages,
  type HeroContent,
  type HeroImages,
  type HeroSlideId,
} from "@/lib/site/hero";
import {
  EVENT_COLUMNS,
  expandEvents,
  fmtLongDate,
  fmtTime,
  fmtTimeRange,
  sameDay,
  toDateStr,
  type DbEvent,
  type Occurrence,
} from "@/lib/site/events";

const SLIDE_MS = 7000;
const SWIPE_PX = 50;
const DEFAULT_YEAR_THEME = "Servir et Bâtir selon le modèle de Christ";

type CardRow = { big: string; small: string };
type Slide = {
  id: HeroSlideId;
  badge: string;
  title: string;
  text?: string;
  cta?: { label: string; href: string };
  rows: CardRow[];
};

/** Uploaded photo if any, else the slide default (with framing tuned for it). */
function backgroundFor(id: HeroSlideId, images: HeroImages) {
  return images[id] ? { src: images[id], focus: UPLOADED_IMAGE_FOCUS } : DEFAULT_HERO_IMAGES[id];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const shortDay = (d: Date) => cap(d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, ""));

function buildSlides(theme: YearTheme, hero: HeroContent, occurrences: Occurrence[], now: Date): Slide[] {
  const slides: Slide[] = [];
  const year = theme.label || String(now.getFullYear());

  // 1 — Vision de l'année
  slides.push({
    id: "annee",
    badge: `Vision de l'année ${year}`,
    title: theme.theme || DEFAULT_YEAR_THEME,
    text: hero.yearVision || undefined,
    rows: [
      { big: year, small: "Année ecclésiale" },
      ...(theme.reference ? [{ big: theme.reference, small: "Texte de référence" }] : []),
    ],
  });

  // 2 — Vision du trimestre (only once a title is set)
  if (hero.quarterTitle) {
    const q = currentQuarter(now);
    slides.push({
      id: "trimestre",
      badge: "Vision du trimestre",
      title: hero.quarterTitle,
      text: hero.quarterText || undefined,
      rows: [
        { big: hero.quarterLabel || q.label, small: q.months },
        { big: q.weeksLeft > 1 ? `${q.weeksLeft} semaines` : q.weeksLeft === 1 ? "1 semaine" : "Dernière ligne droite", small: "restantes dans ce trimestre" },
      ],
    });
  }

  // 3 — Prochain événement
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const upcoming = occurrences.filter(
    (o) => !sameDay(o.date, now) || !o.start_time || o.start_time.slice(0, 5) >= nowTime
  );
  const next = upcoming[0];
  if (next) {
    const today = sameDay(next.date, now);
    slides.push({
      id: "evenement",
      badge: today ? "Aujourd'hui" : "Prochain événement",
      title: next.title,
      text: next.description ? next.description.slice(0, 180) + (next.description.length > 180 ? "…" : "") : undefined,
      cta: { label: "Voir le calendrier", href: "#calendar" },
      rows: [
        { big: today ? "Aujourd'hui" : shortDay(next.date), small: fmtLongDate(next.date) },
        { big: fmtTimeRange(next), small: next.location || "Lieu à confirmer" },
      ],
    });
  }

  // 4 — Programmes de cette semaine (today → Sunday)
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dow));
  const week = upcoming.filter((o) => o.date <= sunday);
  if (week.length) {
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
    const range = `${monday.getDate()} au ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
    const shown = week.slice(0, 3);
    slides.push({
      id: "semaine",
      badge: `Semaine du ${range}`,
      title: "Programmes de cette semaine",
      text: week.length === 1 ? "Un rendez-vous d'ici dimanche. Venez nombreux !" : `${week.length} rendez-vous d'ici dimanche. Venez nombreux !`,
      cta: { label: "Tout le calendrier", href: "#calendar" },
      rows: shown.map((o) => ({
        big: `${sameDay(o.date, now) ? "Auj." : cap(o.date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""))}${o.start_time ? ` · ${fmtTime(o.start_time)}` : ""}`,
        small: o.title,
      })),
    });
  }

  return slides;
}

export default function HeroCarousel() {
  const [theme, setTheme] = useState<YearTheme>({ label: "", theme: "", reference: "" });
  const [hero, setHero] = useState<HeroContent>({ yearVision: "", quarterLabel: "", quarterTitle: "", quarterText: "" });
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [images, setImages] = useState<HeroImages>(
    () => Object.fromEntries(HERO_SLIDES.map((id) => [id, ""])) as HeroImages
  );
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    // Respect reduced-motion: no autoplay
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUserPaused(true);
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const today = toDateStr(new Date());
    Promise.all([
      supabase.from("site_settings").select("key, value").in("key", [...Object.values(YEAR_THEME_KEYS), ...Object.values(HERO_KEYS), ...Object.values(HERO_IMAGE_KEYS)]),
      supabase.from("events").select(EVENT_COLUMNS).or(`event_date.gte.${today},is_recurring.eq.true`),
    ])
      .then(([settings, ev]) => {
        if (settings.data) {
          setTheme(settingsToTheme(settings.data));
          setHero(settingsToHero(settings.data));
          setImages(settingsToHeroImages(settings.data));
        }
        if (ev.data) setEvents(ev.data as DbEvent[]);
      })
      .catch((err) => console.error("[hero]", err))
      .finally(() => setLoaded(true));
  }, []);

  const slides = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 120);
    return buildSlides(theme, hero, expandEvents(events, from, to), now);
  }, [theme, hero, events]);

  const count = slides.length;
  const current = Math.min(index, count - 1);
  const slide = slides[current];
  const playing = count > 1 && !userPaused && !hovered && !pageHidden;

  const go = (i: number) => setIndex(((i % count) + count) % count);

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="À la une"
      className="relative mb-8 sm:mb-12 overflow-hidden rounded-[22px] sm:rounded-[28px] bg-[#0d2d30] text-white shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(current + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(current + 1);
        if (e.key === "ArrowLeft") go(current - 1);
      }}
    >
      {/* Backgrounds: one layer per slide, cross-faded */}
      {slides.map((s, i) => {
        const bg = backgroundFor(s.id, images);
        return (
        <div
          key={s.id}
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={bg.src}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className={`object-cover transition-transform duration-[8000ms] ease-out ${i === current ? "scale-110" : "scale-100"}`}
            style={{ objectPosition: bg.focus }}
          />
        </div>
        );
      })}
      {/* Brand overlay: deep teal from the left, fading to the photo */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0d2d30] via-[#0d2d30]/85 to-[#0d2d30]/10" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0d2d30]/90 via-transparent to-[#0d2d30]/30 lg:from-[#0d2d30]/60" />
      <div aria-hidden className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#b72736]/25 blur-3xl" />

      {/* Controls: pause + dots */}
      {count > 1 && (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Lancer le défilement" : "Mettre en pause"}
            className="grid h-6 w-6 place-items-center rounded-full text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#90d9e0]"
          >
            {userPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
          </button>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Diapositive ${i + 1} sur ${count}`}
              aria-current={i === current}
              className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#90d9e0] ${
                i === current ? "w-8 bg-white/30" : "w-1.5 bg-white/60 hover:bg-white"
              }`}
            >
              {i === current && (
                <span
                  key={`${s.id}-${current}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-[#4ec2cd]"
                  style={{
                    animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                    animationPlayState: playing ? "running" : "paused",
                  }}
                  onAnimationEnd={() => go(current + 1)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-[560px] sm:min-h-[520px] lg:min-h-[540px] flex-col justify-end gap-8 p-6 pt-20 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-14">
        <div
          key={`text-${slide.id}`}
          role="group"
          aria-roledescription="diapositive"
          aria-label={`${current + 1} sur ${count} : ${slide.badge}`}
          className={`max-w-2xl transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm font-semibold backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#de6370] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#de6370]" />
            </span>
            {slide.badge}
          </span>
          <h1 className="mt-5 text-[2rem] leading-[1.08] sm:text-5xl lg:text-[3.4rem] font-medium tracking-tight text-balance">
            {slide.title}
          </h1>
          {slide.text && (
            <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-white/80 text-pretty">{slide.text}</p>
          )}
          {slide.cta && (
            <a
              href={slide.cta.href}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4ec2cd] px-5 py-2.5 text-sm font-semibold text-[#0d2d30] hover:bg-[#90d9e0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {slide.cta.label}
              <ArrowRight size={16} />
            </a>
          )}
        </div>

        {slide.rows.length > 0 && (
          <div
            key={`card-${slide.id}`}
            className={`w-full lg:w-[360px] shrink-0 rounded-2xl border border-white/20 bg-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:duration-700`}
          >
            <ul className="divide-y divide-white/15">
              {slide.rows.map((r) => (
                <li key={r.big + r.small} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-2xl sm:text-[1.7rem] leading-tight font-medium text-[#90d9e0]">{r.big}</p>
                  <p className="mt-1 text-sm text-white/85 line-clamp-2">{r.small}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
