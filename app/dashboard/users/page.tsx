import { createSupabaseServerClient } from "@/lib/supabase/server"
import UsersAdminPanel from "@/components/dashboard/UsersAdminPanel"

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (!existingProfile) {
    // Insert only when missing, so we never overwrite an existing role.
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null
    })
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