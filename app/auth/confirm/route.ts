import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

/** Only allow same-site relative redirects. */
function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  // Email template using {{ .TokenHash }} (works across devices)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  // Default Supabase template (PKCE): ?code=...
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    // The email IS confirmed at this point; the code just couldn't be
    // exchanged (e.g. link opened on another device). Ask them to log in.
    redirect("/auth/login?confirmed=1");
  }

  redirect(`/auth/error?error=${encodeURIComponent("Lien de confirmation invalide")}`);
}
