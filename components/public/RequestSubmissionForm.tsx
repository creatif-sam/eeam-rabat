"use client";

import { useState } from "react";
import { Save, Lock } from "lucide-react";

const ACCESS_PASSWORD = "EEAM2026";

export default function RequestSubmissionForm() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = () => {
    if (password === ACCESS_PASSWORD) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
    }
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
          Veuillez saisir le mot de passe pour continuer.
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

  /* Actual form */
  return (
    <form className="space-y-4">
      <input
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        placeholder="Nom complet"
        required
      />

      <input
        type="email"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        placeholder="Email"
        required
      />

      <select
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        required
      >
        <option value="">Type de demande</option>
        <option value="prayer">Prière</option>
        <option value="budget">Budget</option>
        <option value="counseling">Conseil spirituel</option>
        <option value="service">Service</option>
        <option value="other">Autre</option>
      </select>

      <textarea
        rows={5}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        placeholder="Détails de la demande"
        required
      />

      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg flex items-center justify-center gap-2 font-medium"
      >
        <Save size={18} />
        Envoyer la demande
      </button>
    </form>
  );
}
