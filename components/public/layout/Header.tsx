"use client";

import Image from "next/image";
import { LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ onLogin, onSignUp }: { onLogin?: () => void; onSignUp?: () => void }) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14">
              <Image
                src="/images/eeam-logo.png"
                alt="EEAM Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                EEAM Rabat
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Intranet Lead
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() =>
                onSignUp ? onSignUp() : router.push("/auth/sign-up")
              }
              className="flex items-center justify-center gap-2
                px-3 py-3 sm:px-6 sm:py-3
                bg-white border-2 border-cyan-500 text-cyan-600
                rounded-xl shadow-lg
                hover:bg-cyan-50 transition"
              aria-label="S'inscrire"
            >
              <UserPlus size={20} />
              <span className="hidden sm:inline font-medium">
                S'inscrire
              </span>
            </button>

            <button
              onClick={() =>
                onLogin ? onLogin() : router.push("/auth/login")
              }
              className="flex items-center justify-center gap-2
                px-3 py-3 sm:px-6 sm:py-3
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white rounded-xl shadow-lg
                hover:from-cyan-600 hover:to-blue-700 transition"
              aria-label="Connexion"
            >
              <LogIn size={20} />
              <span className="hidden sm:inline font-medium">
                Connexion
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
