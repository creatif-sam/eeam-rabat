"use client";

import Link from "next/link";
import Image from "next/image";
import { Cookie, Shield, ExternalLink, MapPin, Mail, Heart, Church, BookOpen, Settings } from "lucide-react";
import { useState } from "react";
import CookieSettingsModal from "@/components/CookieSettingsModal";

export default function Footer() {
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="hidden md:block relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-indigo-500 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Organization Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/images/eeam-logo.png"
                    alt="EEAM Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Église Évangélique Au Maroc
                  </h3>
                  <p className="text-sm text-cyan-400 font-medium">Paroisse de Rabat</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                La technologie et l'excellence pour la gloire de Dieu.
                <br />
                <span className="text-cyan-400 italic">"Corinthiens 10:31"</span>
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin size={18} className="text-cyan-400" />
                  <span>Rabat, Maroc</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={18} className="text-cyan-400" />
                  <span>contact@eeam.ma</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-cyan-400" />
                <h4 className="text-lg font-semibold">Liens rapides</h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-de-confidentialite"
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-cookies"
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Politique des cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cookie Settings */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Settings size={20} className="text-cyan-400" />
                <h4 className="text-lg font-semibold">Préférences</h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowCookieSettings(true)}
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group w-full text-left"
                  >
                    <Cookie size={16} className="text-cyan-400" />
                    <span className="group-hover:translate-x-1 transition-transform">Gérer les cookies</span>
                  </button>
                </li>
                <li>
                  <Link
                    href="/politique-cookies"
                    className="text-gray-300 hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <Shield size={16} className="text-cyan-400" />
                    <span className="group-hover:translate-x-1 transition-transform">Politique des cookies</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700/50 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <p className="text-gray-400 text-sm text-center lg:text-left">
                © {currentYear} Église Évangélique Au Maroc. Tous droits réservés.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-cyan-400" />
                  <span>Conformément au RGPD</span>
                </div>
                <div className="hidden sm:block text-gray-600">•</div>
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-red-400 fill-current" />
                  <span>Fait avec ❤️ à Rabat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CookieSettingsModal
        isOpen={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
      />
    </>
  );
}