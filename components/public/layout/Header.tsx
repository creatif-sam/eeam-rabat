"use client";

import { Church, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Church size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                EEAM RABAT LEAD
              </h1>
              <p className="text-gray-600">
                Intranet_Lead
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg font-medium flex items-center gap-2"
          >
            <LogIn size={20} />
            Connexion
          </button>
        </div>
      </div>
    </header>
  );
}
