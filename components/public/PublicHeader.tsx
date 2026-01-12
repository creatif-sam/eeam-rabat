"use client";

import { Church, LogIn } from "lucide-react";

export default function PublicHeader({
  onLogin
}: {
  onLogin?: () => void;
}) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Church size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">EEAM LEAD</h1>
              <p className="text-gray-600">
                Intranet Église Évangélique
              </p>
            </div>
          </div>

          {onLogin && (
            <button
              onClick={onLogin}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30 font-medium"
            >
              <LogIn size={20} />
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
