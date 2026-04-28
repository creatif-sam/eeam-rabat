"use client"

import { Calendar, ClipboardList, Home, FileText, UsersRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { label: "Accueil", route: "/dashboard", icon: Home },
  { label: "Rapports", route: "/dashboard/rapports", icon: FileText },
  { label: "Events", route: "/dashboard/events", icon: Calendar },
  { label: "Formulaires", route: "/dashboard/formulaires", icon: ClipboardList },
  { label: "Membres", route: "/dashboard/membres", icon: UsersRound }
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
      <div className="grid grid-cols-5 gap-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.route

          return (
            <Link
              key={item.route}
              href={item.route}
              className={`flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={17} />
              <span className="mt-1 leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
