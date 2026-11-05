"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import type { SvgIconComponent } from "@mui/icons-material"
import {
  AssessmentOutlined,
  AssignmentOutlined,
  CampaignOutlined,
  ChecklistOutlined,
  ChevronLeft,
  EventOutlined,
  GroupsOutlined,
  HomeOutlined,
  Inventory2Outlined,
  ManageAccountsOutlined,
  Menu as MenuIcon,
  MenuBookOutlined,
  PaymentsOutlined,
  PeopleAltOutlined,
  PlaceOutlined,
  ReceiptLongOutlined,
  SchoolOutlined,
  SettingsOutlined,
  WaterDropOutlined,
} from "@mui/icons-material"
import { useSidebar } from "./SidebarContext"

export const DRAWER_WIDTH = 280
export const DRAWER_COLLAPSED_WIDTH = 76

const ADMIN_ROLES = ["admin", "pastor"]
const FINANCIAL_ROLES = ["admin", "pastor", "treasurer"]

type MenuItem = { label: string; icon: SvgIconComponent; route: string; roles: string[] | null }

const allMenuItems: MenuItem[] = [
  { label: "Accueil", icon: HomeOutlined, route: "/dashboard", roles: null },
  { label: "Annonces", icon: CampaignOutlined, route: "/dashboard/annonces", roles: ADMIN_ROLES },
  { label: "Annexe de J5", icon: PlaceOutlined, route: "/dashboard/annexe-j5", roles: null },
  { label: "Baptêmes", icon: WaterDropOutlined, route: "/dashboard/baptemes", roles: null },
  { label: "Commissions", icon: GroupsOutlined, route: "/dashboard/groupes", roles: null },
  { label: "Événements", icon: EventOutlined, route: "/dashboard/events", roles: null },
  { label: "Finance", icon: PaymentsOutlined, route: "/dashboard/finances", roles: FINANCIAL_ROLES },
  { label: "Formations", icon: SchoolOutlined, route: "/dashboard/formations", roles: null },
  { label: "Formulaires", icon: AssignmentOutlined, route: "/dashboard/formulaires", roles: null },
  { label: "Logistique", icon: Inventory2Outlined, route: "/dashboard/logistique", roles: ADMIN_ROLES },
  { label: "Logs", icon: ReceiptLongOutlined, route: "/dashboard/logs", roles: ADMIN_ROLES },
  { label: "Membres", icon: PeopleAltOutlined, route: "/dashboard/membres", roles: null },
  { label: "Paramètres", icon: SettingsOutlined, route: "/dashboard/settings", roles: ADMIN_ROLES },
  { label: "Planify", icon: ChecklistOutlined, route: "/dashboard/tasky", roles: null },
  { label: "Rapports", icon: AssessmentOutlined, route: "/dashboard/rapports", roles: null },
  { label: "Ressources", icon: MenuBookOutlined, route: "/dashboard/ressources", roles: null },
  { label: "Utilisateurs", icon: ManageAccountsOutlined, route: "/dashboard/users", roles: ADMIN_ROLES },
]

function isRouteActive(pathname: string, route: string) {
  if (route === "/dashboard") return pathname === route
  return pathname === route || pathname.startsWith(route + "/")
}

function NavContent({
  items,
  expanded,
  onToggle,
  onNavigate,
}: {
  items: MenuItem[]
  expanded: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <Box
        sx={{
          height: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          px: expanded ? 2 : 1,
          bgcolor: "secondary.main",
          color: "secondary.contrastText",
        }}
      >
        {expanded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Avatar
              variant="rounded"
              sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700, bgcolor: "rgba(255,255,255,0.2)", color: "inherit" }}
            >
              EE
            </Avatar>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
              EEAM Rabat
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          color="inherit"
          aria-label={expanded ? "Réduire le menu" : "Développer le menu"}
        >
          {expanded ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <List component="nav" sx={{ flex: 1, overflowY: "auto", px: expanded ? 1.5 : 1, py: 1.5 }}>
        {items.map((item) => {
          const Icon = item.icon
          const active = isRouteActive(pathname, item.route)
          const button = (
            <ListItemButton
              key={item.route}
              component={Link}
              href={item.route}
              onClick={onNavigate}
              selected={active}
              sx={(theme) => ({
                mb: 0.5,
                minHeight: 44,
                justifyContent: expanded ? "flex-start" : "center",
                px: expanded ? 2 : 1.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.14)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                  "&:hover": { bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.2)" },
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 2 : 0, justifyContent: "center" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { noWrap: true, sx: { fontSize: 14, fontWeight: active ? 600 : 500 } } }}
                />
              )}
            </ListItemButton>
          )

          return expanded ? (
            button
          ) : (
            <Tooltip key={item.route} title={item.label} placement="right">
              {button}
            </Tooltip>
          )
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, textAlign: "center", flexShrink: 0 }}>
        {expanded ? (
          <Typography variant="caption" color="text.secondary">
            EEAM Rabat © {new Date().getFullYear()}
          </Typography>
        ) : (
          <Box sx={{ width: 24, height: 4, mx: "auto", borderRadius: 2, bgcolor: "divider" }} />
        )}
      </Box>
    </Box>
  )
}

export default function Sidebar({ role }: { role: string | null }) {
  const { isMobileOpen, setIsMobileOpen, isDesktopExpanded, setIsDesktopExpanded } = useSidebar()

  const items = allMenuItems.filter(
    (item) => item.roles === null || (role != null && item.roles.includes(role))
  )

  const desktopWidth = isDesktopExpanded ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH

  return (
    <>
      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <NavContent
          items={items}
          expanded
          onToggle={() => setIsMobileOpen(false)}
          onNavigate={() => setIsMobileOpen(false)}
        />
      </Drawer>

      {/* Desktop: permanent mini-variant drawer */}
      <Drawer
        variant="permanent"
        open
        sx={(theme) => ({
          display: { xs: "none", md: "block" },
          width: desktopWidth,
          flexShrink: 0,
          transition: theme.transitions.create("width", { duration: theme.transitions.duration.standard }),
          "& .MuiDrawer-paper": {
            width: desktopWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: theme.transitions.create("width", { duration: theme.transitions.duration.standard }),
          },
        })}
      >
        <NavContent
          items={items}
          expanded={isDesktopExpanded}
          onToggle={() => setIsDesktopExpanded(!isDesktopExpanded)}
        />
      </Drawer>
    </>
  )
}
