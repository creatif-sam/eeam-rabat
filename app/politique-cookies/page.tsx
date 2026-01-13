"use client";

import Link from "next/link";
import { ArrowLeft, Cookie, Shield, Eye, Settings } from "lucide-react";

export default function CookiePolicyPage() {
  // Use a static date to avoid hydration issues
  const currentDate = "13 janvier 2026";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <Cookie className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Politique des Cookies
              </h1>
              <p className="text-gray-600 mt-1">
                Dernière mise à jour : {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Qu'est-ce qu'un cookie ?
          </h2>
          <p className="text-gray-700 mb-4">
            Un cookie est un petit fichier texte stocké sur votre ordinateur, tablette ou téléphone portable
            lorsque vous visitez notre site web. Les cookies nous permettent de reconnaître votre navigateur
            et de mémoriser certaines informations pour améliorer votre expérience utilisateur.
          </p>
          <p className="text-gray-700">
            Cette politique explique comment nous utilisons les cookies et comment vous pouvez les contrôler.
          </p>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Cookies Essentiels
              </h3>
            </div>
            <p className="text-gray-700 mb-4">
              Ces cookies sont nécessaires au fonctionnement de base de notre site web. Ils permettent
              la navigation, l'accès aux zones sécurisées et l'utilisation des fonctionnalités essentielles.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Exemples :</strong> Cookies de session, cookies d'authentification, cookies de sécurité.
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Durée :</strong> Session ou jusqu'à déconnexion.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Cookies d'Analyse
              </h3>
            </div>
            <p className="text-gray-700 mb-4">
              Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site web,
              quelles pages sont les plus populaires et comment nous pouvons améliorer l'expérience utilisateur.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Exemples :</strong> Google Analytics, statistiques de visite.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Durée :</strong> 26 mois maximum.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Cookies de Préférences
              </h3>
            </div>
            <p className="text-gray-700 mb-4">
              Ces cookies permettent de mémoriser vos choix et préférences (langue, thème, etc.)
              pour personnaliser votre expérience sur notre plateforme.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Exemples :</strong> Choix de langue, préférences d'affichage.
              </p>
              <p className="text-sm text-purple-800 mt-2">
                <strong>Durée :</strong> 12 mois.
              </p>
            </div>
          </div>
        </div>

        {/* How to Control Cookies */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comment contrôler les cookies ?
          </h2>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. Paramètres de notre site
              </h4>
              <p className="text-gray-700">
                Utilisez le bouton "Personnaliser" dans notre bannière de cookies ou cliquez sur
                "Gérer les cookies" dans le pied de page pour modifier vos préférences à tout moment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Paramètres de votre navigateur
              </h4>
              <p className="text-gray-700 mb-2">
                Vous pouvez également contrôler les cookies via les paramètres de votre navigateur :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Chrome :</strong> Paramètres → Confidentialité → Cookies</li>
                <li><strong>Firefox :</strong> Préférences → Vie privée → Cookies</li>
                <li><strong>Safari :</strong> Préférences → Confidentialité → Gérer les données de sites web</li>
                <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Extensions de navigateur
              </h4>
              <p className="text-gray-700">
                Des extensions comme uBlock Origin, Privacy Badger ou Ghostery peuvent
                vous aider à contrôler les cookies de manière plus avancée.
              </p>
            </div>
          </div>
        </div>

        {/* Data Protection */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Protection des données
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              marocaine sur la protection des données personnelles, nous nous engageons à :
            </p>

            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Ne collecter que les données nécessaires au bon fonctionnement de nos services</li>
              <li>Ne pas partager vos données personnelles avec des tiers sans votre consentement</li>
              <li>Vous offrir un contrôle total sur vos données et préférences</li>
              <li>Sécuriser vos données avec des mesures techniques appropriées</li>
              <li>Respecter vos droits d'accès, rectification et suppression de vos données</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Contact et support
          </h2>

          <p className="text-gray-700 mb-4">
            Si vous avez des questions concernant notre politique de cookies ou souhaitez
            exercer vos droits concernant vos données personnelles, n'hésitez pas à nous contacter :
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800">
              <strong>Email :</strong> contact@eeam.ma<br />
              <strong>Téléphone :</strong> +212 XXX XXX XXX<br />
              <strong>Adresse :</strong> Rabat, Maroc
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Cette politique peut être mise à jour. Nous vous recommandons de la consulter régulièrement.
          </p>
        </div>
      </div>
    </div>
  );
}