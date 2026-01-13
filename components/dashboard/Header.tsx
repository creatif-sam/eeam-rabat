"use client"

import { Bell, LogOut } from "lucide-react"
import { logout } from "@/app/auth/logout/actions"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type Profile = {
  full_name: string | null
  avatar_url: string | null
  role: string | null
}

function formatRole(role?: string | null) {
  if (!role) return "Utilisateur"

  const map: Record<string, string> = {
    admin: "Administrateur",
    membre_cp: "Membre CP",
    president_cp: "Président CP",
    corps_pastoral: "Corps pastoral"
  }

  return map[role] ?? role
}

export default function Header({ user }: { user: User }) {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single()

      setProfile(data)
    }

    loadProfile()
  }, [supabase, user.id])

  const fullName =
    profile?.full_name ??
    user.email?.split("@")[0] ??
    "Utilisateur"

  const initials = fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Tableau de bord
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-xl">
            <Bell size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {fullName}
              </p>
              <p className="text-xs text-gray-500">
                {formatRole(profile?.role)}
              </p>
            </div>

            <Link
              href="/dashboard/profile"
              className="w-11 h-11 rounded-full overflow-hidden shadow-lg border border-gray-200 hover:ring-2 hover:ring-cyan-500 transition flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold"
              title="Voir le profil"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
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
    </header>
  )
}
