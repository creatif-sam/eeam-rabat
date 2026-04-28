import { createSupabaseServerClient } from "@/lib/supabase/server"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, church")
    .eq("id", user.id)
    .maybeSingle()

  let safeProfile = profile

  if (!safeProfile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? "",
        role: "membre_cp",
        church: "EEAM Rabat"
      })
      .select()
      .single()

    safeProfile = created ?? {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? "",
      phone: "",
      avatar_url: null,
      role: "membre_cp",
      church: "EEAM Rabat"
    }
  }

  const profileForForm = safeProfile ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? "",
    phone: "",
    avatar_url: null,
    role: "membre_cp",
    church: "EEAM Rabat"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Mon profil</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Gérez vos informations personnelles et votre photo de profil.
        </p>
      </div>

      <ProfileForm profile={profileForForm} email={user.email ?? ""} />
    </div>
  )
}
