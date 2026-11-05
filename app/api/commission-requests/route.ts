import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { clientKeyFrom, isRateLimited, verifyAccessCode } from "@/lib/publicFormsAccess";
import { CAPTCHA_ERROR, requestIp, verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: Request) {
  if (isRateLimited(clientKeyFrom(req))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { password, full_name, email, request_type, details } = body;

  if (!(await verifyTurnstile(body.turnstileToken, await requestIp(req)))) {
    return NextResponse.json({ error: CAPTCHA_ERROR }, { status: 403 });
  }

  if (!verifyAccessCode(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  if (!full_name || !email || !request_type || !details) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // Service role when configured, so anon INSERT can be revoked in Supabase
  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());
  const { error } = await supabase
    .from("commission_requests")
    .insert({ full_name, email, request_type, details });

  if (error) {
    console.error("[commission-requests]", error.message);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
