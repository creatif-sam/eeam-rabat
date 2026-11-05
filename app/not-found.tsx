import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  CalendarDays,
  ChevronRight,
  Compass,
  Home,
  LayoutDashboard,
  MessageCircleHeart,
  HandHeart,
} from "lucide-react";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Page introuvable – EEAM Rabat",
  robots: { index: false },
};

const QUICK_LINKS = [
  { href: "/#calendar", label: "Calendrier", desc: "Cultes et activités à venir", icon: CalendarDays },
  { href: "/#services", label: "Nos services", desc: "Inscription, bénévolat, prière", icon: HandHeart },
  { href: "/entretien-pastoral", label: "Entretien pastoral", desc: "Rencontrer un pasteur", icon: MessageCircleHeart },
  { href: "/dashboard", label: "Espace membres", desc: "Accéder au tableau de bord", icon: LayoutDashboard },
];

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16 sm:px-6">
      {/* Background: soft brand glows + dotted grid fading out from the centre */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/10" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-20"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            color: "rgb(148 163 184)",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-2xl text-center">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-800 pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow transition-shadow">
          <Image src="/images/eeam-logo.png" alt="" width={28} height={28} className="rounded-full" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">EEAM Rabat</span>
        </Link>

        {/* 4 [compass] 4 */}
        <div className="mt-10 flex items-center justify-center gap-2 sm:gap-4 select-none" aria-hidden>
          <span className="text-[6.5rem] sm:text-[9rem] font-black leading-none tracking-tighter bg-gradient-to-b from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
            4
          </span>
          <span className="relative inline-flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-[10px] sm:border-[14px] border-rose-500/90 dark:border-rose-500/80" />
            <span className="absolute inset-3 sm:inset-4 rounded-full bg-rose-50 dark:bg-rose-950/40" />
            <Compass className="relative h-10 w-10 sm:h-14 sm:w-14 text-rose-600 dark:text-rose-400 motion-safe:animate-[spin_12s_linear_infinite]" strokeWidth={1.75} />
          </span>
          <span className="text-[6.5rem] sm:text-[9rem] font-black leading-none tracking-tighter bg-gradient-to-b from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
            4
          </span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Vous semblez avoir perdu le chemin
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          La page que vous cherchez n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude, voici
          de quoi retrouver votre route.
        </p>

        {/* Primary actions */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <BackButton className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 px-5 py-3 text-sm font-semibold transition-colors" />
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-cyan-600/20 transition-colors"
          >
            <Home size={16} />
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 text-left">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            Pages utiles
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map(({ href, label, desc, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-4 hover:border-cyan-300 dark:hover:border-cyan-800 hover:shadow-md transition-all"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900 dark:text-white">{label}</span>
                  <span className="block truncate text-sm text-gray-500 dark:text-gray-400">{desc}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-gray-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Verse */}
        <figure className="mx-auto mt-12 max-w-md border-t border-gray-200 dark:border-gray-800 pt-6">
          <blockquote className="text-sm italic text-gray-600 dark:text-gray-400">
            « Je suis le chemin, la vérité, et la vie. »
          </blockquote>
          <figcaption className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Jean 14:6
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
