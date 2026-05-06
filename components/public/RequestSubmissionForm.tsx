"use client";

import { useState } from "react";
import { Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const ACCESS_PASSWORD = "EEAM2026";

const inputClass = "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:ring-rose-500 dark:focus:ring-rose-400";

const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

export default function RequestSubmissionForm() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", request_type: "", details: ""
  });

  const handleUnlock = () => {
    if (password === ACCESS_PASSWORD) {
      setAuthorized(true);
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("commission_requests").insert(form);
    setLoading(false);

    if (error) {
      toast.error("Une erreur est survenue. Veuillez informer un membre du CP.");
      return;
    }

    toast.success("Demande envoyée avec succès !");
    setForm({ full_name: "", email: "", request_type: "", details: "" });
  };

  /* Password gate */
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Lock className="text-white" size={26} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Accès sécurisé</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
          La soumission des demandes est réservée aux responsables autorisés.
        </p>
        <input
          type="password" placeholder="Mot de passe" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleUnlock()}
          className={inputClass + " max-w-xs"}
        />
        <button onClick={handleUnlock}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl shadow font-medium hover:from-rose-600 hover:to-pink-700 transition">
          Déverrouiller
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className={labelClass}>Nom complet *</label>
        <input name="full_name" value={form.full_name} onChange={handleChange}
          className={inputClass} placeholder="Jean Dupont" required />
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          className={inputClass} placeholder="email@exemple.com" required />
      </div>
      <div>
        <label className={labelClass}>Type de demande *</label>
        <select name="request_type" value={form.request_type} onChange={handleChange}
          className={inputClass} required>
          <option value="">Sélectionner un type</option>
          <option value="Budget">Budget</option>
          <option value="Prière">Prière</option>
          <option value="Matériel">Matériel</option>
          <option value="Conseil spirituel">Conseil spirituel</option>
          <option value="Service">Service</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Détails de la demande *</label>
        <textarea name="details" rows={5} value={form.details} onChange={handleChange}
          className={inputClass} placeholder="Décrivez votre demande en détail" required />
      </div>
      <button type="submit" disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl transition shadow-lg flex items-center justify-center gap-2 font-medium disabled:opacity-60">
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
