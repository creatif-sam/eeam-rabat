"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Shield, Heart, Phone, ExternalLink, Cookie, Settings } from "lucide-react";
import { useState } from "react";
import CookieSettingsModal from "@/components/CookieSettingsModal";

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

              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Technologie au service de l&apos;évangile.
              </p>
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
                  { href: "/auth/sign-up", label: "S’inscrire" },
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

          {/* ─── Divider ─── */}
          <div className="border-t border-gray-800" />

          {/* ─── Bottom bar ─── */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              &copy; {currentYear} Église Évangélique Au Maroc — Paroisse de Rabat. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Fait avec</span>
              <Heart size={13} className="text-rose-400 fill-rose-400" />
              <span>pour la gloire de Dieu</span>
            </div>
          </div>
        </div>
      </footer>

      <CookieSettingsModal isOpen={showCookieSettings} onClose={() => setShowCookieSettings(false)} />
    </>
  );
}

