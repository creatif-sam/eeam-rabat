import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { periodRange } from "@/lib/finance/categories"
import FinancesClient from "@/components/finances/FinancesClient"
import { getFinanceData } from "./actions"

const VIEW_ROLES = ["admin", "pastor", "corps_pastoral", "treasurer"]
const EDIT_ROLES = ["admin", "treasurer"]

export default async function FinancesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const role = (profile?.role ?? "").trim().toLowerCase()
  if (!VIEW_ROLES.includes(role)) redirect("/dashboard")

  // Current month in Morocco time
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" }))
  const { start, end } = periodRange("month", now)
  const initial = await getFinanceData(start, end)

  return (
    <FinancesClient
      canEdit={EDIT_ROLES.includes(role)}
      initialRange={{ start, end }}
      initialData={initial.ok ? initial.data : null}
      initialError={initial.ok ? null : initial.error}
    />
  )
}
