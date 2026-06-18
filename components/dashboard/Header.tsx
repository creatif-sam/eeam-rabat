"use client"

import { Bell, LogOut, CheckCheck, X, Info, AlertTriangle, CheckCircle2, Users } from "lucide-react"
import { logout } from "@/app/auth/logout/actions"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { toast } from "sonner"

type Profile = {
  full_name: string | null
  avatar_url: string | null
  role: string | null
}

type Notification = {
  id: string
  type: "info" | "success" | "warning"
  message: string
  read: boolean
  created_at: string
}

function formatRole(role?: string | null) {
  if (!role) return "Utilisateur"

  const map: Record<string, string> = {
    admin: "Administrateur",
    pastor: "Pasteur",
    treasurer: "Trésorier",
    cp: "Membre CP",
    membre_cp: "Membre CP",
    president_cp: "Membre CP",
    corps_pastoral: "Pasteur"
  }

  return map[role] ?? role
}

export default function Header({ user }: { user: User }) {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

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
    loadNotifications()
  }, [supabase, user.id])

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
    setNotifications(data || [])
    // Show unread as sonner toasts on load
    const unread = (data || []).filter((n: Notification) => !n.read)
    unread.slice(0, 3).forEach((n: Notification) => {
      if (n.type === "success") toast.success(n.message)
      else if (n.type === "warning") toast.warning(n.message)
      else toast.info(n.message)
    })
  }

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    const { error } = await supabase.from("notifications").update({ read: true }).in("id", unreadIds)
    if (error) {
      toast.error("Impossible de marquer les notifications comme lues.")
      return
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success("Toutes les notifications marquées comme lues")
  }

  async function deleteNotif(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id)
    if (error) {
      toast.error("Impossible de supprimer la notification.")
      return
    }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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

  const unreadCount = notifications.filter(n => !n.read).length

  const notifIcon = (type: Notification["type"]) => {
    if (type === "success") return <CheckCircle2 size={14} className="text-green-500" />
    if (type === "warning") return <AlertTriangle size={14} className="text-amber-500" />
    return <Info size={14} className="text-cyan-500" />
  }

  return (
    <header className="h-16 md:h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Tableau de bord
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(v => !v)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      <CheckCheck size={13} /> Tout lire
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">Aucune notification</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.read ? "bg-white dark:bg-gray-900" : "bg-cyan-50 dark:bg-cyan-900/20"}`}
                      >
                        <div className="mt-0.5">{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${n.read ? "text-gray-600 dark:text-gray-400" : "text-gray-800 dark:text-gray-200 font-medium"}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(n.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotif(n.id)}
                          className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 mt-0.5 shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatRole(profile?.role)}
              </p>
            </div>

            <div
              className="relative"
              ref={profileMenuRef}
            >
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-cyan-500 transition flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold text-sm md:text-base"
                title="Menu profil"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Users size={14} /> Voir profil
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
