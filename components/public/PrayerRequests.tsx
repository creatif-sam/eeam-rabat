"use client";

import { useState } from "react";
import { Save, Heart, Lock } from "lucide-react";
import { toast } from "sonner";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      toast.error("Une erreur est survenue. Veuillez informer un responsable.");
      return;
    }

    toast.success("Demande de prière envoyée. Notre équipe intercède avec foi.");
    setForm({ name: "", email: "", subject: "", message: "", confidential: false });
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
    "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
    "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
    "focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-rose-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {/* Header */}
      <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
        <Heart className="text-rose-600 dark:text-rose-400 mt-0.5" size={20} />
        <div className="text-sm text-rose-800 dark:text-rose-300">
          <p className="font-semibold">Demande de prière</p>
          <p>Partagez votre besoin. Notre équipe intercède avec foi et discrétion.</p>
        </div>
      </div>

      <input name="name" required value={form.name} onChange={handleChange}
        placeholder="Nom complet" className={inputClass} />

      <input type="email" name="email" value={form.email} onChange={handleChange}
        placeholder="Email optionnel" className={inputClass} />

      <input name="subject" required value={form.subject} onChange={handleChange}
        placeholder="Sujet de prière" className={inputClass} />

      <textarea name="message" rows={5} required value={form.message} onChange={handleChange}
        placeholder="Décrivez votre sujet de prière" className={inputClass} />

      <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" name="confidential" checked={form.confidential} onChange={handleChange}
          className="w-4 h-4 rounded accent-rose-500" />
        <span className="flex items-center gap-2">
          <Lock size={14} />
          Cette demande est confidentielle
        </span>
      </label>

      <button type="submit" disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60">
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Envoyer la demande de prière"}
      </button>
    </form>
  );
}