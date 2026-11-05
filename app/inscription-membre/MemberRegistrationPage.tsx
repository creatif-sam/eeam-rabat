"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  HandHeart,
  Home,
  ListChecks,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import SiteLayout from "@/components/public/layout/SiteLayout";
import MemberRegistrationForm from "@/components/public/MemberRegistrationForm";

const BENEFITS = [
  { icon: Users, title: "Faire partie de la famille", text: "Être connu et accompagné par la paroisse." },
  { icon: CalendarDays, title: "Rester informé", text: "Cultes, cellules et activités de l'année." },
  { icon: HandHeart, title: "Servir", text: "Trouver sa place dans un ministère ou une commission." },
];

const CHECKLIST = [
  "Votre paroisse (centre-ville ou annexe J5)",
  "Identité : nom, genre, nationalité",
  "Coordonnées : téléphone, adresse / quartier",
  "Baptême (année si baptisé) et commissions souhaitées",
];

export default function MemberRegistrationPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/#services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux services
        </Link>

        {submitted ? (
          /* ---------------- Thank you ---------------- */
          <div className="max-w-xl mx-auto text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl px-6 py-12 sm:px-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 size={34} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Bienvenue dans la famille !</h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              Votre inscription a bien été enregistrée. Un responsable de la paroisse prendra contact avec vous prochainement.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#calendar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 text-sm font-semibold transition-colors"
              >
                <CalendarDays size={16} /> Voir le calendrier
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
            {/* ---------------- Page header ---------------- */}
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <UserPlus size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Inscription membre</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Rejoignez notre communauté et devenez membre de l&apos;EEAM Rabat.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 items-start">
              {/* Form */}
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
                <MemberRegistrationForm
                  publicMode
                  onSuccess={() => {
                    setSubmitted(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>

              {/* Side info */}
              <aside className="space-y-4 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Clock size={16} className="text-cyan-600" /> Environ 3 minutes
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <ListChecks size={14} /> À prévoir
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                    {CHECKLIST.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden lg:block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-5 space-y-4">
                  {BENEFITS.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="flex gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={16} className="shrink-0" />
                  <span>
                    Vos informations restent confidentielles et ne sont utilisées que par la paroisse.{" "}
                    <Link href="/politique-de-confidentialite" className="font-semibold underline underline-offset-2">
                      En savoir plus
                    </Link>
                  </span>
                </p>
              </aside>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
