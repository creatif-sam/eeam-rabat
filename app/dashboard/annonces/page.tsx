import { redirect } from "next/navigation"

/** Moved: announcements now live in "Site public". */
export default function AnnoncesPage() {
  redirect("/dashboard/site?tab=annonces")
}
