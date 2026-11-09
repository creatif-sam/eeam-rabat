"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import Alert from "@mui/material/Alert"
import Avatar from "@mui/material/Avatar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import {
  BadgeOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlined,
  ChurchOutlined,
  DeleteOutlined,
  EmailOutlined,
  HistoryOutlined,
  HourglassEmptyOutlined,
  LockOutlined,
  LockResetOutlined,
  Logout,
  PersonOutlined,
  PhoneOutlined,
  PhotoCameraOutlined,
  SaveOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import { logout } from "@/app/auth/logout/actions"
import { changePassword, updateProfile } from "./actions"

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role?: string | null
  church?: string | null
  approved?: boolean | null
  created_at?: string | null
}

const PRIVILEGED = ["admin", "pastor", "treasurer", "corps_pastoral"]
const MAX_AVATAR_MB = 2

function formatRole(role?: string | null) {
  const map: Record<string, string> = {
    admin: "Administrateur",
    pastor: "Pasteur",
    treasurer: "Trésorier",
    cp: "Membre CP",
    membre_cp: "Membre CP",
    president_cp: "Membre CP",
    corps_pastoral: "Pasteur",
  }
  return role ? map[role] ?? role : "Utilisateur"
}

const fmtDate = (iso?: string | null, withTime = false) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", withTime ? { dateStyle: "long", timeStyle: "short" } : { dateStyle: "long" })
    : "—"

export default function ProfileForm({
  profile,
  email,
  lastSignIn,
}: {
  profile: Profile
  email: string
  lastSignIn: string | null
}) {
  /* ---------- saved values (what the server has) ---------- */
  const [saved, setSaved] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    church: profile.church ?? "EEAM Rabat",
    avatar_url: profile.avatar_url,
  })

  /* ---------- form state ---------- */
  const [fullName, setFullName] = useState(saved.full_name)
  const [phone, setPhone] = useState(saved.phone)
  const [church, setChurch] = useState(saved.church)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  /* ---------- password ---------- */
  const [pwd, setPwd] = useState("")
  const [pwd2, setPwd2] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const initials = useMemo(
    () =>
      (fullName || email || "U")
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [fullName, email]
  )

  const dirty =
    fullName.trim() !== saved.full_name ||
    phone.trim() !== (saved.phone ?? "") ||
    church.trim() !== (saved.church ?? "") ||
    !!avatarFile ||
    removeAvatar

  const shownAvatar = previewUrl ?? (removeAvatar ? null : saved.avatar_url)
  const privileged = PRIVILEGED.includes((profile.role ?? "").toLowerCase())
  const approved = privileged || !!profile.approved

  function pickAvatar(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (!file) {
      setAvatarFile(null)
      setPreviewUrl(null)
      return
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format non pris en charge. Utilisez JPG, PNG ou WebP.")
      return
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      toast.error(`L'image ne doit pas dépasser ${MAX_AVATAR_MB} Mo.`)
      return
    }
    setRemoveAvatar(false)
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function resetForm() {
    setFullName(saved.full_name)
    setPhone(saved.phone ?? "")
    setChurch(saved.church ?? "")
    setRemoveAvatar(false)
    pickAvatar(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return toast.error("Le nom complet est obligatoire.")

    setSaving(true)
    const fd = new FormData()
    fd.set("full_name", fullName)
    fd.set("phone", phone)
    fd.set("church", church)
    if (avatarFile) fd.set("avatar", avatarFile)
    if (removeAvatar) fd.set("remove_avatar", "1")

    const result = await updateProfile(fd)
    setSaving(false)
    if (!result.ok || !result.data) return toast.error(result.ok ? "Erreur inconnue" : result.error)

    const next = { ...result.data, phone: result.data.phone ?? "", church: result.data.church ?? "" }
    setSaved(next)
    setFullName(next.full_name)
    setPhone(next.phone)
    setChurch(next.church)
    setRemoveAvatar(false)
    pickAvatar(null)
    // Lets the dashboard header refresh its name/avatar
    window.dispatchEvent(new CustomEvent("profile-updated", { detail: result.data }))
    toast.success("Profil mis à jour.")
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwd.length < 8) return toast.error("Le mot de passe doit contenir au moins 8 caractères.")
    if (pwd !== pwd2) return toast.error("Les mots de passe ne correspondent pas.")
    setChangingPwd(true)
    const result = await changePassword(pwd)
    setChangingPwd(false)
    if (!result.ok) return toast.error(result.error)
    setPwd("")
    setPwd2("")
    toast.success("Mot de passe modifié.")
  }

  const pwdMismatch = pwd2.length > 0 && pwd !== pwd2

  return (
    <Stack spacing={3}>
      {/* ---------------- Identity header ---------------- */}
      <Card sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            height: { xs: 96, md: 128 },
            background: "linear-gradient(135deg, #28868f 0%, #227077 60%, #1b5a5f 100%)",
          }}
        />
        <CardContent sx={{ pt: 0, px: { xs: 2.5, md: 4 }, pb: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.5, md: 3 }}
            sx={{ alignItems: { xs: "flex-start", md: "flex-end" }, mt: { xs: -6, md: -7 } }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Tooltip title="Changer la photo">
                  <IconButton
                    size="small"
                    onClick={() => fileInput.current?.click()}
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      border: 3,
                      borderColor: "background.paper",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                    aria-label="Changer la photo de profil"
                  >
                    <PhotoCameraOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar
                src={shownAvatar ?? undefined}
                alt={fullName}
                sx={{
                  width: { xs: 96, md: 120 },
                  height: { xs: 96, md: 120 },
                  fontSize: { xs: 32, md: 40 },
                  fontWeight: 700,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  border: 4,
                  borderColor: "background.paper",
                  boxShadow: 3,
                }}
              >
                {initials}
              </Avatar>
            </Badge>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                pickAvatar(e.target.files?.[0] ?? null)
                e.target.value = ""
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0, pb: { md: 0.5 } }}>
              <Typography variant="h5" component="h1" noWrap sx={{ fontWeight: 700 }}>
                {saved.full_name || "Mon profil"}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {email || "Email indisponible"}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: "wrap" }}>
                <Chip size="small" color="primary" icon={<BadgeOutlined />} label={formatRole(profile.role)} />
                {approved ? (
                  <Chip size="small" color="success" variant="outlined" icon={<CheckCircleOutlined />} label="Compte approuvé" />
                ) : (
                  <Chip size="small" color="warning" variant="outlined" icon={<HourglassEmptyOutlined />} label="En attente d'approbation" />
                )}
                {saved.church && <Chip size="small" variant="outlined" icon={<ChurchOutlined />} label={saved.church} />}
              </Stack>
            </Box>
          </Stack>

          {(avatarFile || removeAvatar) && (
            <Alert
              severity="info"
              sx={{ mt: 2.5 }}
              action={
                <Button color="inherit" size="small" onClick={() => { setRemoveAvatar(false); pickAvatar(null) }}>
                  Annuler
                </Button>
              }
            >
              {avatarFile ? "Nouvelle photo sélectionnée." : "La photo sera retirée."} Enregistrez pour appliquer.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* ---------------- Personal information ---------------- */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card component="form" onSubmit={handleSave} sx={{ height: "100%" }}>
            <CardHeader
              title="Informations personnelles"
              subheader="Ces informations sont visibles par les responsables de la paroisse."
              slotProps={{ title: { sx: { fontWeight: 600 } } }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nom complet"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlined fontSize="small" /></InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Téléphone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 6XX XXX XXX"
                    helperText="De préférence votre numéro WhatsApp"
                    fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Adresse e-mail"
                    value={email}
                    disabled
                    fullWidth
                    helperText="Pour changer d'adresse, contactez un administrateur."
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Église locale"
                    value={church}
                    onChange={(e) => setChurch(e.target.value)}
                    fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><ChurchOutlined fontSize="small" /></InputAdornment> } }}
                  />
                </Grid>
              </Grid>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3, alignItems: { sm: "center" } }}>
                <Button variant="outlined" startIcon={<PhotoCameraOutlined />} onClick={() => fileInput.current?.click()}>
                  {saved.avatar_url ? "Changer la photo" : "Ajouter une photo"}
                </Button>
                {saved.avatar_url && !removeAvatar && !avatarFile && (
                  <Button color="error" startIcon={<DeleteOutlined />} onClick={() => setRemoveAvatar(true)}>
                    Retirer la photo
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG ou WebP · {MAX_AVATAR_MB} Mo maximum
                </Typography>
              </Stack>
            </CardContent>
            <Divider />
            <Stack direction="row" spacing={1.5} sx={{ p: 2, justifyContent: "flex-end" }}>
              <Button onClick={resetForm} disabled={!dirty || saving}>
                Annuler
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveOutlined />} disabled={!dirty || saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* ---------------- Side column ---------------- */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card component="form" onSubmit={handlePassword}>
              <CardHeader
                avatar={<LockResetOutlined color="primary" />}
                title="Mot de passe"
                subheader="8 caractères minimum"
                slotProps={{ title: { sx: { fontWeight: 600 } } }}
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="Nouveau mot de passe"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPwd((v) => !v)}
                              aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showPwd ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    label="Confirmer le mot de passe"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    error={pwdMismatch}
                    helperText={pwdMismatch ? "Les mots de passe ne correspondent pas." : " "}
                    fullWidth
                  />
                  <Button type="submit" variant="outlined" disabled={changingPwd || !pwd || !pwd2 || pwdMismatch}>
                    {changingPwd ? "Modification…" : "Changer le mot de passe"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Compte" slotProps={{ title: { sx: { fontWeight: 600 } } }} />
              <Divider />
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}><BadgeOutlined fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Rôle" secondary={formatRole(profile.role)} />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}><CalendarMonthOutlined fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Membre depuis" secondary={fmtDate(profile.created_at)} />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}><HistoryOutlined fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Dernière connexion" secondary={fmtDate(lastSignIn, true)} />
                </ListItem>
              </List>
              <Divider />
              <Box component="form" action={logout} sx={{ p: 2 }}>
                <Button type="submit" color="error" variant="outlined" fullWidth startIcon={<Logout />}>
                  Se déconnecter
                </Button>
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
