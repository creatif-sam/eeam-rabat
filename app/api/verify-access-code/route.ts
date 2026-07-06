import { NextResponse } from "next/server";
import { clientKeyFrom, isRateLimited, verifyAccessCode } from "@/lib/publicFormsAccess";

// Lets the public attendance/commission-request forms show an immediate
// "wrong password" message before the visitor fills in the whole form.
// The actual submit endpoints re-check the code themselves, so this route
// being called successfully grants no access by itself.
export async function POST(req: Request) {
  if (isRateLimited(clientKeyFrom(req))) {
    return NextResponse.json({ ok: false, error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const ok = verifyAccessCode(body?.password);
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
