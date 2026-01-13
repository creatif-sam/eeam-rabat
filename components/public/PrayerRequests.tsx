"use client";

import { useState } from "react";
import { Save, Heart, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PrayerRequestForm() {
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    confidential: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setForm(prev => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("prayer_requests")
      .insert({
        name: form.name,
        email: form.email || null,
        subject: form.subject,
        message: form.message,
        confidential: form.confidential
      });

    setLoading(false);

    if (error) {
      setError(
        "Une erreur est survenue. Veuillez informer un responsable de l’église."
      );
      return;
    }

    setSuccess(true);
    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      confidential: false
    });
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h3 className="text-lg font-semibold text-green-800">
          Demande envoyée
        </h3>
        <p className="text-sm text-green-700">
          Votre demande de prière a été transmise.
          Notre équipe intercède avec foi et discrétion.
        </p>

        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-5 py-2 rounded-lg bg-green-600 text-white text-sm"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {/* Header */}
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
        <Heart className="text-rose-600 mt-0.5" size={20} />
        <div className="text-sm text-rose-800">
          <p className="font-semibold">Demande de prière</p>
          <p>
            Partagez votre besoin.
            Notre équipe intercède avec foi et discrétion.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <input
        name="name"
        required
        value={form.name}
        onChange={handleChange}
        placeholder="Nom complet"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
      />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email optionnel"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
      />

      <input
        name="subject"
        required
        value={form.subject}
        onChange={handleChange}
        placeholder="Sujet de prière"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
      />

      <textarea
        name="message"
        rows={5}
        required
        value={form.message}
        onChange={handleChange}
        placeholder="Décrivez votre sujet de prière"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
      />

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

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg font-medium flex items-center justify-center gap-2"
      >
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Envoyer la demande de prière"}
      </button>
    </form>
  );
}
