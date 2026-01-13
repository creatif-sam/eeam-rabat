"use client";

import { useState, useEffect } from "react";
import { X, Settings, Cookie, Shield, BarChart3, ShoppingCart, Heart, Save, RotateCcw } from "lucide-react";
import { useCookieConsent, CookieSettings, DEFAULT_COOKIE_SETTINGS } from "@/lib/cookieUtils";
import BaseModal from "@/components/modals/BaseModal";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const { settings, saveSettings, rejectAll } = useCookieConsent();
  const [customSettings, setCustomSettings] = useState<CookieSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCustomSettings(settings);
    setHasChanges(false);
  }, [settings, isOpen]);

  const handleSettingChange = (key: keyof CookieSettings, value: boolean) => {
    setCustomSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(customSettings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setCustomSettings(DEFAULT_COOKIE_SETTINGS);
    setHasChanges(true);
  };

  const handleRejectAll = () => {
    rejectAll();
    setCustomSettings(DEFAULT_COOKIE_SETTINGS);
    setHasChanges(false);
    onClose();
  };

  const cookieCategories = [
    {
      id: "necessary" as keyof CookieSettings,
      title: "Cookies essentiels",
      description: "Ces cookies sont nécessaires au fonctionnement du site web et ne peuvent pas être désactivés.",
      icon: Shield,
      color: "text-green-600",
      required: true,
    },
    {
      id: "analytics" as keyof CookieSettings,
      title: "Cookies d'analyse",
      description: "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web en collectant des informations anonymes.",
      icon: BarChart3,
      color: "text-blue-600",
      required: false,
    },
    {
      id: "marketing" as keyof CookieSettings,
      title: "Cookies marketing",
      description: "Ces cookies sont utilisés pour vous proposer des publicités pertinentes et mesurer l'efficacité de nos campagnes.",
      icon: ShoppingCart,
      color: "text-purple-600",
      required: false,
    },
    {
      id: "preferences" as keyof CookieSettings,
      title: "Cookies de préférences",
      description: "Ces cookies permettent de mémoriser vos préférences et personnaliser votre expérience sur notre site.",
      icon: Heart,
      color: "text-red-600",
      required: false,
    },
  ];

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      title="Paramètres des cookies"
      subtitle="Gérez vos préférences de cookies"
      headerClass="bg-gradient-to-r from-blue-500 to-indigo-600"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Cookie className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                À propos des cookies
              </h4>
              <p className="text-sm text-blue-700">
                Les cookies sont de petits fichiers texte stockés sur votre appareil qui nous aident à améliorer votre expérience.
                Vous pouvez modifier vos préférences à tout moment.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {cookieCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${category.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {category.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.required ? true : customSettings[category.id]}
                        disabled={category.required}
                        onChange={(e) => handleSettingChange(category.id, e.target.checked)}
                        className={`w-4 h-4 ${
                          category.required
                            ? "text-gray-400 bg-gray-100"
                            : `${category.color.replace('text-', 'text-').replace('-600', '-600')} bg-gray-100 border-gray-300`
                        } rounded focus:ring-2 focus:ring-offset-0`}
                      />
                      <label className={`ml-2 text-sm ${category.required ? 'text-gray-500' : 'text-gray-700'}`}>
                        {category.required ? "Toujours activé (requis)" : "Activer"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Informations supplémentaires
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Durée de conservation :</strong> Les cookies essentiels sont conservés pendant votre session.
              Les autres cookies expirent après 12 mois maximum.
            </p>
            <p>
              <strong>Partage de données :</strong> Nous ne partageons pas vos données personnelles avec des tiers sans votre consentement explicite.
            </p>
            <p>
              <strong>Vos droits :</strong> Conformément au RGPD, vous avez le droit d'accéder, rectifier et supprimer vos données.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleRejectAll}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            Refuser tous les cookies
          </button>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Réinitialiser
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                hasChanges
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4 inline mr-2" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}