"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import Paper from "@mui/material/Paper"
import type { SvgIconComponent } from "@mui/icons-material"
import {
  AssessmentOutlined,
  AssignmentOutlined,
  EventOutlined,
  HomeOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material"

const ALL_NAV_ITEMS: { label: string; route: string; icon: SvgIconComponent; roles: string[] | null }[] = [
  { label: "Accueil", route: "/dashboard", icon: HomeOutlined, roles: null },
  { label: "Événements", route: "/dashboard/events", icon: EventOutlined, roles: null },
  { label: "Formulaires", route: "/dashboard/formulaires", icon: AssignmentOutlined, roles: null },
  { label: "Rapports", route: "/dashboard/rapports", icon: AssessmentOutlined, roles: null },
  { label: "Membres", route: "/dashboard/membres", icon: PeopleAltOutlined, roles: null },
]

export default function MobileBottomNav({ role }: { role: string | null }) {
  const pathname = usePathname()
  const navItems = ALL_NAV_ITEMS.filter(
    (item) => item.roles === null || (role != null && item.roles.includes(role))
  )

  const active = navItems.find((item) =>
    item.route === "/dashboard" ? pathname === item.route : pathname.startsWith(item.route)
  )

  return (
    <Paper
      elevation={8}
      square
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <BottomNavigation showLabels value={active?.route ?? false}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <BottomNavigationAction
              key={item.route}
              value={item.route}
              label={item.label}
              icon={<Icon />}
              component={Link}
              href={item.route}
              sx={{ minWidth: 0, px: 0.5, "& .MuiBottomNavigationAction-label": { fontSize: 11 } }}
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}
