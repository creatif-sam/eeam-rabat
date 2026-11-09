"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Divider from "@mui/material/Divider"
import FormControlLabel from "@mui/material/FormControlLabel"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import {
  Add,
  AutoStoriesOutlined,
  CampaignOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  SaveOutlined,
  ScheduleOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import AnnouncementBar from "@/components/public/AnnouncementBar"
import { deleteAnnouncement, saveAnnouncement, saveYearTheme, setAnnouncementActive } from "@/app/dashboard/annonces/actions"
import {
  TONES,
  isLive,
  sortAnnouncements,
  type Announcement,
  type AnnouncementTone,
  type YearTheme,
} from "@/lib/site/announcements"

const MESSAGE_MAX = 220
const THEME_MAX = 160

type Draft = {
  id?: string
  label: string
  tone: AnnouncementTone
  message: string
  link_url: string
  link_label: string
  starts_at: string // datetime-local value
  ends_at: string
  is_active: boolean
  priority: number
}

const EMPTY_DRAFT: Draft = {
  label: "Annonce",
  tone: "info",
  message: "",
  link_url: "",
  link_label: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
  priority: 0,
}

/** ISO → "YYYY-MM-DDTHH:mm" in local time for <input type="datetime-local"> */
function toLocalInput(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null)

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

function statusOf(a: Announcement): { label: string; color: "success" | "info" | "default" | "warning" } {
  const now = new Date()
  if (!a.is_active) return { label: "Désactivée", color: "default" }
  if (a.starts_at && new Date(a.starts_at) > now) return { label: "Programmée", color: "info" }
  if (a.ends_at && new Date(a.ends_at) <= now) return { label: "Expirée", color: "warning" }
  return { label: "En ligne", color: "success" }
}

function validate(d: Draft): string | null {
  if (!d.message.trim()) return "Le message est obligatoire."
  if (d.message.length > MESSAGE_MAX) return `Le message ne doit pas dépasser ${MESSAGE_MAX} caractères.`
  if (d.link_url && !/^(https?:\/\/|\/|#)/i.test(d.link_url.trim())) return "Le lien doit commencer par https://, / ou #."
  if (d.starts_at && d.ends_at && new Date(d.ends_at) <= new Date(d.starts_at)) return "La date de fin doit être après la date de début."
  return null
}

export default function AnnouncementsManager({
  userId,
  setupMissing,
  initialTheme,
  initialAnnouncements,
  embedded = false,
}: {
  userId: string
  setupMissing: boolean
  initialTheme: YearTheme
  initialAnnouncements: Announcement[]
  /** Inside the "Site public" page, which provides its own title. */
  embedded?: boolean
}) {
  const [theme, setTheme] = useState<YearTheme>(initialTheme)
  const [savedTheme, setSavedTheme] = useState<YearTheme>(initialTheme)
  const [savingTheme, setSavingTheme] = useState(false)
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [toDelete, setToDelete] = useState<Announcement | null>(null)

  const themeDirty = JSON.stringify(theme) !== JSON.stringify(savedTheme)
  const liveItems = useMemo(() => sortAnnouncements(items.filter((a) => isLive(a))), [items])
  const preview = useMemo(() => ({ theme, announcements: liveItems }), [theme, liveItems])

  /* ---------------- Theme ---------------- */
  async function saveTheme() {
    setSavingTheme(true)
    const result = await saveYearTheme(theme)
    setSavingTheme(false)
    if (!result.ok) return toast.error(`Enregistrement impossible : ${result.error}`)
    setSavedTheme(theme)
    toast.success("Thème de l'année mis à jour sur le site.")
  }

  /* ---------------- Announcements ---------------- */
  function openEditor(a?: Announcement) {
    setDraft(
      a
        ? {
            id: a.id,
            label: a.label,
            tone: a.tone,
            message: a.message,
            link_url: a.link_url ?? "",
            link_label: a.link_label ?? "",
            starts_at: toLocalInput(a.starts_at),
            ends_at: toLocalInput(a.ends_at),
            is_active: a.is_active,
            priority: a.priority,
          }
        : { ...EMPTY_DRAFT }
    )
  }

  async function saveDraft() {
    if (!draft) return
    const problem = validate(draft)
    if (problem) return toast.error(problem)

    setSavingDraft(true)
    const payload = {
      label: draft.label.trim() || TONES[draft.tone].name,
      tone: draft.tone,
      message: draft.message.trim(),
      link_url: draft.link_url.trim() || null,
      link_label: draft.link_label.trim() || null,
      starts_at: fromLocalInput(draft.starts_at),
      ends_at: fromLocalInput(draft.ends_at),
      is_active: draft.is_active,
      priority: Number(draft.priority) || 0,
    }

    const result = await saveAnnouncement(payload, draft.id)
    setSavingDraft(false)
    if (!result.ok || !result.data) return toast.error(`Enregistrement impossible : ${result.ok ? "erreur inconnue" : result.error}`)

    const saved = result.data
    setItems((prev) => sortAnnouncements(draft.id ? prev.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...prev]))
    toast.success(draft.id ? "Annonce mise à jour." : isLive(saved) ? "Annonce publiée sur le site." : "Annonce enregistrée.")
    setDraft(null)
  }

  async function toggleActive(a: Announcement) {
    const next = !a.is_active
    setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, is_active: next } : x)))
    const result = await setAnnouncementActive(a.id, next)
    if (!result.ok) {
      setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, is_active: a.is_active } : x)))
      toast.error(`Modification impossible : ${result.error}`)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    const result = await deleteAnnouncement(toDelete.id)
    if (!result.ok) return toast.error(`Suppression impossible : ${result.error}`)
    setItems((prev) => prev.filter((a) => a.id !== toDelete.id))
    toast.success("Annonce supprimée.")
    setToDelete(null)
  }

  const draftError = draft ? validate(draft) : null

  return (
    <Stack spacing={3}>
      {!embedded && (
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Annonces du site
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thème de l&apos;année ecclésiale et annonces affichées dans le bandeau en haut du site public.
          </Typography>
        </Box>
      )}

      {setupMissing && (
        <Alert severity="warning">
          Impossible de charger les annonces : les tables <strong>site_settings</strong> et{" "}
          <strong>site_announcements</strong> sont introuvables dans Supabase. Contactez l&apos;administrateur technique.
        </Alert>
      )}

      {/* Live preview */}
      <Card>
        <CardHeader
          avatar={<VisibilityOutlined color="action" />}
          title="Aperçu du bandeau"
          subheader="Tel qu'il apparaît actuellement en haut du site public"
          slotProps={{ title: { sx: { fontWeight: 600 } } }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 1 }}>
            {preview.theme.theme.trim() || preview.announcements.length ? (
              <AnnouncementBar preview={preview} />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                Le bandeau est masqué : ajoutez un thème ou une annonce en ligne.
              </Typography>
            )}
          </Paper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Year theme */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              avatar={<AutoStoriesOutlined color="primary" />}
              title="Thème de l'année ecclésiale"
              slotProps={{ title: { sx: { fontWeight: 600 } } }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={2}>
                <TextField
                  label="Intitulé"
                  placeholder="Année ecclésiale 2026-2027"
                  value={theme.label}
                  onChange={(e) => setTheme({ ...theme, label: e.target.value })}
                  helperText="Affiché en majuscules avant le thème"
                  fullWidth
                />
                <TextField
                  label="Thème"
                  placeholder="Ex. : Bâtis sur le roc"
                  value={theme.theme}
                  onChange={(e) => setTheme({ ...theme, theme: e.target.value.slice(0, THEME_MAX) })}
                  helperText={`${theme.theme.length}/${THEME_MAX} — laissez vide pour masquer le thème`}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <TextField
                  label="Référence biblique (optionnel)"
                  placeholder="Ex. : Matthieu 7:24"
                  value={theme.reference}
                  onChange={(e) => setTheme({ ...theme, reference: e.target.value })}
                  fullWidth
                />
                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                  <Button disabled={!themeDirty || savingTheme} onClick={() => setTheme(savedTheme)}>
                    Annuler
                  </Button>
                  <Button variant="contained" startIcon={<SaveOutlined />} disabled={!themeDirty || savingTheme || setupMissing} onClick={saveTheme}>
                    Enregistrer
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Announcements list */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              avatar={<CampaignOutlined color="secondary" />}
              title="Annonces"
              subheader={`${liveItems.length} en ligne · ${items.length} au total`}
              action={
                <Button variant="contained" color="secondary" startIcon={<Add />} onClick={() => openEditor()} disabled={setupMissing} sx={{ mt: 0.5, mr: 0.5 }}>
                  Nouvelle
                </Button>
              }
              slotProps={{ title: { sx: { fontWeight: 600 } } }}
            />
            <CardContent sx={{ pt: 0 }}>
              {items.length === 0 ? (
                <Paper variant="outlined" sx={{ py: 5, textAlign: "center", borderStyle: "dashed" }}>
                  <CampaignOutlined sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
                  <Typography sx={{ fontWeight: 600 }}>Aucune annonce</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publiez une annonce pour l&apos;afficher en haut du site.
                  </Typography>
                </Paper>
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {items.map((a) => {
                    const status = statusOf(a)
                    const tone = TONES[a.tone] ?? TONES.info
                    return (
                      <Stack key={a.id} direction="row" spacing={1.5} sx={{ py: 1.5, alignItems: "flex-start" }}>
                        <Switch
                          checked={a.is_active}
                          onChange={() => toggleActive(a)}
                          slotProps={{ input: { "aria-label": a.is_active ? "Désactiver" : "Activer" } }}
                          size="small"
                          sx={{ mt: 0.25 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
                            <Box
                              component="span"
                              sx={{ px: 0.75, py: 0.25, borderRadius: 0.75, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, bgcolor: tone.hex, color: a.tone === "event" ? "#111827" : "#fff" }}
                            >
                              {a.label}
                            </Box>
                            <Chip size="small" label={status.label} color={status.color} variant={status.color === "success" ? "filled" : "outlined"} />
                            {a.priority !== 0 && <Chip size="small" variant="outlined" label={`Priorité ${a.priority}`} />}
                          </Stack>
                          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                            {a.message}
                          </Typography>
                          <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 0.5, flexWrap: "wrap", color: "text.secondary" }}>
                            {(a.starts_at || a.ends_at) && (
                              <Typography variant="caption" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                <ScheduleOutlined sx={{ fontSize: 14 }} />
                                {a.starts_at ? fmt(a.starts_at) : "Maintenant"} → {a.ends_at ? fmt(a.ends_at) : "sans fin"}
                              </Typography>
                            )}
                            {a.link_url && (
                              <Typography variant="caption" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                                <LinkOutlined sx={{ fontSize: 14 }} />
                                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                                  {a.link_label || a.link_url}
                                </Box>
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                        <Stack direction="row">
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => openEditor(a)}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" onClick={() => setToDelete(a)}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Editor dialog */}
      <Dialog open={!!draft} onClose={() => !savingDraft && setDraft(null)} fullWidth maxWidth="sm">
        <DialogTitle>{draft?.id ? "Modifier l'annonce" : "Nouvelle annonce"}</DialogTitle>
        {draft && (
          <DialogContent>
            <Stack spacing={2.25} sx={{ pt: 1 }}>
              {/* Mini preview */}
              <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 1 }}>
                <AnnouncementBar
                  preview={{
                    theme: { label: "", theme: "", reference: "" },
                    announcements: [
                      {
                        id: "draft",
                        label: draft.label || TONES[draft.tone].name,
                        tone: draft.tone,
                        message: draft.message || "Votre message apparaîtra ici",
                        link_url: draft.link_url || null,
                        link_label: draft.link_label || null,
                        starts_at: null,
                        ends_at: null,
                        is_active: true,
                        priority: 0,
                        created_at: "",
                      },
                    ],
                  }}
                />
              </Paper>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Style"
                  value={draft.tone}
                  onChange={(e) => {
                    const tone = e.target.value as AnnouncementTone
                    const labelWasDefault = !draft.label || Object.values(TONES).some((t) => t.name === draft.label) || draft.label === "Annonce"
                    setDraft({ ...draft, tone, label: labelWasDefault ? TONES[tone].name : draft.label })
                  }}
                  sx={{ minWidth: 190 }}
                >
                  {(Object.keys(TONES) as AnnouncementTone[]).map((t) => (
                    <MenuItem key={t} value={t}>
                      <Box component="span" sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: TONES[t].hex, display: "inline-block", mr: 1 }} />
                      {TONES[t].name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Texte du badge"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value.slice(0, 24) })}
                  helperText="Ex. : Annonce, Urgent, Culte"
                  fullWidth
                />
              </Stack>

              <TextField
                label="Message"
                value={draft.message}
                onChange={(e) => setDraft({ ...draft, message: e.target.value.slice(0, MESSAGE_MAX) })}
                helperText={`${draft.message.length}/${MESSAGE_MAX}`}
                multiline
                minRows={2}
                required
                fullWidth
                autoFocus
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Lien (optionnel)"
                  placeholder="https://… ou /entretien-pastoral"
                  value={draft.link_url}
                  onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Texte du lien"
                  placeholder="En savoir plus"
                  value={draft.link_label}
                  onChange={(e) => setDraft({ ...draft, link_label: e.target.value.slice(0, 30) })}
                  disabled={!draft.link_url}
                  sx={{ minWidth: { sm: 190 } }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  type="datetime-local"
                  label="Début"
                  value={draft.starts_at}
                  onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
                  helperText="Vide = immédiatement"
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  type="datetime-local"
                  label="Fin"
                  value={draft.ends_at}
                  onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
                  helperText="Vide = sans fin"
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <TextField
                  type="number"
                  label="Priorité"
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })}
                  helperText="La plus haute s'affiche en premier"
                  sx={{ width: 180 }}
                />
                <FormControlLabel
                  control={<Switch checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />}
                  label="Active"
                />
              </Stack>

              {draftError && draft.message && <Alert severity="error">{draftError}</Alert>}
            </Stack>
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDraft(null)} disabled={savingDraft}>
            Annuler
          </Button>
          <Button variant="contained" color="secondary" onClick={saveDraft} disabled={savingDraft || !!draftError}>
            {draft?.id ? "Enregistrer" : "Publier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer cette annonce ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            « {toDelete?.message} »
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            Pour la retirer temporairement, désactivez-la plutôt.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setToDelete(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
