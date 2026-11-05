import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, Home, LogIn } from "lucide-react";

const KNOWN_ERRORS: Record<string, string> = {
  "Email link is invalid or has expired": "Ce lien a expiré ou n'est plus valide. Demandez-en un nouveau.",
  "Token has expired or is invalid": "Ce lien a expiré ou n'est plus valide. Demandez-en un nouveau.",
  "No token hash or type": "Le lien de confirmation est incomplet.",
};

async function ErrorDetail({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message = error ? KNOWN_ERRORS[error] ?? error : null;
  return (
    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {message ?? "Une erreur inattendue s'est produite. Veuillez réessayer."}
    </p>
  );
}

export default function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
          <AlertTriangle size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-black text-gray-900 dark:text-white">Une erreur est survenue</h1>
        <Suspense fallback={<p className="mt-3 text-sm text-gray-500">…</p>}>
          <ErrorDetail searchParams={searchParams} />
        </Suspense>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <LogIn size={16} /> Se connecter
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Home size={16} /> Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
