"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Shield, Phone, ExternalLink, Cookie, Settings, Facebook, Instagram, Youtube } from "lucide-react";
import { useState } from "react";
import CookieSettingsModal from "@/components/CookieSettingsModal";
import InstallAppButton from "@/components/pwa/InstallAppButton";

/** lucide has no TikTok icon. */
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/eeamrabatofficielle", icon: <Facebook size={18} /> },
  { label: "Instagram", href: "https://www.instagram.com/eeam_rabat_officiel/", icon: <Instagram size={18} /> },
  { label: "YouTube", href: "https://www.youtube.com/@eeam_rabatofficiel", icon: <Youtube size={18} /> },
  { label: "TikTok", href: "https://www.tiktok.com/@eeamrabat_officiel", icon: <TikTokIcon size={17} /> },
];

export default function Footer() {
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="relative bg-gray-950 dark:bg-gray-950 text-white overflow-hidden">
        {/* Top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">

          {/* ─── Main grid ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 mb-14">

            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
                  <Image src="/images/eeam-logo.png" alt="EEAM Logo" width={56} height={56} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                    Église Évangélique Au Maroc
                  </h3>
                  <p className="text-cyan-400 text-sm font-medium">Paroisse de Rabat &mdash; EEAM LEAD</p>
                </div>
              </div>

              <blockquote className="border-l-2 border-cyan-500 pl-4 italic text-cyan-300/80 text-sm mb-6">
                &ldquo;Soit que vous mangiez, soit que vous buviez, et quoi que vous fassiez,
                faites tout pour la gloire de Dieu.&rdquo;
                <cite className="not-italic text-cyan-400 text-xs block mt-1">&mdash; 1 Corinthiens 10:31</cite>
              </blockquote>

              <div className="space-y-2.5">
                <a href="tel:+212707507100" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors group">
                  <Phone size={16} className="text-cyan-500 flex-shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform text-sm">+212 707 507 100</span>
                </a>
                <a href="mailto:cpeeamrabat@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors group">
                  <Mail size={16} className="text-cyan-500 flex-shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform text-sm">cpeeamrabat@gmail.com</span>
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin size={16} className="text-cyan-500 flex-shrink-0" />
                  <span className="text-sm">Rabat, Maroc</span>
                </div>
              </div>

              {/* Social media */}
              <div className="mt-7">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3">Suivez-nous</h4>
                <ul className="flex flex-wrap items-center gap-2.5">
                  {SOCIAL_LINKS.map(({ label, href, icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`EEAM Rabat sur ${label}`}
                        title={label}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-br hover:from-[#b72736] hover:to-[#4ec2cd] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        {icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-5">Navigation</h4>
              <ul className="space-y-3">
                {[
                  { href: "/#home", label: "Accueil" },
                  { href: "/#services", label: "Services" },
                  { href: "/#calendar", label: "Calendrier" },
                  { href: "/#events", label: "Événements" },
                  { href: "/auth/login", label: "Connexion" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}
                      className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm group">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Settings */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-5">Légal & Paramètres</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/politique-de-confidentialite"
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm group">
                    <Shield size={14} className="text-cyan-500 flex-shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Politique de confidentialité</span>
                  </Link>
                </li>
                <li>
                  <Link href="/politique-cookies"
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm group">
                    <Cookie size={14} className="text-cyan-500 flex-shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Politique des cookies</span>
                  </Link>
                </li>
                <li>
                  <button onClick={() => setShowCookieSettings(true)}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm group w-full text-left">
                    <Settings size={14} className="text-cyan-500 flex-shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Gérer les cookies</span>
                  </button>
                </li>
                <li>
                  <Link href="/politique-de-confidentialite"
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm group">
                    <ExternalLink size={14} className="text-cyan-500 flex-shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Conformité RGPD</span>
                  </Link>
                </li>
              </ul>

              {/* RGPD badge */}
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <Shield size={12} />
                Conforme RGPD
              </div>
            </div>
          </div>

          {/* ─── Install the app ─── */}
          <div className="mb-10 empty:hidden">
            <InstallAppButton variant="card" />
          </div>

          {/* ─── Divider ─── */}
          <div className="border-t border-gray-800" />

          {/* ─── Bottom bar ─── */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              &copy; {currentYear} Église Évangélique Au Maroc — Paroisse de Rabat. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      <CookieSettingsModal isOpen={showCookieSettings} onClose={() => setShowCookieSettings(false)} />
    </>
  );
}

