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

  const { password, full_name, email, request_type, details } = body;

  if (!verifyAccessCode(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  if (!full_name || !email || !request_type || !details) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("commission_requests")
    .insert({ full_name, email, request_type, details });

  if (error) {
    console.error("[commission-requests]", error.message);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
