"use client"

import { useMemo, useState, useTransition } from "react"
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
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import {
  AccountBalanceOutlined,
  AccountBalanceWalletOutlined,
  Add,
  DeleteOutlined,
  EditOutlined,
  FileDownloadOutlined,
  ReceiptLongOutlined,
  Search,
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material"
import {
  EXPENSE_CATEGORIES,
  LEGACY_EXPENSE,
  PERIOD_LABELS,
  REVENUE_CATEGORIES,
  categoryLabel,
  formatMAD,
  periodRange,
  type Period,
  type Transaction,
} from "@/lib/finance/categories"
import { deleteTransaction, getFinanceData, type FinanceData } from "@/app/dashboard/finances/actions"
import TransactionDialog from "./TransactionDialog"

type Range = { start: string; end: string }

const fmtDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

function KpiCard({ label, value, icon, color, hint }: { label: string; value: string; icon: React.ReactNode; color: string; hint?: string }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: `${color}1f`, color }}>
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
              {value}
            </Typography>
            {hint && (
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function Breakdown({
  title,
  icon,
  color,
  rows,
  total,
}: {
  title: string
  icon: React.ReactNode
  color: "success" | "error"
  rows: { label: string; value: number }[]
  total: number
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader avatar={icon} title={title} subheader={formatMAD(total)} slotProps={{ title: { sx: { fontWeight: 600 } } }} />
      <Divider />
      <CardContent>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            Aucune opération sur la période.
          </Typography>
        ) : (
          <Stack spacing={1.75}>
            {rows.map((r) => {
              const pct = total > 0 ? (r.value / total) * 100 : 0
              return (
                <Box key={r.label}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {r.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatMAD(r.value)} · {pct.toFixed(0)} %
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              )
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default function FinancesClient({
  canEdit,
  initialRange,
  initialData,
  initialError,
}: {
  canEdit: boolean
  initialRange: Range
  initialData: FinanceData | null
  initialError: string | null
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [period, setPeriod] = useState<Period>("month")
  const [range, setRange] = useState<Range>(initialRange)
  const [data, setData] = useState<FinanceData | null>(initialData)
  const [error, setError] = useState<string | null>(initialError)
  const [loading, startLoading] = useTransition()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "revenu" | "depense">("all")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [toDelete, setToDelete] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  function load(next: Range) {
    if (!next.start || !next.end || next.start > next.end) return
    setRange(next)
    setPage(0)
    startLoading(async () => {
      const result = await getFinanceData(next.start, next.end)
      if (result.ok) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error)
      }
    })
  }

  function choosePeriod(p: Period | null) {
    if (!p) return
    setPeriod(p)
    if (p !== "custom") load(periodRange(p))
  }

  const transactions = data?.transactions ?? []
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (!q) return true
      return [t.description, categoryLabel(t.categorie), t.source, t.vendeur, String(t.montant)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    })
  }, [transactions, search, typeFilter])

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const revenueRows = useMemo(
    () =>
      REVENUE_CATEGORIES.map((c) => ({ label: c.label, value: data?.byCategory[c.value] ?? 0 }))
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value),
    [data]
  )
  const expenseRows = useMemo(
    () =>
      [...EXPENSE_CATEGORIES.map((c) => ({ label: c.label, value: data?.byCategory[c.value] ?? 0 })), { label: "Non catégorisé", value: data?.byCategory[LEGACY_EXPENSE] ?? 0 }]
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value),
    [data]
  )

  const totals = data?.totals ?? { revenus: 0, depenses: 0, solde: 0 }

  async function exportExcel() {
    if (!transactions.length) return toast.warning("Aucune transaction à exporter sur la période.")
    const XLSX = await import("xlsx")
    const summary = [
      { Indicateur: "Période", Valeur: `${fmtDay(range.start)} – ${fmtDay(range.end)}` },
      { Indicateur: "Revenus", Valeur: totals.revenus },
      { Indicateur: "Dépenses", Valeur: totals.depenses },
      { Indicateur: "Solde de la période", Valeur: totals.solde },
      ...revenueRows.map((r) => ({ Indicateur: `Revenus – ${r.label}`, Valeur: r.value })),
      ...expenseRows.map((r) => ({ Indicateur: `Dépenses – ${r.label}`, Valeur: r.value })),
    ]
    const rows = transactions.map((t) => ({
      Date: t.date_transaction.slice(0, 10),
      Type: t.type === "revenu" ? "Revenu" : "Dépense",
      Catégorie: categoryLabel(t.categorie),
      Description: t.description,
      "Provenance / Fournisseur": t.type === "revenu" ? t.source ?? "" : t.vendeur ?? "",
      "Montant (MAD)": t.type === "revenu" ? t.montant : -t.montant,
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Résumé")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Transactions")
    XLSX.writeFile(wb, `finances_${range.start}_${range.end}.xlsx`)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteTransaction(toDelete.id)
    setDeleting(false)
    if (!result.ok) return toast.error(result.error)
    toast.success("Transaction supprimée.")
    setToDelete(null)
    load(range)
  }

  const amountCell = (t: Transaction) => (
    <Typography variant="body2" sx={{ fontWeight: 600, color: t.type === "revenu" ? "success.main" : "error.main", whiteSpace: "nowrap" }}>
      {t.type === "revenu" ? "+" : "−"} {formatMAD(t.montant)}
    </Typography>
  )

  const rowActions = (t: Transaction) =>
    canEdit && (
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <Tooltip title="Modifier">
          <IconButton size="small" onClick={() => { setEditing(t); setDialogOpen(true) }}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton size="small" onClick={() => setToDelete(t)}>
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    )

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Finances
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {canEdit ? "Suivi des revenus et des dépenses de la paroisse" : "Consultation des finances de la paroisse"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={exportExcel} disabled={loading || !transactions.length}>
            Exporter
          </Button>
          {canEdit && (
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setDialogOpen(true) }}>
              Nouvelle transaction
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Period */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={period}
            onChange={(_, v) => choosePeriod(v)}
            sx={{ flexWrap: "wrap", "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 600, px: 1.75 } }}
          >
            {(Object.keys(PERIOD_LABELS) as Exclude<Period, "custom">[]).map((p) => (
              <ToggleButton key={p} value={p}>
                {PERIOD_LABELS[p]}
              </ToggleButton>
            ))}
            <ToggleButton value="custom">Personnalisée</ToggleButton>
          </ToggleButtonGroup>
          {period === "custom" ? (
            <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
              <TextField
                type="date"
                size="small"
                label="Du"
                value={range.start}
                onChange={(e) => load({ ...range, start: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="date"
                size="small"
                label="Au"
                value={range.end}
                onChange={(e) => load({ ...range, end: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {fmtDay(range.start)} – {fmtDay(range.end)}
            </Typography>
          )}
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mt: -1.5 }} />}
      {error && <Alert severity="error" action={<Button color="inherit" onClick={() => load(range)}>Réessayer</Button>}>{error}</Alert>}

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Revenus" value={formatMAD(totals.revenus)} icon={<TrendingUp />} color="#16a34a" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Dépenses" value={formatMAD(totals.depenses)} icon={<TrendingDown />} color="#b72736" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Solde de la période"
            value={formatMAD(totals.solde)}
            icon={<AccountBalanceWalletOutlined />}
            color={totals.solde >= 0 ? "#28868f" : "#b72736"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Solde global"
            value={data?.overallBalance != null ? formatMAD(data.overallBalance) : "—"}
            icon={<AccountBalanceOutlined />}
            color="#227077"
            hint="Toutes périodes confondues"
          />
        </Grid>
      </Grid>

      {/* Breakdowns */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Breakdown title="Revenus par type" icon={<TrendingUp color="success" />} color="success" rows={revenueRows} total={totals.revenus} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Breakdown title="Dépenses par catégorie" icon={<TrendingDown color="error" />} color="error" rows={expenseRows} total={totals.depenses} />
        </Grid>
      </Grid>

      {/* Transactions */}
      <Card>
        <CardHeader
          avatar={<ReceiptLongOutlined color="action" />}
          title="Transactions"
          subheader={`${filtered.length} opération${filtered.length > 1 ? "s" : ""}`}
          slotProps={{ title: { sx: { fontWeight: 600 } } }}
        />
        <Divider />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            sx={{ flex: 1, maxWidth: { sm: 360 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
          />
          <ToggleButtonGroup
            exclusive
            size="small"
            value={typeFilter}
            onChange={(_, v) => { if (v) { setTypeFilter(v); setPage(0) } }}
            sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 600, px: 1.75 } }}
          >
            <ToggleButton value="all">Toutes</ToggleButton>
            <ToggleButton value="revenu">Revenus</ToggleButton>
            <ToggleButton value="depense">Dépenses</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
            {transactions.length ? "Aucun résultat pour cette recherche." : "Aucune transaction sur la période."}
          </Typography>
        ) : isMobile ? (
          <Stack divider={<Divider />}>
            {pageRows.map((t) => (
              <Stack key={t.id} direction="row" spacing={1.5} sx={{ px: 2, py: 1.5, alignItems: "center" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {t.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmtDay(t.date_transaction)} · {categoryLabel(t.categorie)}
                  </Typography>
                </Box>
                {amountCell(t)}
                {rowActions(t)}
              </Stack>
            ))}
          </Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 600, color: "text.secondary" } }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Provenance / Fournisseur</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  {canEdit && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{fmtDay(t.date_transaction)}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" noWrap>
                        {t.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" color={t.type === "revenu" ? "success" : "error"} label={categoryLabel(t.categorie)} />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{(t.type === "revenu" ? t.source : t.vendeur) || "—"}</TableCell>
                    <TableCell align="right">{amountCell(t)}</TableCell>
                    {canEdit && <TableCell align="right">{rowActions(t)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filtered.length > 0 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        )}
      </Card>

      <TransactionDialog open={dialogOpen} transaction={editing} onClose={() => setDialogOpen(false)} onSaved={() => load(range)} />

      <Dialog open={!!toDelete} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer cette transaction ?</DialogTitle>
        <DialogContent>
          {toDelete && (
            <Typography variant="body2" color="text.secondary">
              {fmtDay(toDelete.date_transaction)} · {toDelete.description} · {formatMAD(toDelete.montant)}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            Cette action est définitive.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Annuler
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
