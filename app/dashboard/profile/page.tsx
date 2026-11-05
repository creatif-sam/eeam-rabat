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
    .select("id, full_name, phone, avatar_url, role, church, approved, created_at")
    .eq("id", user.id)
    .maybeSingle()

  let safeProfile = profile

  if (!safeProfile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? "",
        role: "membre_cp",
        church: "EEAM Rabat"
      })
      .select("id, full_name, phone, avatar_url, role, church, approved, created_at")
      .single()
    safeProfile = created
  }

  return (
    <ProfileForm
      email={user.email ?? ""}
      lastSignIn={user.last_sign_in_at ?? null}
      profile={
        safeProfile ?? {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? "",
          phone: "",
          avatar_url: null,
          role: "membre_cp",
          church: "EEAM Rabat",
          approved: null,
          created_at: user.created_at ?? null
        }
      }
    />
  )
}
