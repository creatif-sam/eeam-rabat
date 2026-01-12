"use client";

import { useState } from "react";
import { Save, Heart, Lock } from "lucide-react";

export default function PrayerRequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    confidential: false
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // submission logic later
    console.log("Prayer request submitted", form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
        <Heart className="text-rose-600 mt-0.5" size={20} />
        <div className="text-sm text-rose-800">
          <p className="font-semibold">
            Demande de prière
          </p>
          <p>
            Partagez votre besoin. Notre équipe intercède avec foi et discrétion.
          </p>
        </div>
      </div>

      {/* Identity */}
      <input
        name="name"
        required
        placeholder="Nom complet"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email (optionnel)"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        onChange={handleChange}
      />

      {/* Subject */}
      <input
        name="subject"
        required
        placeholder="Sujet de prière"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        onChange={handleChange}
      />

      {/* Message */}
      <textarea
        name="message"
        rows={5}
        required
        placeholder="Décrivez votre sujet de prière"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        onChange={handleChange}
      />

      {/* Confidential */}
      <label className="flex items-center gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          name="confidential"
          checked={form.confidential}
          onChange={handleChange}
        />
        <span className="flex items-center gap-2">
          <Lock size={14} />
          Cette demande est confidentielle
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg font-medium flex items-center justify-center gap-2"
      >
        <Save size={18} />
        Envoyer la demande de prière
      </button>
    </form>
  );
}
