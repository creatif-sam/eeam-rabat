"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:ring-cyan-500 dark:focus:ring-cyan-400";

export default function VolunteerForm() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    ministry: "",
    skills: "",
    availability: [] as string[]
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleAvailability = (value: string) => {
    setForm(prev => ({
      ...prev,
      availability: prev.availability.includes(value)
        ? prev.availability.filter(v => v !== value)
        : [...prev.availability, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("volunteer_requests").insert(form);
    setLoading(false);

    if (error) {
      toast.error("Une erreur est survenue. Veuillez informer un responsable.");
      return;
    }
    // Send confirmation email if email provided
    if (form.email) {
      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#0e7490;margin-bottom:8px">👋 Candidature bénévolat reçue</h2>
          <p style="color:#374151">Bonjour <strong>${form.first_name} ${form.last_name}</strong>,</p>
          <p style="color:#374151">Votre candidature pour le ministère <strong>${form.ministry}</strong> a bien été reçue.</p>
          <p style="color:#374151">Nous vous contacterons prochainement pour la suite.</p>
          <p style="color:#6b7280;font-size:13px;margin-top:24px">Église EEAM — Rabat</p>
        </div>`;
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.email,
          subject: "Candidature bénévolat reçue — EEAM Rabat",
          html,
        }),
      });
    }
    toast.success("Candidature envoyée ! Nous vous contacterons bientôt.");
    setForm({ first_name: "", last_name: "", email: "", phone: "", ministry: "", skills: "", availability: [] });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <input name="first_name" placeholder="Prénom" required value={form.first_name}
          onChange={handleChange} className={inputClass} />
        <input name="last_name" placeholder="Nom" required value={form.last_name}
          onChange={handleChange} className={inputClass} />
      </div>

      <input name="email" type="email" placeholder="Email" value={form.email}
        onChange={handleChange} className={inputClass} />

      <input name="phone" placeholder="Téléphone" required value={form.phone}
        onChange={handleChange} className={inputClass} />

      <select name="ministry" required value={form.ministry} onChange={handleChange} className={inputClass}>
        <option value="">Ministère d’intérêt</option>
        <option value="Louange">Louange et Musique</option>
        <option value="Accueil">Accueil</option>
        <option value="Technique">Technique</option>
        <option value="Enfants">Enfants</option>
        <option value="Jeunesse">Jeunesse</option>
        <option value="Intercession">Intercession</option>
        <option value="Médias">Médias</option>
        <option value="Logistique">Logistique</option>
      </select>

      <textarea name="skills" rows={3} placeholder="Compétences et talents" value={form.skills}
        onChange={handleChange} className={inputClass} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilité</p>
        {["Dimanche", "Semaine", "Événements"].map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={form.availability.includes(opt)}
              onChange={() => toggleAvailability(opt)}
              className="w-4 h-4 rounded accent-cyan-500" />
            {opt}
          </label>
        ))}
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white py-3 rounded-xl font-medium shadow-lg hover:from-cyan-600 hover:to-emerald-700 transition disabled:opacity-60">
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Soumettre ma candidature"}
      </button>
    </form>
  );
}