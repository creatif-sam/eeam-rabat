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

  const { password, attendance } = body;

  if (!(await verifyTurnstile(body.turnstileToken, await requestIp(req)))) {
    return NextResponse.json({ error: CAPTCHA_ERROR }, { status: 403 });
  }

  if (!verifyAccessCode(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  if (
    !attendance ||
    !attendance.date ||
    !attendance.service_type_id ||
    attendance.culte === undefined ||
    attendance.hommes === undefined ||
    attendance.femmes === undefined ||
    attendance.enfants === undefined ||
    attendance.nouveaux === undefined
  ) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // Service role when configured, so anon INSERT can be revoked in Supabase
  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());
  const { error } = await supabase.from("attendance_records").insert({
    attendance_date: attendance.date,
    service_type_id: attendance.service_type_id,
    culte_total: Number(attendance.culte),
    hommes: Number(attendance.hommes),
    femmes: Number(attendance.femmes),
    enfants: Number(attendance.enfants),
    nouveaux: Number(attendance.nouveaux),
    notes: attendance.notes || null
  });

  if (error) {
    console.error("[attendance]", error.message);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
