import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <form
      action={async (formData) => {
        "use server"

        const supabase = createSupabaseServerClient()

        await supabase
          .from("profiles")
          .update({
            full_name: formData.get("full_name"),
            phone: formData.get("phone")
          })
          .eq("id", user.id)
      }}
      className="max-w-xl space-y-6"
    >
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <input
        name="full_name"
        defaultValue={profile.full_name}
        className="w-full border p-3 rounded"
      />

      <input
        name="phone"
        defaultValue={profile.phone ?? ""}
        className="w-full border p-3 rounded"
      />

      <button className="bg-cyan-600 text-white px-6 py-3 rounded">
        Enregistrer
      </button>
    </form>
  )
}
