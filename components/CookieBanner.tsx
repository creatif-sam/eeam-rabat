"use client";

import { useState, useEffect } from "react";
import {
  X,
  Settings,
  Cookie,
  Shield,
  BarChart3,
  ShoppingCart,
  Heart
} from "lucide-react";
import { useCookieConsent, CookieSettings } from "@/lib/cookieUtils";

export default function CookieBanner() {
  const {
    settings,
    isAccepted,
    isLoading,
    acceptAll,
    acceptNecessary,
    saveSettings
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [customSettings, setCustomSettings] =
    useState<CookieSettings>(settings);

  useEffect(() => {
    setCustomSettings(settings);
  }, [settings]);

  if (isLoading || isAccepted) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
  };

  const handleSaveSettings = () => {
    saveSettings(customSettings);
    setShowDetails(false);
  };

  const handleReject = () => {
    acceptNecessary();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Nous utilisons des cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Vous pouvez gérer vos préférences à tout moment.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Personnaliser
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cookies essentiels
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Accepter tout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Préférences des cookies</h3>
              <button onClick={() => setShowDetails(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-3">
              <label>
                <input
                  type="checkbox"
                  checked={customSettings.analytics}
                  onChange={e =>
                    setCustomSettings(s => ({
                      ...s,
                      analytics: e.target.checked
                    }))
                  }
                />
                Cookies d'analyse
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={customSettings.marketing}
                  onChange={e =>
                    setCustomSettings(s => ({
                      ...s,
                      marketing: e.target.checked
                    }))
                  }
                />
                Cookies marketing
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={customSettings.preferences}
                  onChange={e =>
                    setCustomSettings(s => ({
                      ...s,
                      preferences: e.target.checked
                    }))
                  }
                />
                Cookies de préférences
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={handleReject} className="border px-4 py-2">
                Refuser
              </button>
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-4 py-2"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
