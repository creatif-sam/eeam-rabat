"use client"

import { Bell, Mail, LogOut, User as UserIcon } from "lucide-react"
import { logout } from "@/app/auth/logout/actions"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export default function Header({ user }: { user: User }) {
  const fullName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Utilisateur"

  return (
    <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Tableau de bord
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-xl">
            <Bell size={20} className="text-gray-600" />
          </button>

          <button className="relative p-2 hover:bg-gray-100 rounded-xl">
            <Mail size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {fullName}
              </p>
              <p className="text-xs text-gray-500">Leader</p>
            </div>

            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
              {fullName.charAt(0).toUpperCase()}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Link
                href="/profile"
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Modifier le profil"
              >
                <UserIcon size={18} />
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
