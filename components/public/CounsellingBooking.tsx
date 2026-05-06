"use client";

import { useEffect, useState } from "react";
import { Save, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Pastor = {
  id: string;
  name: string;
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:ring-cyan-500 dark:focus:ring-cyan-400";

const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

export default function PastoralCounsellingForm() {
  const supabase = createClient();

  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [queueCount, setQueueCount] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    pastor_id: "",
    reason: ""
  });

  useEffect(() => {
    fetchPastors();
  }, []);

  useEffect(() => {
    if (date && time) {
      fetchQueueCount(date, time);
    } else {
      setQueueCount(null);
    }
  }, [date, time]);

  const fetchPastors = async () => {
    const { data } = await supabase
      .from("pastors")
      .select("id,name")
      .eq("active", true)
      .order("name");
    setPastors(data || []);
  };

  const fetchQueueCount = async (selectedDate: string, selectedTime: string) => {
    const { count } = await supabase
      .from("pastoral_counselling")
      .select("id", { count: "exact", head: true })
      .eq("counselling_date", selectedDate)
      .eq("counselling_time", selectedTime);
    setQueueCount(count || 0);
  };

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

  const getAvailableTimes = () => {
    if (!date) return [];
    const day = new Date(date).getDay();
    if (day === 2 || day === 5) return generateTimes("16:00", "19:00");
    if (day === 6) return generateTimes("10:00", "16:00");
    return [];
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setTime("");
    setDateError("");
    const day = new Date(value).getDay();
    if (![2, 5, 6].includes(day)) {
      setDateError("Les entretiens sont disponibles uniquement les mardis, vendredis et samedis.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError || !date || !time) return;

    const { error: insertError } = await supabase
      .from("pastoral_counselling")
      .insert({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        pastor_id: form.pastor_id || null,
        counselling_date: date,
        counselling_time: time,
        reason: form.reason
      });

    if (insertError) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center mx-auto">
          <Save className="text-green-600 dark:text-green-400" size={22} />
        </div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Réservation envoyée</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Votre réservation a bien été envoyée. Vous recevrez une confirmation par WhatsApp ou email.
        </p>
      </div>
    );
  }

  const availableTimes = getAvailableTimes();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
        <Calendar className="text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" size={20} />
        <div className="text-sm text-cyan-800 dark:text-cyan-300">
          <p className="font-semibold">Horaires des entretiens pastoraux</p>
          <p>Mardi et vendredi à partir de 16h. Samedi de 10h à 16h.</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Nom complet *</label>
        <input name="full_name" value={form.full_name} onChange={handleChange}
          className={inputClass} placeholder="Jean Dupont" required />
      </div>

      <div>
        <label className={labelClass}>Téléphone *</label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange}
          className={inputClass} placeholder="+212 6XX XXX XXX" required />
      </div>

      <div>
        <label className={labelClass}>Email <span className="font-normal text-gray-500 dark:text-gray-400">(optionnel)</span></label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          className={inputClass} placeholder="email@exemple.com" />
      </div>

      <div>
        <label className={labelClass}>Pasteur souhaité</label>
        <select name="pastor_id" value={form.pastor_id} onChange={handleChange} className={inputClass}>
          <option value="">Indifférent</option>
          {pastors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Date souhaitée *</label>
        <input
          type="date"
          value={date}
          onChange={e => handleDateChange(e.target.value)}
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
          {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {queueCount !== null && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {queueCount} personne{queueCount > 1 ? "s" : ""} ont déjà choisi ce créneau avant vous.
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>Motif de l&apos;entretien *</label>
        <textarea name="reason" rows={4} value={form.reason} onChange={handleChange}
          className={inputClass} placeholder="Décrivez brièvement le motif" required />
      </div>

      <button
        type="submit"
        disabled={!!dateError}
        className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-lg ${
          dateError
            ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
        }`}
      >
        <Save size={18} />
        Réserver l&apos;entretien
      </button>
    </form>
  );
}
