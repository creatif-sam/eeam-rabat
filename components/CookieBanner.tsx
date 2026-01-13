"use client";

import { useState, useEffect } from "react";
import { X, Settings, Cookie, Shield, BarChart3, ShoppingCart, Heart } from "lucide-react";
import { useCookieConsent, CookieSettings } from "@/lib/cookieUtils";

interface CookieBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export default function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const { settings, isAccepted, acceptAll, acceptNecessary, saveSettings } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [customSettings, setCustomSettings] = useState<CookieSettings>(settings);

  useEffect(() => {
    setCustomSettings(settings);
  }, [settings]);

  // Don't show banner if consent already given
  if (isAccepted) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
    onAccept?.();
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
    onAccept?.();
  };

  const handleSaveSettings = () => {
    saveSettings(customSettings);
    setShowDetails(false);
    onAccept?.();
  };

  const handleReject = () => {
    // Note: Rejecting all cookies might not be GDPR compliant in some jurisdictions
    // This is a basic implementation
    onReject?.();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          // Main banner
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Cookie className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Nous utilisons des cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser l'utilisation du site
                  et vous proposer du contenu personnalisé. Vous pouvez gérer vos préférences à tout moment.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Personnaliser
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cookies essentiels uniquement
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Accepter tout
              </button>
            </div>
          </div>
        ) : (
          // Detailed settings
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Préférences des cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      Cookies essentiels
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Ces cookies sont nécessaires au fonctionnement du site web et ne peuvent pas être désactivés.
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Toujours activé
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      Cookies d'analyse
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web.
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customSettings.analytics}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          analytics: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Activer les cookies d'analyse
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShoppingCart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      Cookies marketing
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Ces cookies sont utilisés pour vous proposer des publicités pertinentes.
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customSettings.marketing}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          marketing: e.target.checked
                        }))}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Activer les cookies marketing
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      Cookies de préférences
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Ces cookies permettent de mémoriser vos préférences et personnaliser votre expérience.
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customSettings.preferences}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          preferences: e.target.checked
                        }))}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Activer les cookies de préférences
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleReject}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Refuser tout
              </button>
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Enregistrer mes choix
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}