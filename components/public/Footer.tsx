"use client";

import Link from "next/link";
import { Cookie, Shield, ExternalLink } from "lucide-react";
import { useState } from "react";
import CookieSettingsModal from "@/components/CookieSettingsModal";

export default function Footer() {
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Organization Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Église Évangélique Au Maroc</h3>
              <p className="text-gray-300 mb-4">
                La technologie et l'excellence pour la gloire de Dieu.
                <br />
                Corinthiens 10:31
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Rabat, Maroc</p>
                <p>Contact: contact@eeam.ma</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/politique-de-confidentialite" className="text-gray-300 hover:text-white transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/politique-cookies" className="text-gray-300 hover:text-white transition-colors">
                    Politique des cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cookie Settings */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Préférences</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowCookieSettings(true)}
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Cookie size={16} />
                    Gérer les cookies
                  </button>
                </li>
                <li>
                  <Link
                    href="/politique-cookies"
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Shield size={16} />
                    Politique des cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Église Évangélique Au Maroc. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Conformément au RGPD</span>
              <span>•</span>
              <span>Fait avec ❤️ à Rabat</span>
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