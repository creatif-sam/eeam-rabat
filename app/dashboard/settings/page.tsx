import { redirect } from "next/navigation"

/** Moved: public form passwords now live in "Site public". */
export default function SettingsPage() {
  redirect("/dashboard/site?tab=formulaires")
}
