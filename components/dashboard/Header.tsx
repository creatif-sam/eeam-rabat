"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme as useNextTheme } from "next-themes"
import type { User } from "@supabase/supabase-js"
import AppBar from "@mui/material/AppBar"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import {
  DarkModeOutlined,
  InstallMobileOutlined,
  LightModeOutlined,
  Logout,
  Menu as MenuIcon,
  PersonOutlined,
} from "@mui/icons-material"
import { logout } from "@/app/auth/logout/actions"
import { useSidebar } from "./SidebarContext"
import NotificationBell from "./NotificationBell"
import { promptInstall, usePWAInstall } from "@/lib/pwa/install"
import { IOSInstructions } from "@/components/pwa/InstallAppButton"

type Profile = {
  full_name: string | null
  avatar_url: string | null
  role: string | null
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
    corps_pastoral: "Pasteur",
  }

  return map[role] ?? role
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useNextTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return <Box sx={{ width: 40, height: 40 }} />

  const isDark = resolvedTheme === "dark"
  return (
    <Tooltip title={isDark ? "Mode clair" : "Mode sombre"}>
      <IconButton onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Changer le thème">
        {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  )
}

function InstallAppIcon() {
  const { canPrompt, isIOS } = usePWAInstall()
  const [showIOS, setShowIOS] = useState(false)
  if (!canPrompt && !isIOS) return null
  return (
    <>
      <Tooltip title="Installer l'application">
        <IconButton onClick={() => (canPrompt ? void promptInstall() : setShowIOS(true))} aria-label="Installer l'application">
          <InstallMobileOutlined />
        </IconButton>
      </Tooltip>
      {showIOS && <IOSInstructions onClose={() => setShowIOS(false)} />}
    </>
  )
}

export default function Header({ user, initialProfile }: { user: User; initialProfile: Profile | null }) {
  const { setIsMobileOpen } = useSidebar()
  // Comes from the server (layout): the browser client can't read the session
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)

  // The profile page broadcasts saved changes so the header updates instantly
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<Partial<Profile>>).detail
      setProfile((prev) => ({ role: prev?.role ?? null, full_name: null, avatar_url: null, ...prev, ...detail }))
    }
    window.addEventListener("profile-updated", onUpdate)
    return () => window.removeEventListener("profile-updated", onUpdate)
  }, [])

  const fullName = profile?.full_name ?? user.email?.split("@")[0] ?? "Utilisateur"

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 64 }, px: { xs: 1.5, md: 4 } }}>
        <IconButton
          edge="start"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Ouvrir le menu"
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
          Tableau de bord
        </Typography>

        <InstallAppIcon />
        <ThemeToggle />

        <NotificationBell />

        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />

        {/* Profile */}
        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" }, mr: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatRole(profile?.role)}
          </Typography>
        </Box>
        <Tooltip title="Menu profil">
          <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              src={profile?.avatar_url ?? undefined}
              alt={fullName}
              sx={{ width: 40, height: 40, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 15, fontWeight: 600 }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
        >
          <MenuItem component={Link} href="/dashboard/profile" onClick={() => setProfileAnchor(null)}>
            <ListItemIcon>
              <PersonOutlined fontSize="small" />
            </ListItemIcon>
            Voir profil
          </MenuItem>
          <Divider />
          <Box component="form" action={logout}>
            <MenuItem component="button" type="submit" sx={{ width: "100%", color: "error.main" }}>
              <ListItemIcon sx={{ color: "inherit" }}>
                <Logout fontSize="small" />
              </ListItemIcon>
              Déconnexion
            </MenuItem>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
