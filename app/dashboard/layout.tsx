import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/dashboard/Header"
import Sidebar from "@/components/dashboard/Sidebar"
import { Suspense } from "react"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Profile is optional now
  // We fetch it only for display purposes if needed
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar />
        <div className="ml-72">
          <Header user={user} />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </Suspense>
  )
}
