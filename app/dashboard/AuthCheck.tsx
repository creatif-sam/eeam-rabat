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

  // Block unapproved users unless they are admin/pastor.
  // Some accounts may carry role in auth metadata, so we normalize and fallback.
  const normalizeRole = (role: unknown) => {
    if (typeof role !== "string") return null;
    return role.trim().toLowerCase();
  };

  const roleFromProfile = normalizeRole(profile?.role);
  const roleFromUserMetadata = normalizeRole((user.user_metadata as Record<string, unknown> | null)?.role);
  const roleFromAppMetadata = normalizeRole((user.app_metadata as Record<string, unknown> | null)?.role);
  const effectiveRole = roleFromProfile ?? roleFromUserMetadata ?? roleFromAppMetadata;

  const privilegedRoles = ["admin", "pastor", "corps_pastoral"];
  const isPrivileged = effectiveRole != null && privilegedRoles.includes(effectiveRole);

  // If no profile row exists at all, let them through (profile setup will handle it)
  // Only redirect if profile exists AND they are not privileged AND not explicitly approved
  if (profile !== null && !isPrivileged && !profile?.approved) {
    redirect("/auth/pending-approval");
  }

  return { user, profile };
}