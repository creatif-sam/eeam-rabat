"use client";

import { useState } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VolunteerForm() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    const { error } = await supabase
      .from("volunteer_requests")
      .insert(form);

    setLoading(false);

    if (error) {
      setError(
        "Une erreur est survenue. Veuillez informer un responsable."
      );
      return;
    }

    setSuccess(true);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      ministry: "",
      skills: "",
      availability: []
    });
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h3 className="font-semibold text-green-800">
          Candidature envoyée
        </h3>
        <p className="text-sm text-green-700">
          Merci pour votre disponibilité. Nous vous contacterons bientôt.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
        >
          Envoyer une autre candidature
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="first_name"
          placeholder="Prénom"
          required
          value={form.first_name}
          onChange={handleChange}
          className="border rounded-md px-4 py-2"
        />
        <input
          name="last_name"
          placeholder="Nom"
          required
          value={form.last_name}
          onChange={handleChange}
          className="border rounded-md px-4 py-2"
        />
      </div>

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border rounded-md px-4 py-2 w-full"
      />

      <input
        name="phone"
        placeholder="Téléphone"
        required
        value={form.phone}
        onChange={handleChange}
        className="border rounded-md px-4 py-2 w-full"
      />

      <select
        name="ministry"
        required
        value={form.ministry}
        onChange={handleChange}
        className="border rounded-md px-4 py-2 w-full"
      >
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

      <textarea
        name="skills"
        rows={3}
        placeholder="Compétences et talents"
        value={form.skills}
        onChange={handleChange}
        className="border rounded-md px-4 py-2 w-full"
      />

      <div className="space-y-2">
        {["Dimanche", "Semaine", "Événements"].map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.availability.includes(opt)}
              onChange={() => toggleAvailability(opt)}
            />
            {opt}
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 bg-cyan-600 text-white py-3 rounded-md"
      >
        <Save size={18} />
        {loading ? "Envoi en cours..." : "Soumettre ma candidature"}
      </button>
    </form>
  );
}
