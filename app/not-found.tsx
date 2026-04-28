import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl p-8 md:p-10 text-center">
        <p className="inline-flex rounded-full bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
          Error 404
        </p>

        <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
          Page introuvable
        </h1>

        <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          Le lien que vous avez suivi n&apos;existe plus ou l&apos;adresse est incorrecte.
          Revenez a l&apos;accueil pour continuer votre navigation.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Home size={16} />
            Aller a l&apos;accueil
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
