"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Briefcase,
  Flag,
  Droplet,
  Users,
  Home,
} from "lucide-react";

type MemberRegistrationFormProps = {
  isEdit?: boolean;
  initialData?: any;
  onSuccess?: () => void;
};

// This variable ensures inputs adapt their background and text color to the device theme
const inputClass =
  "w-full rounded-xl p-3 border transition-colors " +
  "bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 " + // Light Mode
  "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500 " + // Dark Mode
  "focus:outline-none focus:ring-2 focus:ring-primary/40";

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
    "Conseil Presbytéral", "Groupe Musical", "Commission Accueil", "Commission Intercession",
    "Commission Cuisine", "Commission Multimédia", "Commission Témoignage", "Commission Compassion",
    "Commission des bâtiments", "École de Dimanche", "Bureau des sœurs FEEAM", "Bureau des Hommes",
    "Bureau de la jeunesse JEEAM", "Comité d'entraide internationale CEI", "Bibliothèque", "Aucun"
  ];

  const toggleCommission = (value: string) => {
    setForm(prev => ({
      ...prev,
      commissions: prev.commissions.includes(value)
        ? prev.commissions.filter(c => c !== value)
        : [...prev.commissions, value]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!isEdit && !form.consent) {
      setError("Vous devez accepter la politique de confidentialité pour continuer.");
      return;
    }
    if (!form.commissions.length) {
      setError("Veuillez sélectionner au moins une commission.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
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
    };

    const { error } = isEdit && initialData
      ? await supabase.from("member_registrations").update(payload).eq('id', initialData.id)
      : await supabase.from("member_registrations").insert(payload);

    if (error) {
      setError(error.code === "23505" ? "Un membre avec ce numéro de téléphone ou cet email existe déjà." : error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    if (onSuccess) onSuccess();
  };

  if (success) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-xl">
        <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
          {isEdit ? "Membre modifié" : "Inscription envoyée"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {isEdit ? "Les informations ont été mises à jour." : "Votre demande a bien été enregistrée."}
        </p>
      </div>
    );
  }

  return (
    // The main container adapts to dark mode
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Paroisse */}
        <div>
          <label className="font-bold text-gray-900 dark:text-gray-100">Paroisse *</label>
          <div className="mt-2 space-y-2">
            {["Rabat centre ville", "Rabat Annexe J5"].map(p => (
              <label key={p} className="flex items-center gap-2 text-gray-800 dark:text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="paroisse"
                  value={p}
                  checked={form.paroisse === p}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Nom & Prénom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="nom">Nom *</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="nom" name="nom" value={form.nom} required placeholder="Votre nom" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="prenom">Prénom *</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="prenom" name="prenom" value={form.prenom} required placeholder="Votre prénom" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Genre & Nationalité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100">Genre *</label>
            <div className="mt-2 flex gap-4">
              {["Femme", "Homme"].map(g => (
                <label key={g} className="flex items-center gap-2 text-gray-800 dark:text-gray-200 cursor-pointer">
                  <input type="radio" name="genre" value={g} checked={form.genre === g} onChange={handleChange} required className="dark:bg-gray-800 dark:border-gray-600" />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100">Nationalité *</label>
            <div className="relative mt-1">
              <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 pointer-events-none" />
              <select name="nationalite" value={form.nationalite} onChange={handleChange} required className={`${inputClass} pl-10 appearance-none`}>
                <option value="" className="dark:bg-gray-800">Sélectionnez</option>
                {countries.map(c => <option key={c} value={c} className="dark:bg-gray-800">{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Dates & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="date_naissance">Date de naissance *</label>
            <div className="relative mt-1">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="date_naissance" type="date" name="date_naissance" value={form.date_naissance} className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="telephone">Téléphone *</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="telephone" name="telephone" value={form.telephone} required placeholder="Numéro de téléphone" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Email & Profession */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="email">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="email" type="email" name="email" value={form.email} placeholder="votre@email.com" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="profession">Occupation professionnelle *</label>
            <div className="relative mt-1">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="profession" name="profession" value={form.profession} required placeholder="Profession / Études" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Baptism Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100">Baptisé(e) *</label>
            <div className="mt-2 flex gap-4">
              {["Oui", "Non"].map(b => (
                <label key={b} className="flex items-center gap-2 text-gray-800 dark:text-gray-200 cursor-pointer">
                  <input type="radio" name="baptise" value={b} checked={form.baptise === b} onChange={handleChange} required className="dark:bg-gray-800" />
                  {b}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="date_bapteme">Date ou année de baptême</label>
            <div className="relative mt-1">
              <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input id="date_bapteme" name="date_bapteme" value={form.date_bapteme} placeholder="Ex: 2015 ou 12/05/2015" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="adresse">Adresse / Quartier *</label>
          <div className="relative mt-1">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <input id="adresse" name="adresse" value={form.adresse} required placeholder="Votre quartier de résidence" className={`${inputClass} pl-10`} onChange={handleChange} />
          </div>
        </div>

        {/* Commissions Grid */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <label className="font-bold text-gray-900 dark:text-gray-100 block mb-3">Commissions *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {commissionsList.map(c => (
              <label key={c} className="flex items-center gap-2 text-gray-800 dark:text-gray-200 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form.commissions.includes(c)}
                  onChange={() => toggleCommission(c)}
                  className="rounded dark:bg-gray-700 dark:border-gray-600 text-primary"
                />
                <span className="text-sm">{c}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Consent/Legal */}
        {!isEdit && (
        <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <label className="flex items-start gap-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              required
              className="mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>
              J'ai lu et j'accepte la{" "}
              <Link href="/politique-de-confidentialite" target="_blank" className="text-primary font-bold underline">
                politique de confidentialité
              </Link>.
            </span>
          </label>
        </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? "Chargement..." : isEdit ? "Mettre à jour" : "Soumettre"}
        </button>
      </form>
    </div>
  );
}