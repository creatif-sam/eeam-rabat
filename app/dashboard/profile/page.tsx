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
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  let safeProfile = profile

  if (!safeProfile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? "",
        role: "membre_cp"
      })
      .select()
      .single()

    safeProfile = created
  }

  return <ProfileForm profile={safeProfile} />
}
