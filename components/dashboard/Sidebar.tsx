"use client"

import React from "react"
import {
  Home,
  Droplet,
  Calendar,
  GraduationCap,
  Users,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  UsersRound,
  FileText,
  MapPin,
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "./SidebarContext"

const menuItems = [
  { label: "Accueil", icon: Home, route: "/dashboard" },
  { label: "Baptêmes", icon: Droplet, route: "/dashboard/baptemes" },
  { label: "Événements", icon: Calendar, route: "/dashboard/events" },
  { label: "Planification", icon: ClipboardList, route: "/dashboard/tasky" },

  { label: "Formulaires", icon: ClipboardList, route: "/dashboard/formulaires" },

  { label: "Finance", icon: DollarSign, route: "/dashboard/finances" },
  { label: "Formations", icon: GraduationCap, route: "/dashboard/formations" },
  { label: "Commissions", icon: Users, route: "/dashboard/groupes" },
  { label: "Membres", icon: UsersRound, route: "/dashboard/membres" },
  { label: "Rapports", icon: FileText, route: "/dashboard/rapports" },
  { label: "Annexe de J5", icon: MapPin, route: "/dashboard/annexe-j5" }
]

export default function Sidebar() {
  const { isMobileOpen, setIsMobileOpen, isDesktopExpanded, toggleSidebar } = useSidebar()
  const pathname = usePathname()

  const closeMobileSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
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
        className={`fixed left-0 top-0 h-screen bg-white shadow-2xl transition-all duration-300 z-50 ${
          // Mobile: full overlay when open
          isMobileOpen ? "w-72" :
          // Desktop: expanded or collapsed
          typeof window !== 'undefined' && window.innerWidth >= 768 ? (isDesktopExpanded ? "w-72" : "w-20") : "w-0"
        } flex flex-col overflow-hidden`}
      >
        <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b border-gray-100 bg-gradient-to-r from-rose-600 to-rose-700 shrink-0">
          {((isMobileOpen && typeof window !== 'undefined' && window.innerWidth < 768) || (isDesktopExpanded && typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
              EEAM Rabat
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white ml-auto md:ml-0"
          >
            {isMobileOpen || isDesktopExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 md:space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.route
            const isCollapsed = !isMobileOpen && !isDesktopExpanded && typeof window !== 'undefined' && window.innerWidth >= 768

            return (
              <Link
                key={item.label}
                href={item.route}
                onClick={closeMobileSidebar}
                className={`w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                    : "text-gray-600 hover:bg-gray-50 hover:text-cyan-600"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={`${isCollapsed && "mx-auto"} transition-transform group-hover:scale-110`}
                />
                {((isMobileOpen && typeof window !== 'undefined' && window.innerWidth < 768) || (isDesktopExpanded && typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                  <>
                    <span className="font-medium flex-1 text-left">
                      {item.label}
                    </span>
                    {isActive && <ChevronRight size={16} />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {((isMobileOpen && typeof window !== 'undefined' && window.innerWidth < 768) || (isDesktopExpanded && typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <div className="p-4 md:p-6 border-t border-gray-100 shrink-0">
            <p className="text-xs text-gray-400 text-center">
              © EEAM 2026
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
