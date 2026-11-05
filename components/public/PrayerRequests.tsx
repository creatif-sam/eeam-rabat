"use client";

import { useRef, useState } from "react";
import { Save, Heart, Lock } from "lucide-react";
import { toast } from "sonner";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { submitPrayerRequest } from "@/app/actions/public-forms";

export default function PrayerRequestForm({ onSuccess, showHeader = true }: { onSuccess?: () => void; showHeader?: boolean } = {}) {
  const [captcha, setCaptcha] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

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
    if (!captcha) {
      toast.error("Merci de valider la vérification anti-robot.");
      return;
    }
    setLoading(true);
    const result = await submitPrayerRequest(form, captcha);
    setLoading(false);
    captchaRef.current?.reset();

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Demande de prière envoyée. Notre équipe intercède avec foi.");
    setForm({ name: "", email: "", subject: "", message: "", confidential: false });
    onSuccess?.();
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
    "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
    "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
    "focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-rose-400";

  const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      {/* Header */}
      {showHeader && (
      <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
        <Heart className="text-rose-600 dark:text-rose-400 mt-0.5" size={20} />
        <div className="text-sm text-rose-800 dark:text-rose-300">
          <p className="font-semibold">Demande de prière</p>
          <p>Partagez votre besoin. Notre équipe intercède avec foi et discrétion.</p>
        </div>
      </div>
      )}

      <div>
        <label className={labelClass}>Nom complet *</label>
        <input name="name" required value={form.name} onChange={handleChange}
          placeholder="Jean Dupont" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Email <span className="font-normal text-gray-500 dark:text-gray-400">(optionnel)</span></label>
        <input type="email" name="email" value={form.email} onChange={handleChange}
          placeholder="jean@exemple.com" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Sujet de prière *</label>
        <input name="subject" required value={form.subject} onChange={handleChange}
          placeholder="Ex. : santé, famille, travail…" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Message *</label>
        <textarea name="message" rows={5} required value={form.message} onChange={handleChange}
          placeholder="Décrivez votre sujet de prière" className={inputClass} />
      </div>

      <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" name="confidential" checked={form.confidential} onChange={handleChange}
          className="w-4 h-4 rounded accent-rose-500" />
        <span className="flex items-center gap-2">
          <Lock size={14} />
          Cette demande est confidentielle
        </span>
      </label>

      <Turnstile ref={captchaRef} onToken={setCaptcha} />

      <button type="submit" disabled={loading || !captcha}
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60">
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Envoyer la demande de prière"}
      </button>
    </form>
  );
}