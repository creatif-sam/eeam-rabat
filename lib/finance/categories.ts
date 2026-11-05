export type TxType = "revenu" | "depense"

export type Transaction = {
  id: string
  date_transaction: string
  description: string
  categorie: string
  montant: number
  type: TxType
  source: string | null
  vendeur: string | null
}

export const REVENUE_CATEGORIES = [
  { value: "offrande", label: "Offrande" },
  { value: "dime", label: "Dîme" },
  { value: "gifts", label: "Dons" },
  { value: "special_offering", label: "Offrande spéciale" },
] as const

export const EXPENSE_CATEGORIES = [
  { value: "fonctionnement", label: "Fonctionnement & charges" },
  { value: "batiment", label: "Bâtiment & entretien" },
  { value: "social", label: "Social & compassion" },
  { value: "evenements", label: "Événements & activités" },
  { value: "missions", label: "Missions & évangélisation" },
  { value: "materiel", label: "Matériel & équipement" },
  { value: "transport", label: "Transport" },
  { value: "autre", label: "Autre" },
] as const

/** Older expenses were all saved with categorie = "depense". */
export const LEGACY_EXPENSE = "depense"

export const REVENUE_VALUES: string[] = REVENUE_CATEGORIES.map((c) => c.value)
export const EXPENSE_VALUES: string[] = [...EXPENSE_CATEGORIES.map((c) => c.value), LEGACY_EXPENSE]

export function categoryLabel(categorie: string) {
  if (categorie === LEGACY_EXPENSE) return "Non catégorisé"
  return (
    REVENUE_CATEGORIES.find((c) => c.value === categorie)?.label ??
    EXPENSE_CATEGORIES.find((c) => c.value === categorie)?.label ??
    categorie
  )
}

/* ---------------- Calendar periods (local time, not UTC) ---------------- */

export type Period = "week" | "month" | "quarter" | "year" | "custom"

export const PERIOD_LABELS: Record<Exclude<Period, "custom">, string> = {
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
  year: "Cette année",
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Start/end (inclusive, YYYY-MM-DD) of the current calendar period. */
export function periodRange(period: Exclude<Period, "custom">, now = new Date()) {
  const y = now.getFullYear()
  const m = now.getMonth()
  let start: Date
  let end: Date
  if (period === "week") {
    const offset = (now.getDay() + 6) % 7 // Monday-first
    start = new Date(y, m, now.getDate() - offset)
    end = new Date(y, m, now.getDate() - offset + 6)
  } else if (period === "month") {
    start = new Date(y, m, 1)
    end = new Date(y, m + 1, 0)
  } else if (period === "quarter") {
    const q = Math.floor(m / 3) * 3
    start = new Date(y, q, 1)
    end = new Date(y, q + 3, 0)
  } else {
    start = new Date(y, 0, 1)
    end = new Date(y, 11, 31)
  }
  return { start: toISODate(start), end: toISODate(end) }
}

export const formatMAD = (amount: number) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 2 }).format(amount)
