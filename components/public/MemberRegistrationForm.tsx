"use client";

import { useState } from "react";
import Link from "next/link";

export default function MemberRegistrationForm() {
  const [form, setForm] = useState({
    paroisse: "",
    nom: "",
    prenom: "",
    genre: "",
    nationalite: "",
    date_naissance: "",
    telephone: "",
    email: "",
    profession: "",
    baptise: "",
    date_bapteme: "",
    adresse: "",
    commissions: [] as string[],
    consent: false
  });

  const [error, setError] = useState("");

  const commissionsList = [
    "Conseil Presbytéral",
    "Groupe Musical",
    "Commission Accueil",
    "Commission Intercession",
    "Commission Cuisine",
    "Commission Multimédia",
    "Commission Témoignage",
    "Commission Compassion",
    "Commission des bâtiments",
    "École de Dimanche",
    "Bureau des sœurs FEEAM",
    "Bureau des Hommes",
    "Bureau de la jeunesse JEEAM",
    "Comité d'entraide internationale CEI",
    "Bibliothèque",
    "Aucun"
  ];

  const toggleCommission = (value: string) => {
    setForm(prev => ({
      ...prev,
      commissions: prev.commissions.includes(value)
        ? prev.commissions.filter(c => c !== value)
        : [...prev.commissions, value]
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.consent) {
      setError(
        "Vous devez accepter la politique de confidentialité pour continuer."
      );
      return;
    }

    setError("");
    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paroisse */}
      <div>
        <label className="font-medium">Paroisse *</label>
        <div className="mt-2 space-y-2">
          {["Rabat centre ville", "Rabat Annexe J5"].map(p => (
            <label key={p} className="flex items-center gap-2">
              <input
                type="radio"
                name="paroisse"
                value={p}
                required
                onChange={handleChange}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <input
        name="nom"
        placeholder="Nom *"
        required
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      <input
        name="prenom"
        placeholder="Prénom *"
        required
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      {/* Genre */}
      <div>
        <label className="font-medium">Genre *</label>
        <div className="mt-2 space-y-2">
          {["Femme", "Homme"].map(g => (
            <label key={g} className="flex items-center gap-2">
              <input
                type="radio"
                name="genre"
                value={g}
                required
                onChange={handleChange}
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      <input
        name="nationalite"
        placeholder="Nationalité *"
        required
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      <input
        type="date"
        name="date_naissance"
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      <input
        name="telephone"
        placeholder="Téléphone *"
        required
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      <input
        name="profession"
        placeholder="Occupation profession *"
        required
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      {/* Baptisé */}
      <div>
        <label className="font-medium">Baptisé e *</label>
        <div className="mt-2 space-y-2">
          {["Oui", "Non"].map(b => (
            <label key={b} className="flex items-center gap-2">
              <input
                type="radio"
                name="baptise"
                value={b}
                required
                onChange={handleChange}
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <input
        name="date_bapteme"
        placeholder="Date ou année de baptême"
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      <input
        name="adresse"
        placeholder="Adresse Quartier *"
        required
        className="w-full border rounded-xl p-3"
        onChange={handleChange}
      />

      {/* Commissions */}
      <div>
        <label className="font-medium">Commission s *</label>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commissionsList.map(c => (
            <label key={c} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.commissions.includes(c)}
                onChange={() => toggleCommission(c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Consent */}
      <div className="border rounded-xl p-4 bg-slate-50">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            className="mt-1"
            required
          />
          <span className="text-gray-700">
            J’ai lu et j’accepte la{" "}
            <Link
              href="/politique-de-confidentialite"
              target="_blank"
              className="text-cyan-600 underline"
            >
              politique de confidentialité
            </Link>{" "}
            et j’autorise l’église à traiter mes données
            dans le cadre de ses activités.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold"
      >
        Soumettre
      </button>
    </form>
  );
}
