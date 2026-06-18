"use client";

import SiteLayout from "@/components/public/layout/SiteLayout";
import PastoralCounsellingForm from "@/components/public/CounsellingBooking";

export default function PastoralPage() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Page title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Entretien Pastoral
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Réservez un rendez-vous avec l&apos;un de nos pasteurs
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8">
          <PastoralCounsellingForm />
        </div>
      </div>
    </SiteLayout>
  );
}
