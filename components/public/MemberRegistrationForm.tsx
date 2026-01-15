"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Briefcase,
  Flag,
  Droplet,
  Home,
} from "lucide-react";

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

  const countries = [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda",
    "Arabie saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn",
    "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie",
    "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge",
    "Cameroun", "Canada", "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo", "Corée du Nord",
    "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique",
    "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis",
    "Éthiopie", "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade",
    "Guatemala", "Guinée", "Guinée équatoriale", "Guinée-Bissau", "Guyana", "Haïti", "Honduras", "Hongrie",
    "Îles Cook", "Îles Marshall", "Îles Salomon", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande",
    "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati",
    "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg",
    "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Maurice",
    "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie",
    "Nauru", "Népal", "Nicaragua", "Niger", "Nigéria", "Niue", "Norvège", "Nouvelle-Zélande", "Oman", "Ouganda",
    "Ouzbékistan", "Pakistan", "Palaos", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou",
    "Philippines", "Pologne", "Portugal", "Qatar", "République centrafricaine", "République démocratique du Congo",
    "République dominicaine", "République tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Christophe-et-Niévès",
    "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salvador", "Samoa", "Sao Tomé-et-Principe",
    "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan",
    "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie", "Tadjikistan", "Tanzanie", "Tchad",
    "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie",
    "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Viêt Nam", "Yémen", "Zambie", "Zimbabwe"
  ];

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
          consent: true
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
          consent: true
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
      "Une erreur est survenue lors de l'envoi. Veuillez réessayer."
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
        <p className="text-sm">
          {isEdit ? "Les informations ont été mises à jour." : "Votre demande a bien été enregistrée. L'équipe vous contactera si nécessaire."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paroisse */}
      <div>
        <label className="block text-sm font-medium">Paroisse *</label>
        <div className="mt-2 space-y-2">
          {["Rabat centre ville", "Rabat Annexe J5"].map(p => (
            <label key={p} className="flex items-center gap-2 text-sm">
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

      <div>
        <label className="block text-sm font-medium" htmlFor="nom">Nom *</label>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="nom" 
            name="nom" 
            value={form.nom}
            required 
            placeholder="Nom *" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="prenom">Prénom *</label>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="prenom" 
            name="prenom" 
            value={form.prenom}
            required 
            placeholder="Prénom *" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Genre *</label>
        <div className="mt-2 space-y-2">
          {["Femme", "Homme"].map(g => (
            <label key={g} className="flex items-center gap-2 text-sm">
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

      <div>
        <label className="block text-sm font-medium">Nationalité *</label>
        <div className="relative mt-2">
          <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <select
            name="nationalite"
            value={form.nationalite}
            onChange={handleChange}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Sélectionnez votre nationalité</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="date_naissance">Date de naissance *</label>
        <div className="relative mt-1">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="date_naissance" 
            type="date" 
            name="date_naissance" 
            value={form.date_naissance}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="telephone">Téléphone *</label>
        <div className="relative mt-1">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="telephone" 
            name="telephone" 
            value={form.telephone}
            required 
            placeholder="Téléphone *" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="email">Email</label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="email" 
            type="email" 
            name="email" 
            value={form.email}
            placeholder="Email" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="profession">Occupation professionnelle *</label>
        <div className="relative mt-1">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="profession" 
            name="profession" 
            value={form.profession}
            required 
            placeholder="Occupation professionnelle *" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Baptisé(e) *</label>
        <div className="mt-2 space-y-2">
          {["Oui", "Non"].map(b => (
            <label key={b} className="flex items-center gap-2 text-sm">
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

      <div>
        <label className="block text-sm font-medium" htmlFor="date_bapteme">Date ou année de baptême</label>
        <div className="relative mt-1">
          <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="date_bapteme" 
            name="date_bapteme" 
            value={form.date_bapteme}
            placeholder="Date ou année de baptême" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="adresse">Adresse / Quartier *</label>
        <div className="relative mt-1">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            id="adresse" 
            name="adresse" 
            value={form.adresse}
            required 
            placeholder="Adresse / Quartier *" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Commissions *</label>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commissionsList.map(c => (
            <label key={c} className="flex items-center gap-2 text-sm">
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
      <div className="border rounded-xl p-4">
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
            <Link href="/politique-de-confidentialite" target="_blank" className="underline underline-offset-4">
              politique de confidentialité
            </Link>.
          </span>
        </label>
      </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

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