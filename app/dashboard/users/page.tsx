import { createSupabaseServerClient } from "@/lib/supabase/server"
import UsersAdminPanel from "@/components/dashboard/UsersAdminPanel"
import { redirect } from "next/navigation"

const ADMIN_ROLES = ["admin", "pastor"]

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null
    })
  }

  // Server-side role guard — non-admins cannot access this page
  const rawRole = (existingProfile?.role ?? "").trim().toLowerCase()
  if (!ADMIN_ROLES.includes(rawRole)) {
    redirect("/dashboard")
  }

  const [{ data: currentProfile }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true })
  ])

  if (profilesError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Impossible d'afficher les utilisateurs pour le moment. Détail: {profilesError.message}
          </p>
        </div>
      </div>
    )
  }

  const normalizedProfiles = (profiles ?? []).map(profile => ({
    id: profile.id,
    full_name: profile.full_name ?? null,
    email: profile.email ?? null,
    role: profile.role ?? null,
    church: profile.church ?? null,
    completed: profile.completed ?? null,
    approved: profile.approved ?? null,
    created_at: profile.created_at ?? null
  }))

  return (
    <UsersAdminPanel
      currentUserId={user.id}
      currentUserRole={currentProfile?.role ?? null}
      profiles={normalizedProfiles}
    />
  )
}