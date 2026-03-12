import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "EEAM Rabat <eeam-r@gen116.com>";

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });

    if (error) {
      console.error("[Resend]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err: any) {
    console.error("[send-email]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
