import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import Dashboard from "@/app/dashboard/layout";

async function UserDetails() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }
  return data.user;
}

async function ProtectedDashboard() {
  const user = await UserDetails();
  return <Dashboard user={user} />;
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedDashboard />
    </Suspense>
  );
}
