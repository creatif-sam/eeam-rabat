"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Popover from "@mui/material/Popover"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import {
  CheckCircleOutlined,
  Close,
  DoneAll,
  InfoOutlined,
  NotificationsActiveOutlined,
  NotificationsOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import {
  deleteNotification,
  getMyNotifications,
  markNotificationsRead,
  removePushSubscription,
  savePushSubscription,
  type BellNotification,
} from "@/app/actions/notifications"

const POLL_MS = 60_000
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

function NotifIcon({ type }: { type: BellNotification["type"] }) {
  if (type === "success") return <CheckCircleOutlined fontSize="small" color="success" />
  if (type === "warning") return <WarningAmberOutlined fontSize="small" color="warning" />
  return <InfoOutlined fontSize="small" color="primary" />
}

function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "à l'instant"
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`
  if (s < 7 * 86400) return `il y a ${Math.floor(s / 86400)} j`
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/* ---------------- Push on this device ---------------- */
function usePush() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const ok = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!VAPID_PUBLIC_KEY
    setSupported(ok)
    if (!ok) return
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub && Notification.permission === "granted"))
      .catch(() => {})
  }, [])

  const toggle = useCallback(async () => {
    if (!supported || busy) return
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (enabled && existing) {
        await removePushSubscription(existing.endpoint)
        await existing.unsubscribe()
        setEnabled(false)
        toast.success("Notifications désactivées sur cet appareil.")
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast.error("Autorisez les notifications dans les réglages de votre navigateur.")
        return
      }
      const sub =
        existing ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }))
      const result = await savePushSubscription(sub.toJSON(), navigator.userAgent)
      if (!result.ok) {
        toast.error(result.error ?? "Activation impossible.")
        return
      }
      setEnabled(true)
      toast.success("Notifications activées sur cet appareil.")
    } catch (err) {
      console.error("[push]", err)
      toast.error("Activation impossible sur ce navigateur.")
    } finally {
      setBusy(false)
    }
  }, [supported, busy, enabled])

  return { supported, enabled, busy, toggle }
}

export default function NotificationBell() {
  const router = useRouter()
  const [items, setItems] = useState<BellNotification[]>([])
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const seen = useRef<Set<string> | null>(null)
  const push = usePush()

  const refresh = useCallback(async () => {
    const { items } = await getMyNotifications()
    // Toast only notifications that arrived since the last refresh
    if (seen.current) {
      items
        .filter((n) => !n.read && !seen.current!.has(n.id))
        .slice(0, 3)
        .forEach((n) => (n.type === "warning" ? toast.warning(n.message) : n.type === "success" ? toast.success(n.message) : toast.info(n.message)))
    }
    seen.current = new Set(items.map((n) => n.id))
    setItems(items)
  }, [])

  useEffect(() => {
    refresh()
    const id = window.setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS)
    const onFocus = () => refresh()
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
    }
  }, [refresh])

  const unread = items.filter((n) => !n.read).length

  async function readAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    const { ok } = await markNotificationsRead()
    if (!ok) {
      toast.error("Impossible de marquer les notifications comme lues.")
      refresh()
    }
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id))
    const { ok } = await deleteNotification(id)
    if (!ok) refresh()
  }

  async function open(n: BellNotification) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      void markNotificationsRead([n.id])
    }
    if (n.link) {
      setAnchor(null)
      router.push(n.link)
    }
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label={`Notifications${unread ? ` (${unread} non lues)` : ""}`}>
          <Badge badgeContent={unread} color="secondary" max={9}>
            <NotificationsOutlined />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: "calc(100vw - 32px)", mt: 1 } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unread > 0 && (
            <Button size="small" startIcon={<DoneAll fontSize="small" />} onClick={readAll}>
              Tout lire
            </Button>
          )}
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Aucune notification
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 360, overflowY: "auto" }}>
            {items.map((n) => (
              <ListItem
                key={n.id}
                divider
                disablePadding
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => remove(n.id)} aria-label="Supprimer">
                    <Close fontSize="small" />
                  </IconButton>
                }
                sx={{ bgcolor: n.read ? "transparent" : "rgba(var(--mui-palette-primary-mainChannel) / 0.08)" }}
              >
                <ListItemButton onClick={() => open(n)} sx={{ alignItems: "flex-start", pr: 6, borderRadius: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <NotifIcon type={n.type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={n.message}
                    secondary={timeAgo(n.created_at)}
                    slotProps={{ primary: { sx: { fontWeight: n.read ? 400 : 600, fontSize: 14 } } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {push.supported && (
          <>
            <Divider />
            <Stack direction="row" spacing={1.5} sx={{ px: 2, py: 1.25, alignItems: "center" }}>
              <NotificationsActiveOutlined fontSize="small" color={push.enabled ? "primary" : "action"} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Notifications sur cet appareil
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recevez les alertes même quand le site est fermé
                </Typography>
              </Box>
              <Switch checked={push.enabled} onChange={push.toggle} disabled={push.busy} slotProps={{ input: { "aria-label": "Notifications sur cet appareil" } }} />
            </Stack>
          </>
        )}
      </Popover>
    </>
  )
}
