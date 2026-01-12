"use client";

import { useState } from "react";
import { Save, Calendar, AlertCircle } from "lucide-react";

export default function PastoralMeetingForm() {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const allowedDays = [2, 5, 6]; // Tuesday, Friday, Saturday

  const handleDateChange = (value: string) => {
    setDate(value);
    setError("");

    if (!value) return;

    const selectedDay = new Date(value).getDay();

    if (!allowedDays.includes(selectedDay)) {
      setError(
        "Les entretiens pastoraux ont lieu uniquement les mardis, vendredis et samedis."
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (error || !date) {
      return;
    }

    // submit logic later
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Notice */}
      <div className="flex gap-3 bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <Calendar className="text-cyan-600 mt-0.5" size={20} />
        <div className="text-sm text-cyan-800">
          <p className="font-semibold">
            Jours d’entretien pastoral
          </p>
          <p>
            Les entretiens ont lieu uniquement les
            <strong> mardis, vendredis et samedis</strong>.
          </p>
        </div>
      </div>

      {/* Identity */}
      <input
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Nom complet"
        required
      />

      <input
        type="tel"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Téléphone"
        required
      />

      <input
        type="email"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Email"
      />

      {/* Pastor */}
      <select
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        required
      >
        <option value="">Pasteur souhaité</option>
        <option value="camille">Pasteur Camille</option>
        <option value="jessica">Pasteur Jessica</option>
        <option value="albert">Albert</option>
        <option value="any">Indifférent</option>
      </select>

      {/* Date */}
      <div className="space-y-2">
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
      </div>

      {/* Time */}
      <select
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        required
      >
        <option value="">Heure préférée</option>
        <option value="morning">Matin</option>
        <option value="afternoon">Après midi</option>
        <option value="evening">Soir</option>
      </select>

      {/* Reason */}
      <textarea
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Motif de l'entretien"
        required
      />

      {/* Submit */}
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
