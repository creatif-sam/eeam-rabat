"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme as useNextTheme } from "next-themes"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import AppBar from "@mui/material/AppBar"
import Avatar from "@mui/material/Avatar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Popover from "@mui/material/Popover"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import {
  CheckCircleOutlined,
  Close,
  DarkModeOutlined,
  DoneAll,
  InstallMobileOutlined,
  InfoOutlined,
  LightModeOutlined,
  Logout,
  Menu as MenuIcon,
  NotificationsOutlined,
  PersonOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import { logout } from "@/app/auth/logout/actions"
import { createClient } from "@/lib/supabase/client"
import { useSidebar } from "./SidebarContext"
import { promptInstall, usePWAInstall } from "@/lib/pwa/install"
import { IOSInstructions } from "@/components/pwa/InstallAppButton"

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
    corps_pastoral: "Pasteur",
  }

  return map[role] ?? role
}

function NotifIcon({ type }: { type: Notification["type"] }) {
  if (type === "success") return <CheckCircleOutlined fontSize="small" color="success" />
  if (type === "warning") return <WarningAmberOutlined fontSize="small" color="warning" />
  return <InfoOutlined fontSize="small" color="primary" />
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

export default function Header({ user }: { user: User }) {
  const [supabase] = useState(() => createClient())
  const { setIsMobileOpen } = useSidebar()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single()
      setProfile(data)
    }

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

    loadProfile()
    loadNotifications()
  }, [supabase, user.id])

  // The profile page broadcasts saved changes so the header updates instantly
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<Partial<Profile>>).detail
      setProfile((prev) => ({ role: prev?.role ?? null, full_name: null, avatar_url: null, ...prev, ...detail }))
    }
    window.addEventListener("profile-updated", onUpdate)
    return () => window.removeEventListener("profile-updated", onUpdate)
  }, [])

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (!unreadIds.length) return
    const { error } = await supabase.from("notifications").update({ read: true }).in("id", unreadIds)
    if (error) {
      toast.error("Impossible de marquer les notifications comme lues.")
      return
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("Toutes les notifications marquées comme lues")
  }

  async function deleteNotif(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id)
    if (error) {
      toast.error("Impossible de supprimer la notification.")
      return
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const fullName = profile?.full_name ?? user.email?.split("@")[0] ?? "Utilisateur"

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const unreadCount = notifications.filter((n) => !n.read).length

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

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} aria-label="Notifications">
            <Badge badgeContent={unreadCount} color="secondary" max={9}>
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { width: 340, maxWidth: "calc(100vw - 32px)", mt: 1 } } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" startIcon={<DoneAll fontSize="small" />} onClick={markAllRead}>
                Tout lire
              </Button>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              Aucune notification
            </Typography>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.map((n) => (
                <ListItem
                  key={n.id}
                  divider
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => deleteNotif(n.id)} aria-label="Supprimer">
                      <Close fontSize="small" />
                    </IconButton>
                  }
                  sx={(theme) => ({
                    bgcolor: n.read ? "transparent" : "rgba(var(--mui-palette-primary-mainChannel) / 0.08)",
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.75 }}>
                    <NotifIcon type={n.type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={n.message}
                    secondary={new Date(n.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    slotProps={{ primary: { sx: { fontWeight: n.read ? 400 : 600, fontSize: 14 } } }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Popover>

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
