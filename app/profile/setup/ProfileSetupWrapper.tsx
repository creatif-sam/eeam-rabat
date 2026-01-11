import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileSetupForm from "@/components/profile/profile-setup-form";

export default async function ProfileSetupWrapper() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <ProfileSetupForm profile={profile} />
    </div>
  );
}