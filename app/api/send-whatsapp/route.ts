import { NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Normalize a Moroccan phone number to E.164 format (without leading +).
 * Handles: +212..., 00212..., 06/07 (10-digit local), 6/7 (9-digit without leading 0).
 */
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (cleaned.startsWith("0") && cleaned.length === 10) return "212" + cleaned.slice(1);
  if (cleaned.length === 9) return "212" + cleaned;

  return cleaned;
}

export async function POST(req: Request) {
  try {
    const { phone, full_name, counselling_date, counselling_time, pastor_name } =
      await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Missing phone" }, { status: 400 });
    }

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.warn("[WhatsApp] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set — skipping");
      return NextResponse.json({ skipped: true });
    }

    const to = normalizePhone(phone);

    const dateFormatted = new Date(counselling_date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const messageBody = [
      `✅ *Entretien pastoral confirmé — EEAM Rabat*`,
      ``,
      `Bonjour *${full_name}*,`,
      ``,
      `Votre entretien pastoral a été *confirmé*. Voici les détails :`,
      ``,
      `📅 *Date :* ${dateFormatted}`,
      `🕐 *Heure :* ${counselling_time}`,
      pastor_name ? `👤 *Pasteur :* ${pastor_name}` : null,
      ``,
      `En cas de besoin, n'hésitez pas à nous contacter.`,
      `Que Dieu vous bénisse ! 🙏`,
      ``,
      `_Église EEAM — Rabat_`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: messageBody },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp API error]", result);
      return NextResponse.json(
        { error: result?.error?.message ?? "WhatsApp API error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.messages?.[0]?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-whatsapp]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
