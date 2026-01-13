"use client";

import { useEffect, useState } from "react";
import { Save, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Pastor = {
  id: string;
  name: string;
};

export default function PastoralCounsellingForm() {
  const supabase = createClient();

  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
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
      if (m === 60) {
        h++;
        m = 0;
      }
    }

    return times;
  };

  const getAvailableTimes = () => {
    if (!date) return [];

    const day = new Date(date).getDay();

    if (day === 2 || day === 5) {
      return generateTimes("16:00", "19:00");
    }

    if (day === 6) {
      return generateTimes("10:00", "16:00");
    }

    return [];
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setTime("");
    setError("");

    const day = new Date(value).getDay();

    if (![2, 5, 6].includes(day)) {
      setError(
        "Les entretiens sont disponibles uniquement les mardis, vendredis et samedis."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error || !date || !time) return;

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
      setError(insertError.message);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h3 className="text-lg font-semibold text-green-800">
          Réservation envoyée
        </h3>
        <p className="text-sm text-green-700">
          Votre réservation a bien été envoyée.  
          Vous recevrez une confirmation par WhatsApp ou par email.
        </p>
      </div>
    );
  }

  const availableTimes = getAvailableTimes();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-3 bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <Calendar className="text-cyan-600 mt-0.5" size={20} />
        <div className="text-sm text-cyan-800">
          <p className="font-semibold">Horaires des entretiens pastoraux</p>
          <p>Mardi et vendredi à partir de 16h. Samedi de 10h à 16h.</p>
        </div>
      </div>

      <input
        name="full_name"
        value={form.full_name}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Nom complet"
        required
      />

      <input
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Téléphone"
        required
      />

      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Email"
      />

      <select
        name="pastor_id"
        value={form.pastor_id}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">Indifférent</option>
        {pastors.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={e => handleDateChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
          error
            ? "border-rose-400 focus:ring-rose-500"
            : "border-gray-200 focus:ring-cyan-500"
        }`}
        required
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <select
        value={time}
        onChange={e => setTime(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        required
        disabled={!availableTimes.length}
      >
        <option value="">Heure souhaitée</option>
        {availableTimes.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {queueCount !== null && (
        <p className="text-sm text-gray-600">
          {queueCount} personne
          {queueCount > 1 ? "s" : ""} ont déjà choisi ce créneau avant vous.
        </p>
      )}

      <textarea
        name="reason"
        rows={4}
        value={form.reason}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Motif de l'entretien"
        required
      />

      <button
        type="submit"
        disabled={!!error}
        className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-lg ${
          error
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
        }`}
      >
        <Save size={18} />
        Réserver l'entretien
      </button>
    </form>
  );
}
