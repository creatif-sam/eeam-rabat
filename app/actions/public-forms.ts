"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { CAPTCHA_ERROR, isHuman } from "@/lib/turnstile"
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email/resend"
import { after } from "next/server"
import { notify } from "@/lib/notifications/server"

/**
 * Public form submissions. Every action verifies the Cloudflare Turnstile
 * token on the server before writing anything, and only whitelisted fields
 * are inserted.
 */

export type FormResult = { ok: true } | { ok: false; error: string; code?: string }

/** Bell + push alert to admins and pastors, sent after the response. */
function alertLeaders(title: string, body: string, url: string) {
  after(() => notify({ audience: "leaders", title, body, url, type: "warning" }))
}

const GENERIC_ERROR = "Une erreur est survenue. Veuillez réessayer."

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const optStr = (v: unknown, max = 500) => str(v, max) || null

/** Service-role client when configured (lets anon INSERT be revoked), else the regular server client. */
async function db() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient())
}

/* ---------------- Inscription membre ---------------- */
export async function submitMemberRegistration(input: Record<string, unknown>, token: string | null): Promise<FormResult> {
  if (!(await isHuman(token))) return { ok: false, error: CAPTCHA_ERROR }
  if (input.consent !== true) return { ok: false, error: "Veuillez accepter la politique de confidentialité." }

  const commissions = Array.isArray(input.commissions)
    ? input.commissions.filter((c): c is string => typeof c === "string").slice(0, 20)
    : []
  if (!commissions.length) return { ok: false, error: "Veuillez sélectionner au moins une commission." }

  const payload = {
    paroisse: str(input.paroisse, 100),
    nom: str(input.nom, 100),
    prenom: str(input.prenom, 100),
    genre: str(input.genre, 20),
    nationalite: str(input.nationalite, 100),
    telephone: str(input.telephone, 30),
    email: optStr(input.email, 200),
    profession: str(input.profession, 150),
    baptise: str(input.baptise, 10),
    date_bapteme: optStr(input.date_bapteme, 10),
    adresse: str(input.adresse, 300),
    commissions,
    consent: true,
  }
  if (!payload.paroisse || !payload.nom || !payload.prenom || !payload.telephone) {
    return { ok: false, error: "Merci de remplir tous les champs obligatoires." }
  }

  const { error } = await (await db()).from("member_registrations").insert(payload)
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ce numéro de téléphone est déjà utilisé." }
    console.error("[member_registrations]", error.message)
    return { ok: false, error: GENERIC_ERROR }
  }
  alertLeaders("Nouvelle inscription membre", `${payload.prenom} ${payload.nom}`, "/dashboard/membres")
  return { ok: true }
}

/* ---------------- Bénévolat ---------------- */
export async function submitVolunteer(input: Record<string, unknown>, token: string | null): Promise<FormResult> {
  if (!(await isHuman(token))) return { ok: false, error: CAPTCHA_ERROR }

  const availability = Array.isArray(input.availability)
    ? input.availability.filter((a): a is string => typeof a === "string").slice(0, 10)
    : []
  const payload = {
    first_name: str(input.first_name, 100),
    last_name: str(input.last_name, 100),
    email: optStr(input.email, 200),
    phone: str(input.phone, 30),
    ministry: str(input.ministry, 100),
    skills: optStr(input.skills, 1000),
    availability,
  }
  if (!payload.first_name || !payload.last_name || !payload.phone || !payload.ministry) {
    return { ok: false, error: "Merci de remplir tous les champs obligatoires." }
  }

  const { error } = await (await db()).from("volunteer_requests").insert(payload)
  if (error) {
    console.error("[volunteer_requests]", error.message)
    return { ok: false, error: "Une erreur est survenue. Veuillez informer un responsable." }
  }

  // Confirmation e-mail (best effort — never blocks the submission)
  if (payload.email) {
    await sendEmail({
      to: payload.email,
      subject: "Candidature bénévolat reçue — EEAM Rabat",
      html: emailLayout({
        title: "Candidature bénévolat reçue",
        body: `<p>Bonjour <strong>${escapeHtml(`${payload.first_name} ${payload.last_name}`)}</strong>,</p>
          <p>Votre candidature pour le ministère <strong>${escapeHtml(payload.ministry)}</strong> a bien été reçue.</p>
          <p>Nous vous contacterons prochainement pour la suite.</p>`,
      }),
    })
  }
  alertLeaders("Nouvelle candidature bénévole", `${payload.first_name} ${payload.last_name} · ${payload.ministry}`, "/dashboard/formulaires?tab=volunteer")
  return { ok: true }
}

/* ---------------- Rejoindre une commission ---------------- */
export async function submitJoinGroup(input: Record<string, unknown>, token: string | null): Promise<FormResult> {
  if (!(await isHuman(token))) return { ok: false, error: CAPTCHA_ERROR }

  const payload = {
    full_name: str(input.full_name, 150),
    phone: str(input.phone, 30),
    email: optStr(input.email, 200),
    group_id: str(input.group_id, 64),
    motivation: str(input.motivation, 2000),
  }
  if (!payload.full_name || !payload.phone || !payload.group_id) {
    return { ok: false, error: "Merci de remplir tous les champs obligatoires." }
  }

  const { error } = await (await db()).from("group_join_requests").insert(payload)
  if (error) {
    console.error("[group_join_requests]", error.message)
    return { ok: false, error: GENERIC_ERROR }
  }
  alertLeaders("Nouvelle demande pour rejoindre une commission", payload.full_name, "/dashboard/formulaires?tab=group")
  return { ok: true }
}

/* ---------------- Sujet de prière ---------------- */
export async function submitPrayerRequest(input: Record<string, unknown>, token: string | null): Promise<FormResult> {
  if (!(await isHuman(token))) return { ok: false, error: CAPTCHA_ERROR }

  const payload = {
    name: str(input.name, 150),
    email: optStr(input.email, 200),
    subject: str(input.subject, 200),
    message: str(input.message, 4000),
    confidential: input.confidential === true,
  }
  if (!payload.subject || !payload.message) {
    return { ok: false, error: "Merci de remplir tous les champs obligatoires." }
  }

  const { error } = await (await db()).from("prayer_requests").insert(payload)
  if (error) {
    console.error("[prayer_requests]", error.message)
    return { ok: false, error: "Une erreur est survenue. Veuillez informer un responsable." }
  }
  alertLeaders("Nouvelle demande de prière", payload.confidential ? "Demande confidentielle" : payload.subject, "/dashboard/formulaires?tab=prayer")
  return { ok: true }
}

/* ---------------- Entretien pastoral ---------------- */
export async function bookCounselling(
  input: Record<string, unknown>,
  token: string | null,
  maxPerSlot: number
): Promise<FormResult> {
  if (!(await isHuman(token))) return { ok: false, error: CAPTCHA_ERROR }

  const p = {
    full_name: str(input.full_name, 150),
    phone: str(input.phone, 30),
    email: optStr(input.email, 200),
    pastor_id: optStr(input.pastor_id, 64),
    counselling_date: str(input.counselling_date, 10),
    counselling_time: str(input.counselling_time, 8),
    reason: str(input.reason, 2000),
  }
  if (!p.full_name || !p.phone || !p.counselling_date || !p.counselling_time) {
    return { ok: false, error: "Merci de remplir tous les champs obligatoires." }
  }

  const supabase = await db()
  const { error } = await supabase.rpc("book_counselling_slot", {
    p_full_name: p.full_name,
    p_phone: p.phone,
    p_email: p.email,
    p_pastor_id: p.pastor_id,
    p_counselling_date: p.counselling_date,
    p_counselling_time: p.counselling_time,
    p_reason: p.reason,
    p_max_per_slot: maxPerSlot,
  })
  if (!error) {
    alertLeaders("Nouvelle demande d'entretien pastoral", `${p.full_name} · ${p.counselling_date} ${p.counselling_time}`, "/dashboard/formulaires?tab=pastoral")
    return { ok: true }
  }

  const msg = error.message || ""
  if (msg.includes("DUPLICATE_BOOKING")) return { ok: false, code: "DUPLICATE_BOOKING", error: "Vous avez déjà réservé ce créneau horaire." }
  if (msg.includes("SLOT_FULL")) return { ok: false, code: "SLOT_FULL", error: "Ce créneau est complet. Veuillez en choisir un autre." }
  if (msg.includes("PASTOR_UNAVAILABLE")) {
    return { ok: false, code: "PASTOR_UNAVAILABLE", error: "Ce pasteur n'est pas disponible à cette date. Veuillez choisir une autre date." }
  }

  if (error.code === "PGRST202" || error.code === "42883") {
    // book_counselling_slot() migration not applied yet: non-atomic fallback
    const client = await db()
    const { count: dup } = await client
      .from("pastoral_counselling")
      .select("id", { count: "exact", head: true })
      .eq("phone", p.phone)
      .eq("counselling_date", p.counselling_date)
      .eq("counselling_time", p.counselling_time)
    if ((dup ?? 0) > 0) return { ok: false, code: "DUPLICATE_BOOKING", error: "Vous avez déjà réservé ce créneau horaire." }

    const { count: taken } = await client
      .from("pastoral_counselling")
      .select("id", { count: "exact", head: true })
      .eq("counselling_date", p.counselling_date)
      .eq("counselling_time", p.counselling_time)
    if ((taken ?? 0) >= maxPerSlot) return { ok: false, code: "SLOT_FULL", error: "Ce créneau est complet. Veuillez en choisir un autre." }

    const { error: insertError } = await client.from("pastoral_counselling").insert(p)
    if (!insertError) {
      alertLeaders("Nouvelle demande d'entretien pastoral", `${p.full_name} · ${p.counselling_date} ${p.counselling_time}`, "/dashboard/formulaires?tab=pastoral")
      return { ok: true }
    }
    console.error("[pastoral_counselling]", insertError.message)
  } else {
    console.error("[book_counselling_slot]", error.message)
  }
  return { ok: false, error: GENERIC_ERROR }
}

/** Bookings per time slot for one date (counts only — no personal data leaves the server). */
export async function getSlotCounts(date: string): Promise<Record<string, number>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return {}
  const { data, error } = await (await db())
    .from("pastoral_counselling")
    .select("counselling_time")
    .eq("counselling_date", date)
  if (error) return {}
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const t = String(row.counselling_time ?? "").slice(0, 5)
    if (t) counts[t] = (counts[t] ?? 0) + 1
  }
  return counts
}
