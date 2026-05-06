"use client"

import { Calendar, ClipboardList, Home, FileText, UsersRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const PASTORAL_ROLES = ["admin", "pastor"]
const FINANCIAL_ROLES = ["admin", "pastor", "treasurer"]

const ALL_NAV_ITEMS = [
  { label: "Accueil", route: "/dashboard", icon: Home, roles: null },
  { label: "Événements", route: "/dashboard/events", icon: Calendar, roles: null },
  { label: "Formulaires", route: "/dashboard/formulaires", icon: ClipboardList, roles: null },
  { label: "Rapports", route: "/dashboard/rapports", icon: FileText, roles: null },
  { label: "Membres", route: "/dashboard/membres", icon: UsersRound, roles: null },
]

type NavItem = (typeof ALL_NAV_ITEMS)[number]

function NavItemLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
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
}

export default function MobileBottomNav({ role }: { role: string | null }) {
  const pathname = usePathname()
  const navItems = ALL_NAV_ITEMS.filter(
    (item) => item.roles === null || (role != null && item.roles.includes(role))
  )

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
    gap: "0.25rem",
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
      <div style={gridStyle}>
        {navItems.map((item) => (
          <NavItemLink key={item.route} item={item} isActive={pathname === item.route} />
        ))}
      </div>
    </nav>
  )
}
