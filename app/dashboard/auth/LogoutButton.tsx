import { createSupabaseServerClient } from "../../../lib/supabase/server";
export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"
        const supabase = await createSupabaseServerClient()
        await supabase.auth.signOut()
      }}
    >
      <button className="text-sm text-red-600">
        Se déconnecter
      </button>
    </form>
  )
}
