"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, HandHeart, Home, MessageCircle, Sprout, Users } from "lucide-react";
import SiteLayout from "@/components/public/layout/SiteLayout";
import JoinCommissionForm from "@/components/public/JoinCommission";

const POINTS = [
  { icon: Users, title: "Servir ensemble", text: "Chaque commission fait vivre un aspect de la paroisse : accueil, chorale, multimédia, intercession…" },
  { icon: Sprout, title: "Grandir dans la foi", text: "Être entouré, formé et accompagné par des responsables." },
  { icon: MessageCircle, title: "Un responsable vous contacte", text: "Après votre demande, le responsable de la commission prend contact avec vous." },
];

export default function JoinCommissionPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/#services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux services
        </Link>

        {sent ? (
          <div className="max-w-xl mx-auto text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl px-6 py-12 sm:px-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
              <CheckCircle2 size={34} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Demande envoyée !</h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              Merci pour votre engagement. Le responsable de la commission vous contactera prochainement.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#services"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 text-sm font-semibold transition-colors"
              >
                <HandHeart size={16} /> Découvrir les autres services
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-3 text-sm font-semibold transition-colors"
              >
                <Home size={16} /> Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg">
                <Users size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                  Rejoindre une commission
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Engagez-vous dans un service et participez activement à la vie de l&apos;église.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 items-start">
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-5 sm:p-8">
                <JoinCommissionForm
                  showHeader={false}
                  onSuccess={() => {
                    setSent(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>

              <aside className="space-y-4 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-5 space-y-4">
                  {POINTS.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/inscription-membre"
                  className="block rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <span className="block font-semibold">Pas encore membre ?</span>
                  <span className="block mt-1 text-sm text-white/80">Inscrivez-vous comme membre de la paroisse →</span>
                </Link>
              </aside>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
