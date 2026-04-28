import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthCheck() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Block unapproved users unless they are admin or pastor
  const privilegedRoles = ["admin", "pastor", "corps_pastoral"];
  const isPrivileged = profile?.role && privilegedRoles.includes(profile.role);

  if (!isPrivileged && !profile?.approved) {
    redirect("/auth/pending-approval");
  }

  return { user, profile };
}