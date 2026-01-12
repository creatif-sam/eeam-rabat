import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"
        const supabase = await createSupabaseServerClient()
        await supabase.auth.signOut()
        redirect("/");
      }}
    >
      <button className="text-sm text-red-600">
        Se déconnecter
      </button>
    </form>
  )
}
