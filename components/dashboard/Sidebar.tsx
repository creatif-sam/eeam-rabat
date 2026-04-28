"use client"

import React from "react"
import {
  Home,
  Droplet,
  Calendar,
  GraduationCap,
  Users,
  UserCog,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  UsersRound,
  FileText,
  MapPin,
  ClipboardList,
  ListTodo,
  Settings
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "./SidebarContext"

const allMenuItems = [
  { label: "Accueil", icon: Home, route: "/dashboard", adminOnly: false },
  { label: "Annexe de J5", icon: MapPin, route: "/dashboard/annexe-j5", adminOnly: false },
  { label: "Baptêmes", icon: Droplet, route: "/dashboard/baptemes", adminOnly: false },
  { label: "Commissions", icon: Users, route: "/dashboard/groupes", adminOnly: false },
  { label: "Événements", icon: Calendar, route: "/dashboard/events", adminOnly: false },
  { label: "Finance", icon: DollarSign, route: "/dashboard/finances", adminOnly: false },
  { label: "Formations", icon: GraduationCap, route: "/dashboard/formations", adminOnly: false },
  { label: "Formulaires", icon: ClipboardList, route: "/dashboard/formulaires", adminOnly: false },
  { label: "Logs", icon: FileText, route: "/dashboard/logs", adminOnly: true },
  { label: "Membres", icon: UsersRound, route: "/dashboard/membres", adminOnly: false },
  { label: "Paramètres", icon: Settings, route: "/dashboard/settings", adminOnly: true },
  { label: "Planify", icon: ListTodo, route: "/dashboard/tasky", adminOnly: false },
  { label: "Rapports", icon: FileText, route: "/dashboard/rapports", adminOnly: false },
  { label: "Utilisateurs", icon: UserCog, route: "/dashboard/users", adminOnly: true },
]

const PRIVILEGED_ROLES = ["admin", "pastor"]

export default function Sidebar({ role }: { role: string | null }) {
  const { isMobileOpen, setIsMobileOpen, isDesktopExpanded, toggleSidebar } = useSidebar()
  const pathname = usePathname()

  const isPrivileged = role != null && PRIVILEGED_ROLES.includes(role)
  const menuItems = allMenuItems.filter(item => !item.adminOnly || isPrivileged)

  // showLabel: true when sidebar is fully open (mobile overlay OR desktop expanded)
  const showLabel = isMobileOpen || isDesktopExpanded

  const closeMobileSidebar = () => setIsMobileOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 z-50 flex flex-col overflow-hidden
          ${isMobileOpen ? "w-72" : isDesktopExpanded ? "w-0 md:w-72" : "w-0 md:w-20"}`}
      >
        {/* Brand header */}
        <div className={`h-16 md:h-20 flex items-center border-b border-white/20 bg-gradient-to-r from-rose-600 to-rose-700 shrink-0 transition-all duration-300
          ${showLabel ? "px-4 md:px-5 justify-between" : "justify-center px-2"}`}
        >
          {showLabel && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">EE</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight truncate">
                EEAM Rabat
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white flex-shrink-0"
            title={showLabel ? "Réduire" : "Développer"}
          >
            {showLabel ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto dark:bg-gray-900 space-y-0.5 transition-all duration-300
          ${showLabel ? "p-3" : "p-2"}`}
        >
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.route

            return (
              <Link
                key={item.label}
                href={item.route}
                onClick={closeMobileSidebar}
                title={!showLabel ? item.label : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 group
                  ${showLabel
                    ? "gap-3 px-3 py-2.5"
                    : "justify-center p-3"
                  }
                  ${isActive
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400"
                  }`}
              >
                <Icon
                  size={18}
                  className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                {showLabel && (
                  <>
                    <span className="font-medium flex-1 text-left text-sm truncate">
                      {item.label}
                    </span>
                    {isActive && <ChevronRight size={14} className="flex-shrink-0 opacity-70" />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-gray-100 dark:border-gray-800 shrink-0 transition-all duration-300
          ${showLabel ? "p-4" : "p-2 flex justify-center"}`}
        >
          {showLabel ? (
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              EEAM Rabat © 2026
            </p>
          ) : (
            <div className="w-6 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
          )}
        </div>
      </aside>
    </>
  )
}
