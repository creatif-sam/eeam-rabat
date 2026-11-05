"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { EXPENSE_VALUES, REVENUE_VALUES, type Transaction, type TxType } from "@/lib/finance/categories"

/**
 * Finance data access. Everything runs on the server:
 * - the logged-in user's role is checked on every call;
 * - only the requested period is read (paged, so there is no 1,000-row cap);
 * - totals are computed here, not in the browser.
 */

const VIEW_ROLES = ["admin", "pastor", "corps_pastoral", "treasurer"]
const EDIT_ROLES = ["admin", "treasurer"]
const PAGE = 1000
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Fail = { ok: false; error: string }
const fail = (error: string): Fail => ({ ok: false, error })

async function access(edit: boolean) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Session expirée. Reconnectez-vous." } as const

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const role = (profile?.role ?? "").trim().toLowerCase()
  if (!(edit ? EDIT_ROLES : VIEW_ROLES).includes(role)) {
    return { error: edit ? "Seuls le trésorier et les administrateurs peuvent modifier les finances." : "Accès réservé." } as const
  }
  // Role verified above; the service-role client avoids depending on table RLS
  // being configured for each finance role.
  const db = createSupabaseAdminClient() ?? supabase
  return { db, user, role } as const
}

function nextDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  const n = new Date(Date.UTC(y, m - 1, d + 1))
  return n.toISOString().slice(0, 10)
}

export type FinanceData = {
  transactions: Transaction[]
  totals: { revenus: number; depenses: number; solde: number }
  byCategory: Record<string, number>
  overallBalance: number | null
}

export async function getFinanceData(start: string, end: string): Promise<{ ok: true; data: FinanceData } | Fail> {
  if (!DATE_RE.test(start) || !DATE_RE.test(end) || start > end) return fail("Période invalide.")
  const a = await access(false)
  if ("error" in a) return fail(a.error!)

  const rows: Transaction[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await a.db
      .from("transactions_financieres")
      .select("id, date_transaction, description, categorie, montant, type, source, vendeur")
      .gte("date_transaction", start)
      .lt("date_transaction", nextDay(end)) // works for date and timestamp columns
      .order("date_transaction", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) {
      console.error("[finance] load:", error.message)
      return fail("Impossible de charger les transactions.")
    }
    rows.push(...((data ?? []) as Transaction[]))
    if (!data || data.length < PAGE) break
  }

  const totals = { revenus: 0, depenses: 0, solde: 0 }
  const byCategory: Record<string, number> = {}
  for (const t of rows) {
    const amount = Number(t.montant) || 0
    t.montant = amount
    if (t.type === "revenu") totals.revenus += amount
    else totals.depenses += amount
    byCategory[t.categorie] = (byCategory[t.categorie] ?? 0) + amount
  }
  totals.solde = totals.revenus - totals.depenses

  // All-time balance from the summary view, when it exists
  let overallBalance: number | null = null
  const { data: resume, error: resumeError } = await a.db.from("vue_finance_resume").select("solde_net").maybeSingle()
  if (!resumeError && resume && resume.solde_net != null) overallBalance = Number(resume.solde_net)

  return { ok: true, data: { transactions: rows, totals, byCategory, overallBalance } }
}

export type TransactionInput = {
  type: TxType
  date_transaction: string
  montant: number | string
  categorie: string
  description: string
  source?: string | null
  vendeur?: string | null
}

export async function saveTransaction(input: TransactionInput, id?: string): Promise<{ ok: true } | Fail> {
  const a = await access(true)
  if ("error" in a) return fail(a.error!)

  const type: TxType = input.type === "depense" ? "depense" : "revenu"
  const montant = Math.round(Number(input.montant) * 100) / 100
  const date = String(input.date_transaction ?? "")
  const categorie = String(input.categorie ?? "")
  const description = String(input.description ?? "").trim().slice(0, 200)

  if (!DATE_RE.test(date)) return fail("Veuillez choisir une date valide.")
  if (!Number.isFinite(montant) || montant <= 0) return fail("Veuillez saisir un montant valide.")
  if (montant > 10_000_000) return fail("Montant trop élevé.")
  if (type === "revenu" && !REVENUE_VALUES.includes(categorie)) return fail("Type de revenu invalide.")
  if (type === "depense" && !EXPENSE_VALUES.includes(categorie)) return fail("Catégorie de dépense invalide.")
  if (type === "depense" && !description) return fail("Veuillez décrire la dépense.")

  const payload = {
    type,
    date_transaction: date,
    montant,
    categorie,
    description: description || "Revenu",
    source: input.source ? String(input.source).trim().slice(0, 120) : null,
    vendeur: input.vendeur ? String(input.vendeur).trim().slice(0, 120) : null,
  }

  const { error } = id
    ? await a.db.from("transactions_financieres").update(payload).eq("id", id)
    : await a.db.from("transactions_financieres").insert({ ...payload, creator_id: a.user.id, creator_email: a.user.email })

  if (error) {
    console.error("[finance] save:", error.message)
    return fail("Impossible d'enregistrer la transaction.")
  }
  return { ok: true }
}

export async function deleteTransaction(id: string): Promise<{ ok: true } | Fail> {
  const a = await access(true)
  if ("error" in a) return fail(a.error!)
  const { error } = await a.db.from("transactions_financieres").delete().eq("id", id)
  if (error) {
    console.error("[finance] delete:", error.message)
    return fail("Impossible de supprimer la transaction.")
  }
  return { ok: true }
}
