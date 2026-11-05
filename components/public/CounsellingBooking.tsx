"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Save, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import WhatsAppHint from "@/components/public/WhatsAppHint";
import { createClient } from "@/lib/supabase/client";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { bookCounselling, getSlotCounts } from "@/app/actions/public-forms";

type Pastor = {
  id: string;
  name: string;
  available_days: number[];
};

const DEFAULT_AVAILABLE_DAYS = [3, 5, 6];
const DAY_NAMES_FR: Record<number, string> = {
  0: "dimanche", 1: "lundi", 2: "mardi", 3: "mercredi",
  4: "jeudi", 5: "vendredi", 6: "samedi",
};

function formatDayNames(days: number[]): string {
  return [...days].sort().map(d => DAY_NAMES_FR[d]).join(" et ");
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:ring-cyan-500 dark:focus:ring-cyan-400";

const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

const MAX_PER_SLOT = 5;
const MAX_REASON_LENGTH = 600;

/** Next N valid counselling dates matching the given allowed weekdays, starting from today */
function getNextAvailableDates(allowedDays: number[], count = 5): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    if (allowedDays.includes(d.getDay())) {
      dates.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Format a YYYY-MM-DD string as e.g. "Mer 4/6" */
function formatChipDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

export default function PastoralCounsellingForm() {
  const supabase = createClient();

  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    pastor_id: "",
    reason: ""
  });

  const fetchPastors = useCallback(async () => {
    // Try with `available_days` first; fall back to base fields if the
    // column doesn't exist yet on a given Supabase project (same defensive
    // pattern as the confirmed-column fallback elsewhere in this app).
    const withDays = await supabase
      .from("pastors")
      .select("id,name,available_days")
      .eq("active", true)
      .order("name");

    if (!withDays.error) {
      setPastors((withDays.data || []) as Pastor[]);
      return;
    }

    const fallback = await supabase
      .from("pastors")
      .select("id,name")
      .eq("active", true)
      .order("name");
    setPastors((fallback.data || []).map(p => ({ ...p, available_days: DEFAULT_AVAILABLE_DAYS })));
  }, [supabase]);

  // Counts come from the server: booking details are never exposed publicly
  const fetchSlotCounts = useCallback(async (selectedDate: string) => {
    setSlotCounts(await getSlotCounts(selectedDate));
  }, []);

  useEffect(() => {
    fetchPastors();
  }, [fetchPastors]);

  useEffect(() => {
    if (date) fetchSlotCounts(date);
    else setSlotCounts({});
  }, [date, fetchSlotCounts]);

  const generateTimes = (start: string, end: string) => {
    const times: string[] = [];
    let [h, m] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    while (h < eh || (h === eh && m <= em)) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 30;
      if (m === 60) { h++; m = 0; }
    }
    return times;
  };

  // today's date string (YYYY-MM-DD) used as min for the date picker
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const selectedPastor = useMemo(
    () => pastors.find(p => p.id === form.pastor_id) || null,
    [pastors, form.pastor_id]
  );
  const allowedDays = selectedPastor?.available_days ?? DEFAULT_AVAILABLE_DAYS;

  const nextDates = useMemo(() => getNextAvailableDates(allowedDays, 5), [allowedDays]);

  const getAvailableTimes = () => {
    if (!date) return [];
    const day = new Date(date + "T00:00:00").getDay();
    if (allowedDays.includes(day)) return generateTimes("16:30", "19:00");
    return [];
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setTime("");
    setDateError("");
    const day = new Date(value + "T00:00:00").getDay();
    if (!allowedDays.includes(day)) {
      setDateError(
        selectedPastor
          ? `${selectedPastor.name} est disponible uniquement le ${formatDayNames(allowedDays)}. Veuillez choisir une autre date.`
          : "Les entretiens sont disponibles uniquement les mercredis, vendredis et samedis."
      );
    }
  };

  // If the visitor already picked a date and then switches to a pastor who
  // isn't available that day, the date is no longer valid — clear it and
  // prompt them to pick a new one instead of silently keeping a bad date.
  useEffect(() => {
    if (!date) return;
    const day = new Date(date + "T00:00:00").getDay();
    if (!allowedDays.includes(day)) {
      setDate("");
      setTime("");
      setDateError(
        selectedPastor
          ? `${selectedPastor.name} est disponible uniquement le ${formatDayNames(allowedDays)}. Veuillez choisir une nouvelle date.`
          : ""
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pastor_id]);

  // Validates a Moroccan mobile number: +212/00212/0 followed by 6 or 7 then 8 digits
  const validatePhone = (value: string) => {
    const stripped = value.replace(/[\s\-\(\)\.]/g, "");
    const valid = /^(\+212|00212|0)[67]\d{8}$|^[67]\d{8}$/.test(stripped);
    setPhoneError(valid ? "" : "Numéro invalide. Format attendu : +212 6XX XXX XXX");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "reason" && value.length > MAX_REASON_LENGTH) return;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "phone") validatePhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError || phoneError || !date || !time || isSubmitting) return;
    if (honeypot) return;
    if (!captcha) {
      toast.error("Merci de valider la vérification anti-robot.");
      return;
    }

    setIsSubmitting(true);
    // Server action: verifies Turnstile, then books atomically through
    // book_counselling_slot() (with a fallback if that migration is missing).
    const result = await bookCounselling(
      { ...form, counselling_date: date, counselling_time: time },
      captcha,
      MAX_PER_SLOT
    );
    setIsSubmitting(false);
    captchaRef.current?.reset();

    if (!result.ok) {
      toast.error(result.error);
      if (result.code === "SLOT_FULL") fetchSlotCounts(date);
      return;
    }

    setBookingRef(`EP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Réservation envoyée</h3>
        {bookingRef && (
          <p className="text-sm font-mono bg-green-100 dark:bg-green-800/30 rounded-lg px-3 py-1.5 inline-block text-green-700 dark:text-green-300">
            Référence : {bookingRef}
          </p>
        )}
        <p className="text-sm text-green-700 dark:text-green-300">
          Conservez cette référence. Vous serez contacté(e) pour confirmation.
        </p>
      </div>
    );
  }

  const availableTimes = getAvailableTimes();
  const queueCount = time ? (slotCounts[time] ?? 0) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot – hidden from real users, bots fill it */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      <div className="flex gap-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
        <Calendar className="text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" size={20} />
        <div className="text-sm text-cyan-800 dark:text-cyan-300">
          <p className="font-semibold">Horaires des entretiens pastoraux</p>
          <p>Mercredi, vendredi et samedi de 16h30 à 19h00.</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Nom complet *</label>
        <input name="full_name" value={form.full_name} onChange={handleChange}
          className={inputClass} placeholder="Dior Masrané" required />
      </div>

      <div>
        <label className={labelClass}>Téléphone *</label>
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          onBlur={() => form.phone && validatePhone(form.phone)}
          className={`${inputClass} ${phoneError ? "border-rose-400 dark:border-rose-500 focus:ring-rose-500" : ""}`}
          placeholder="+212 6XX XXX XXX"
          required
        />
        {phoneError ? (
          <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{phoneError}</p>
        ) : (
          <WhatsAppHint />
        )}
      </div>

      <div>
        <label className={labelClass}>Email <span className="font-normal text-gray-500 dark:text-gray-400">(optionnel)</span></label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          className={inputClass} placeholder="dior@exemple.com" />
      </div>

      <div>
        <label className={labelClass}>Pasteur souhaité</label>
        <select name="pastor_id" value={form.pastor_id} onChange={handleChange} className={inputClass}>
          <option value="">Indifférent</option>
          {pastors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {selectedPastor && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            {selectedPastor.name} est disponible uniquement le {formatDayNames(allowedDays)}.
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>Date souhaitée *</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {nextDates.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleDateChange(d)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                date === d
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-cyan-400"
              }`}
            >
              {formatChipDate(d)}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={e => handleDateChange(e.target.value)}
          min={todayStr}
          className={`${inputClass} ${dateError ? "border-rose-400 dark:border-rose-500 focus:ring-rose-500" : ""}`}
          required
        />
        {dateError && (
          <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{dateError}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Heure souhaitée *</label>
        <select
          value={time}
          onChange={e => setTime(e.target.value)}
          className={inputClass}
          required
          disabled={!availableTimes.length}
        >
          <option value="">Sélectionner une heure</option>
          {availableTimes.map(t => {
            const count = slotCounts[t] ?? 0;
            const full = count >= MAX_PER_SLOT;
            return (
              <option key={t} value={t} disabled={full}>
                {full ? `${t} — Complet` : count > 0 ? `${t} — ${count}/${MAX_PER_SLOT} pris` : t}
              </option>
            );
          })}
        </select>
        {queueCount !== null && queueCount > 0 && (
          <p className={`mt-1.5 text-sm ${queueCount >= MAX_PER_SLOT - 1 ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}`}>
            {queueCount} personne{queueCount > 1 ? "s" : ""} ont déjà choisi ce créneau.
            {queueCount >= MAX_PER_SLOT - 1 ? " Dépêchez-vous !" : ""}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Information complémentaire (optionnel: laissez vide si vous n&apos;avez pas)</label>
          <span className={`text-xs ${form.reason.length > MAX_REASON_LENGTH * 0.9 ? "text-amber-500" : "text-gray-400 dark:text-gray-500"}`}>
            {form.reason.length}/{MAX_REASON_LENGTH}
          </span>
        </div>
        <textarea name="reason" rows={4} value={form.reason} onChange={handleChange}
          className={inputClass} placeholder="Ajoutez des informations supplémentaires si nécessaire (optionnel)" />
      </div>

      <Turnstile ref={captchaRef} onToken={setCaptcha} />

      <button
        type="submit"
        disabled={!!dateError || !!phoneError || isSubmitting || !captcha}
        className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-lg ${
          dateError || phoneError || isSubmitting || !captcha
            ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
        }`}
      >
        <Save size={18} />
        {isSubmitting ? "Envoi en cours…" : "Réserver l\u2019entretien"}
      </button>
    </form>
  );
}
