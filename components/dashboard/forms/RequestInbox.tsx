"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import {
  CheckCircleOutlined,
  Close,
  EmailOutlined,
  FileDownloadOutlined,
  InboxOutlined,
  PhoneOutlined,
  Refresh,
  ReplayOutlined,
  Search,
  WhatsApp,
} from "@mui/icons-material"
import { createClient } from "@/lib/supabase/client"

export type BaseRequest = { id: string; processed: boolean; created_at: string }

export type Column<T> = { label: string; render: (row: T) => ReactNode; width?: number | string }

export type ExtraFilter<T> = {
  label: string
  options: { value: string; label: string }[]
  /** Derive options from loaded rows instead of a fixed list. */
  fromRows?: (rows: T[]) => string[]
  match: (row: T, value: string) => boolean
}

export type RequestInboxProps<T extends BaseRequest> = {
  table: string
  select: string
  mapRow?: (raw: Record<string, unknown>) => T
  /** Singular noun used in messages, e.g. "demande". */
  noun?: string
  primary: (row: T) => string
  secondary?: (row: T) => ReactNode
  badges?: (row: T) => ReactNode
  columns: Column<T>[]
  searchText: (row: T) => string
  extraFilter?: ExtraFilter<T>
  details: (row: T) => { label: string; value: ReactNode }[]
  longText?: (row: T) => { label: string; value: string | null } | null
  contact?: (row: T) => { phone?: string | null; email?: string | null; name?: string }
  exportSheet?: { fileName: string; sheetName: string; row: (r: T) => Record<string, unknown> }
  /** Called after a row's status changes so the page can refresh its counters. */
  onChanged?: () => void
}

type Status = "pending" | "processed" | "all"

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })

/** "06 12 34 56 78" → "212612345678" for wa.me links (Morocco default). */
function waNumber(phone: string) {
  let digits = phone.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) return digits.slice(1)
  if (digits.startsWith("00")) return digits.slice(2)
  if (digits.startsWith("0") && digits.length === 10) digits = "212" + digits.slice(1)
  return digits
}

export default function RequestInbox<T extends BaseRequest>(props: RequestInboxProps<T>) {
  const { table, select, mapRow, noun = "demande", primary, secondary, badges, columns, searchText, extraFilter, details, longText, contact, exportSheet, onChanged } = props

  const [supabase] = useState(() => createClient())
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>("pending")
  const [search, setSearch] = useState("")
  const [extra, setExtra] = useState("all")
  const [openId, setOpenId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from(table).select(select).order("created_at", { ascending: false }).limit(500)
    if (status === "pending") query = query.eq("processed", false)
    if (status === "processed") query = query.eq("processed", true)

    const { data, error } = await query
    if (error) {
      console.error(`[${table}]`, error)
      setError("Impossible de charger les demandes.")
      setRows([])
    } else {
      const raw = (data ?? []) as unknown as Record<string, unknown>[]
      setRows(mapRow ? raw.map(mapRow) : (raw as unknown as T[]))
    }
    setLoading(false)
  }, [supabase, table, select, status, mapRow])

  useEffect(() => {
    load()
  }, [load])

  const filterOptions = useMemo(() => {
    if (!extraFilter) return []
    if (extraFilter.fromRows) {
      return [...new Set(extraFilter.fromRows(rows).filter(Boolean))].sort().map((v) => ({ value: v, label: v }))
    }
    return extraFilter.options
  }, [extraFilter, rows])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (extraFilter && extra !== "all" && !extraFilter.match(r, extra)) return false
      if (term && !searchText(r).toLowerCase().includes(term)) return false
      return true
    })
  }, [rows, search, extra, extraFilter, searchText])

  const openRow = rows.find((r) => r.id === openId) ?? null

  async function setProcessed(row: T, processed: boolean) {
    setSavingId(row.id)
    const { error } = await supabase.from(table).update({ processed }).eq("id", row.id)
    setSavingId(null)
    if (error) {
      toast.error(`Échec de la mise à jour : ${error.message}`)
      return
    }
    toast.success(processed ? "Marquée comme traitée" : "Demande rouverte")
    setRows((prev) => {
      const updated = prev.map((r) => (r.id === row.id ? { ...r, processed } : r))
      // Drop rows that no longer match the current status tab
      if (status === "pending") return updated.filter((r) => !r.processed)
      if (status === "processed") return updated.filter((r) => r.processed)
      return updated
    })
    if (status !== "all") setOpenId(null)
    onChanged?.()
  }

  async function exportExcel() {
    if (!exportSheet || !visible.length) return
    const XLSX = await import("xlsx")
    const ws = XLSX.utils.json_to_sheet(visible.map(exportSheet.row))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, exportSheet.sheetName)
    XLSX.writeFile(wb, `${exportSheet.fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const statusChip = (r: T) =>
    r.processed ? (
      <Chip size="small" color="success" variant="outlined" label="Traitée" />
    ) : (
      <Chip size="small" color="warning" label="En attente" />
    )

  /* ---------------- Toolbar ---------------- */
  const toolbar = (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: { md: "center" } }}>
      <TextField
        size="small"
        placeholder="Rechercher…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ minWidth: { md: 260 }, flex: { xs: 1, md: "0 1 320px" } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")} aria-label="Effacer">
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />

      <ToggleButtonGroup
        size="small"
        exclusive
        value={status}
        onChange={(_, v: Status | null) => v && setStatus(v)}
        sx={{ "& .MuiToggleButton-root": { px: 1.75, textTransform: "none", fontWeight: 600 } }}
      >
        <ToggleButton value="pending">En attente</ToggleButton>
        <ToggleButton value="processed">Traitées</ToggleButton>
        <ToggleButton value="all">Toutes</ToggleButton>
      </ToggleButtonGroup>

      {extraFilter && (
        <TextField select size="small" label={extraFilter.label} value={extra} onChange={(e) => setExtra(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="all">Tous</MenuItem>
          {filterOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />

      <Stack direction="row" spacing={1}>
        <Tooltip title="Actualiser">
          <IconButton onClick={load} disabled={loading} aria-label="Actualiser">
            <Refresh />
          </IconButton>
        </Tooltip>
        {exportSheet && (
          <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={exportExcel} disabled={!visible.length} sx={{ flex: { xs: 1, md: "none" } }}>
            Exporter Excel
          </Button>
        )}
      </Stack>
    </Stack>
  )

  /* ---------------- Content ---------------- */
  let content: ReactNode
  if (loading) {
    content = (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={isMobile ? 84 : 52} />
        ))}
      </Stack>
    )
  } else if (error) {
    content = (
      <Alert severity="error" action={<Button color="inherit" onClick={load}>Réessayer</Button>}>
        {error}
      </Alert>
    )
  } else if (!visible.length) {
    content = (
      <Paper variant="outlined" sx={{ py: 6, textAlign: "center", borderStyle: "dashed" }}>
        <InboxOutlined sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
        <Typography sx={{ fontWeight: 600 }}>
          {search || extra !== "all" ? "Aucun résultat" : status === "pending" ? `Aucune ${noun} en attente` : `Aucune ${noun}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {search || extra !== "all" ? "Essayez d'autres critères de recherche." : status === "pending" ? "Tout est à jour." : ""}
        </Typography>
      </Paper>
    )
  } else if (isMobile) {
    content = (
      <Stack spacing={1.25}>
        {visible.map((r) => (
          <Card key={r.id}>
            <CardActionArea onClick={() => setOpenId(r.id)}>
              <CardContent sx={{ py: 1.75 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography noWrap sx={{ fontWeight: 600 }}>
                    {primary(r)}
                  </Typography>
                  {statusChip(r)}
                </Stack>
                {secondary && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {secondary(r)}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.75 }}>
                  <Typography variant="caption" color="text.secondary">
                    {fmtDate(r.created_at)}
                  </Typography>
                  {badges?.(r)}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    )
  } else {
    content = (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600, color: "text.secondary", py: 1.25 } }}>
              {columns.map((c) => (
                <TableCell key={c.label} sx={{ width: c.width }}>
                  {c.label}
                </TableCell>
              ))}
              <TableCell>Reçue le</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((r) => (
              <TableRow key={r.id} hover onClick={() => setOpenId(r.id)} sx={{ cursor: "pointer", "& td": { py: 1.25 } }}>
                {columns.map((c) => (
                  <TableCell key={c.label}>{c.render(r)}</TableCell>
                ))}
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{fmtDate(r.created_at)}</TableCell>
                <TableCell>{statusChip(r)}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  {r.processed ? (
                    <Tooltip title="Rouvrir">
                      <span>
                        <IconButton size="small" onClick={() => setProcessed(r, false)} disabled={savingId === r.id}>
                          <ReplayOutlined fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      size="small"
                      color="success"
                      startIcon={<CheckCircleOutlined />}
                      onClick={() => setProcessed(r, true)}
                      disabled={savingId === r.id}
                    >
                      Traiter
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  /* ---------------- Detail drawer ---------------- */
  const c = openRow && contact ? contact(openRow) : null
  const long = openRow && longText ? longText(openRow) : null

  return (
    <Box>
      {toolbar}
      {!loading && !error && visible.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          {visible.length} {noun}
          {visible.length > 1 ? "s" : ""}
          {visible.length !== rows.length ? ` sur ${rows.length}` : ""}
        </Typography>
      )}
      {content}

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={!!openRow}
        onClose={() => setOpenId(null)}
        slotProps={{
          paper: {
            sx: isMobile
              ? { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "88vh" }
              : { width: 440 },
          },
        }}
      >
        {openRow && (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Stack direction="row" sx={{ alignItems: "flex-start", p: 2.5, pb: 2, gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {primary(openRow)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center", flexWrap: "wrap" }} useFlexGap>
                  {statusChip(openRow)}
                  {badges?.(openRow)}
                </Stack>
              </Box>
              <IconButton onClick={() => setOpenId(null)} aria-label="Fermer">
                <Close />
              </IconButton>
            </Stack>
            <Divider />

            <Box sx={{ p: 2.5, overflowY: "auto", flex: 1 }}>
              <Stack spacing={1.75}>
                {details(openRow).map((d) => (
                  <Box key={d.label}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {d.label}
                    </Typography>
                    <Typography component="div" sx={{ fontWeight: 500 }}>
                      {d.value || "—"}
                    </Typography>
                  </Box>
                ))}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Reçue le
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>{fmtDateTime(openRow.created_at)}</Typography>
                </Box>
                {long?.value && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {long.label}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.75, mt: 0.5, bgcolor: "action.hover", whiteSpace: "pre-line" }}>
                      <Typography variant="body2">{long.value}</Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>

              {c && (c.phone || c.email) && (
                <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap" }} useFlexGap>
                  {c.phone && (
                    <>
                      <Button size="small" variant="outlined" startIcon={<PhoneOutlined />} href={`tel:${c.phone.replace(/\s/g, "")}`}>
                        Appeler
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<WhatsApp />}
                        href={`https://wa.me/${waNumber(c.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </Button>
                    </>
                  )}
                  {c.email && (
                    <Button size="small" variant="outlined" startIcon={<EmailOutlined />} href={`mailto:${c.email}`}>
                      Email
                    </Button>
                  )}
                </Stack>
              )}
            </Box>

            <Divider />
            <Box sx={{ p: 2 }}>
              {openRow.processed ? (
                <Button fullWidth variant="outlined" startIcon={<ReplayOutlined />} onClick={() => setProcessed(openRow, false)} disabled={savingId === openRow.id}>
                  Rouvrir la {noun}
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircleOutlined />}
                  onClick={() => setProcessed(openRow, true)}
                  disabled={savingId === openRow.id}
                >
                  Marquer comme traitée
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}
