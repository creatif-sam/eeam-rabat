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

  // Accounts created (or reset) by an administrator carry a one-time
  // password: nothing is reachable until the person picks their own.
  // getUser() reads the live record, so this cannot be stale; only the
  // service role can write app_metadata, so users cannot clear it themselves.
  if ((user.app_metadata as Record<string, unknown> | null)?.must_change_password === true) {
    redirect("/auth/update-password?first=1");
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

  const privilegedRoles = ["admin", "pastor", "treasurer"];
  const isPrivileged = effectiveRole != null && privilegedRoles.includes(effectiveRole);

  if (!isPrivileged) {
    // No profile yet → finish profile setup first (it then lands on pending approval).
    if (profile === null) redirect("/profile/setup");
    if (!profile.approved) redirect("/auth/pending-approval");
  }

  return { user, profile };
}