import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  // Only authenticated users (pastors/admins calling from the dashboard) may send email
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ok = await sendEmail({ to, subject, html });
    if (!ok) {
      return NextResponse.json({ error: "Email could not be sent" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-email]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
