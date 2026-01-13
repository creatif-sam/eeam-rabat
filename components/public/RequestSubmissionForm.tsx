"use client";

import { useState } from "react";
import { Save, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ACCESS_PASSWORD = "EEAM2026";

export default function RequestSubmissionForm() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    request_type: "",
    details: ""
  });

  const handleUnlock = () => {
    if (password === ACCESS_PASSWORD) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
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
    setError("");

    const { error } = await supabase
      .from("commission_requests")
      .insert(form);

    setLoading(false);

    if (error) {
      setError(
        "Une erreur est survenue. Veuillez informer un membre du CP."
      );
      return;
    }

    setSuccess(true);
    setForm({
      full_name: "",
      email: "",
      request_type: "",
      details: ""
    });
  };

  /* Password gate */
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Lock className="text-white" size={26} />
        </div>

        <h2 className="text-xl font-bold text-gray-800">
          Accès sécurisé
        </h2>

        <p className="text-sm text-gray-600 text-center max-w-sm">
          La soumission des demandes de commission est réservée
          aux responsables autorisés.
        </p>

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleUnlock}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl shadow font-medium"
        >
          Déverrouiller
        </button>
      </div>
    );
  }

  /* Success */
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h3 className="text-lg font-semibold text-green-800">
          Demande envoyée
        </h3>
        <p className="text-sm text-green-700">
          Votre demande a bien été transmise.
          Vous serez contacté si un complément est nécessaire.
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

  /* Actual form */
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <input
        name="full_name"
        value={form.full_name}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        placeholder="Nom complet"
        required
      />

      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        placeholder="Email"
        required
      />

      <select
        name="request_type"
        value={form.request_type}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        required
      >
        <option value="">Type de demande</option>
        <option value="Budget">Budget</option>
        <option value="Prière">Prière</option>
        <option value="Matériel">Matériel</option>
        <option value="Conseil spirituel">Conseil spirituel</option>
        <option value="Service">Service</option>
        <option value="Autre">Autre</option>
      </select>

      <textarea
        name="details"
        rows={5}
        value={form.details}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        placeholder="Détails de la demande"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl transition shadow-lg flex items-center justify-center gap-2 font-medium"
      >
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
