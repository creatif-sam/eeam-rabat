"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type MemberRegistrationFormProps = {
  isEdit?: boolean;
  initialData?: any;
  onSuccess?: () => void;
};

export default function MemberRegistrationForm({ isEdit, initialData, onSuccess }: MemberRegistrationFormProps) {
  const supabase = createClient();

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

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        paroisse: initialData.paroisse || "",
        nom: initialData.nom || "",
        prenom: initialData.prenom || "",
        genre: initialData.genre || "",
        nationalite: initialData.nationalite || "",
        date_naissance: initialData.date_naissance || "",
        telephone: initialData.telephone || "",
        email: initialData.email || "",
        profession: initialData.profession || "",
        baptise: initialData.baptise || "",
        date_bapteme: initialData.date_bapteme || "",
        adresse: initialData.adresse || "",
        commissions: initialData.commissions || [],
        consent: initialData.consent || false
      });
    }
  }, [isEdit, initialData]);

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
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (loading) return;

  if (!isEdit && !form.consent) {
    setError(
      "Vous devez accepter la politique de confidentialité pour continuer."
    );
    return;
  }

  if (!form.commissions.length) {
    setError("Veuillez sélectionner au moins une commission.");
    return;
  }

  setLoading(true);
  setError(null);

  const { error } = isEdit && initialData
    ? await supabase
        .from("member_registrations")
        .update({
          paroisse: form.paroisse,
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          genre: form.genre,
          nationalite: form.nationalite.trim(),
          date_naissance: form.date_naissance || null,
          telephone: form.telephone.trim(),
          email: form.email || null,
          profession: form.profession.trim(),
          baptise: form.baptise,
          date_bapteme: form.date_bapteme || null,
          adresse: form.adresse.trim(),
          commissions: form.commissions,
          consent: true // 🔥 FORCE TRUE — REQUIRED FOR RLS
        })
        .eq('id', initialData.id)
    : await supabase
        .from("member_registrations")
        .insert({
          paroisse: form.paroisse,
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          genre: form.genre,
          nationalite: form.nationalite.trim(),
          date_naissance: form.date_naissance || null,
          telephone: form.telephone.trim(),
          email: form.email || null,
          profession: form.profession.trim(),
          baptise: form.baptise,
          date_bapteme: form.date_bapteme || null,
          adresse: form.adresse.trim(),
          commissions: form.commissions,
          consent: true // 🔥 FORCE TRUE — REQUIRED FOR RLS
        });

 if (error) {
  if (error.code === "23505") {
    setError(
      "Un membre avec ce numéro de téléphone ou cet email existe déjà."
    );
    setLoading(false);
    return;
  }

  setError(
    error.message ||
      "Une erreur est survenue lors de l’envoi. Veuillez réessayer."
  );
  setLoading(false);
  return;
}


  setSuccess(true);
  setLoading(false);
  if (onSuccess) onSuccess();
};

  if (success) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-bold text-green-600 mb-2">
          {isEdit ? "Membre modifié" : "Inscription envoyée"}
        </h3>
        <p className="text-muted-foreground">
          {isEdit ? "Les informations ont été mises à jour." : "Votre demande a bien été enregistrée. L'équipe vous contactera si nécessaire."}
        </p>
      </div>
    );
  }

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
                checked={form.paroisse === p}
                onChange={handleChange}
                required
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <input name="nom" required placeholder="Nom *" className="w-full border rounded-xl p-3" onChange={handleChange} />
      <input name="prenom" required placeholder="Prénom *" className="w-full border rounded-xl p-3" onChange={handleChange} />

      <div>
        <label className="font-medium">Genre *</label>
        <div className="mt-2 space-y-2">
          {["Femme", "Homme"].map(g => (
            <label key={g} className="flex items-center gap-2">
              <input
                type="radio"
                name="genre"
                value={g}
                checked={form.genre === g}
                onChange={handleChange}
                required
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      <input name="nationalite" required placeholder="Nationalité *" className="w-full border rounded-xl p-3" onChange={handleChange} />
      <input type="date" name="date_naissance" className="w-full border rounded-xl p-3" onChange={handleChange} />
      <input name="telephone" required placeholder="Téléphone *" className="w-full border rounded-xl p-3" onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" className="w-full border rounded-xl p-3" onChange={handleChange} />
      <input name="profession" required placeholder="Occupation professionnelle *" className="w-full border rounded-xl p-3" onChange={handleChange} />

      <div>
        <label className="font-medium">Baptisé(e) *</label>
        <div className="mt-2 space-y-2">
          {["Oui", "Non"].map(b => (
            <label key={b} className="flex items-center gap-2">
              <input
                type="radio"
                name="baptise"
                value={b}
                checked={form.baptise === b}
                onChange={handleChange}
                required
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <input name="date_bapteme" placeholder="Date ou année de baptême" className="w-full border rounded-xl p-3" onChange={handleChange} />
      <input name="adresse" required placeholder="Adresse / Quartier *" className="w-full border rounded-xl p-3" onChange={handleChange} />

      <div>
        <label className="font-medium">Commissions *</label>
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

      {!isEdit && (
      <div className="border rounded-xl p-4 bg-muted">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            required
          />
          <span>
            J'ai lu et j'accepte la{" "}
            <Link href="/politique-de-confidentialite" target="_blank" className="text-primary underline hover:text-primary/80">
              politique de confidentialité
            </Link>.
          </span>
        </label>
      </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold disabled:opacity-60 hover:bg-primary/90 transition-colors"
      >
        {loading ? "Envoi en cours..." : isEdit ? "Modifier" : "Soumettre"}
      </button>
    </form>
  );
}
