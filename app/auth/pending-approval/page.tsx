import Link from "next/link";
import { Clock } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-8 flex flex-col items-center gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <Clock className="text-amber-500 dark:text-amber-400" size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compte en attente d&apos;approbation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Votre compte a été créé avec succès. Un administrateur ou un pasteur
            doit approuver votre accès avant que vous puissiez utiliser le système.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Vous serez notifié une fois votre compte approuvé.
          </p>
        </div>

        <div className="w-full pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez un administrateur.
          </p>
          <Link
            href="/auth/logout"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Se déconnecter
          </Link>
        </div>
      </div>
    </div>
  );
}
