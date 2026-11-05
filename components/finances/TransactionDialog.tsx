"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import InputAdornment from "@mui/material/InputAdornment"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { TrendingDown, TrendingUp } from "@mui/icons-material"
import {
  EXPENSE_CATEGORIES,
  LEGACY_EXPENSE,
  REVENUE_CATEGORIES,
  toISODate,
  type Transaction,
  type TxType,
} from "@/lib/finance/categories"
import { saveTransaction } from "@/app/dashboard/finances/actions"

type Draft = {
  type: TxType
  date_transaction: string
  montant: string
  categorie: string
  description: string
  source: string
  vendeur: string
}

const blank = (): Draft => ({
  type: "revenu",
  date_transaction: toISODate(new Date()),
  montant: "",
  categorie: "offrande",
  description: "",
  source: "",
  vendeur: "",
})

export default function TransactionDialog({
  open,
  transaction,
  onClose,
  onSaved,
}: {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onSaved: () => void
}) {
  const [draft, setDraft] = useState<Draft>(blank)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(
      transaction
        ? {
            type: transaction.type,
            date_transaction: transaction.date_transaction.slice(0, 10),
            montant: String(transaction.montant ?? ""),
            categorie: transaction.categorie,
            description: transaction.description ?? "",
            source: transaction.source ?? "",
            vendeur: transaction.vendeur ?? "",
          }
        : blank()
    )
  }, [open, transaction])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const isExpense = draft.type === "depense"
  const categories = isExpense ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES
  const amount = Number(draft.montant)
  const invalid = !draft.date_transaction || !(amount > 0) || (isExpense && !draft.description.trim())

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (invalid) return
    setSaving(true)
    const result = await saveTransaction(
      {
        type: draft.type,
        date_transaction: draft.date_transaction,
        montant: draft.montant,
        categorie: draft.categorie,
        description: draft.description,
        source: draft.source || null,
        vendeur: draft.vendeur || null,
      },
      transaction?.id
    )
    setSaving(false)
    if (!result.ok) return toast.error(result.error)
    toast.success(transaction ? "Transaction mise à jour." : "Transaction enregistrée.")
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="sm" slotProps={{ paper: { component: "form", onSubmit: submit } as object }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{transaction ? "Modifier la transaction" : "Nouvelle transaction"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={draft.type}
            onChange={(_, v: TxType | null) => {
              if (!v) return
              setDraft((d) => ({ ...d, type: v, categorie: v === "revenu" ? "offrande" : "fonctionnement" }))
            }}
          >
            <ToggleButton value="revenu" color="success" sx={{ textTransform: "none", fontWeight: 600, gap: 1 }}>
              <TrendingUp fontSize="small" /> Revenu
            </ToggleButton>
            <ToggleButton value="depense" color="error" sx={{ textTransform: "none", fontWeight: 600, gap: 1 }}>
              <TrendingDown fontSize="small" /> Dépense
            </ToggleButton>
          </ToggleButtonGroup>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Montant"
              type="number"
              value={draft.montant}
              onChange={(e) => set("montant", e.target.value)}
              required
              fullWidth
              autoFocus
              slotProps={{
                htmlInput: { min: 0, step: "0.01", inputMode: "decimal" },
                input: { endAdornment: <InputAdornment position="end">MAD</InputAdornment> },
              }}
            />
            <TextField
              label="Date"
              type="date"
              value={draft.date_transaction}
              onChange={(e) => set("date_transaction", e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <TextField
            select
            label={isExpense ? "Catégorie de dépense" : "Type de revenu"}
            value={draft.categorie}
            onChange={(e) => set("categorie", e.target.value)}
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
            {isExpense && draft.categorie === LEGACY_EXPENSE && (
              <MenuItem value={LEGACY_EXPENSE}>Non catégorisé</MenuItem>
            )}
          </TextField>

          <TextField
            label={isExpense ? "Description" : "Description (optionnel)"}
            value={draft.description}
            onChange={(e) => set("description", e.target.value.slice(0, 200))}
            required={isExpense}
            fullWidth
            placeholder={isExpense ? "Ex. : Facture d'électricité de novembre" : "Ex. : Culte du dimanche"}
          />

          <TextField
            label={isExpense ? "Fournisseur (optionnel)" : "Provenance (optionnel)"}
            value={isExpense ? draft.vendeur : draft.source}
            onChange={(e) => (isExpense ? set("vendeur", e.target.value) : set("source", e.target.value))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" variant="contained" disabled={saving || invalid}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
