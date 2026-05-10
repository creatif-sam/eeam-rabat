import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResourcesDocsPage from "@/components/ressources/ResourcesDocsPage";

export const metadata = {
  title: "Ressources & Documents | eLead EEAM",
};

export default async function RessourcesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return <ResourcesDocsPage role={profile?.role ?? null} />;
}
