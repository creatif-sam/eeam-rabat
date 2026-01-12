"use client"

import React, { useState } from "react"
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
  MapPin
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  { label: "Accueil", icon: Home, route: "/dashboard" },
  { label: "Baptêmes", icon: Droplet, route: "/dashboard/baptemes" },
  { label: "Événements", icon: Calendar, route: "/dashboard/events" },
  { label: "Finance", icon: DollarSign, route: "/dashboard/finances" },
  { label: "Formations", icon: GraduationCap, route: "/dashboard/formations" },
  { label: "Commissions", icon: Users, route: "/dashboard/groupes" },
  { label: "Membres", icon: UsersRound, route: "/dashboard/membres" },
  { label: "Rapports", icon: FileText, route: "/dashboard/rapports" },
  { label: "Annexe de J5", icon: MapPin, route: "/dashboard/annexe-j5" }
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white shadow-2xl transition-all duration-300 z-50 ${
        sidebarOpen ? "w-72" : "w-20"
      } flex flex-col`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-gradient-to-r from-rose-600 to-rose-700 shrink-0">
        {sidebarOpen && (
          <span className="text-2xl font-bold text-white tracking-tight">
            EEAM Rabat
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.route

          return (
            <Link
              key={item.label}
              href={item.route}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                  : "text-gray-600 hover:bg-gray-50 hover:text-cyan-600"
              }`}
            >
              <Icon
                size={20}
                className={`${!sidebarOpen && "mx-auto"} transition-transform group-hover:scale-110`}
              />
              {sidebarOpen && (
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

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-6 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 text-center">
            © EEAM 2026
          </p>
        </div>
      )}
    </aside>
  )
}
