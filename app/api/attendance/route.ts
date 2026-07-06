import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientKeyFrom, isRateLimited, verifyAccessCode } from "@/lib/publicFormsAccess";

export async function POST(req: Request) {
  if (isRateLimited(clientKeyFrom(req))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { password, attendance } = body;

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

  const supabase = await createSupabaseServerClient();
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
