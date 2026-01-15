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
  Loader2,
} from "lucide-react";

type MemberRegistrationFormProps = {
  isEdit?: boolean;
  initialData?: any;
  onSuccess?: () => void;
};

const inputClass =
  "w-full rounded-xl p-3 border transition-all " +
  "bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 " + 
  "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500 " + 
  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

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

  // FIX: Updated type to include HTMLTextAreaElement
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!isEdit && !form.consent) {
      setError("Veuillez accepter la politique de confidentialité.");
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
      setError(error.code === "23505" ? "Ce numéro de téléphone est déjà utilisé." : error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    if (onSuccess) onSuccess();
  };

  if (success) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 text-3xl">✓</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isEdit ? "Modifié" : "Enregistré"}</h3>
        <p className="text-gray-600 dark:text-gray-400">Opération réussie.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-10 bg-white dark:bg-gray-900 rounded-3xl transition-all duration-300">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        
        {/* Paroisse */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <label className="font-bold text-gray-900 dark:text-gray-100 block mb-4">Paroisse *</label>
          <div className="flex flex-col sm:flex-row gap-4">
            {["Rabat centre ville", "Rabat Annexe J5"].map(p => (
              <label key={p} className="flex flex-1 items-center gap-3 p-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-primary cursor-pointer transition-all">
                <input type="radio" name="paroisse" value={p} checked={form.paroisse === p} onChange={handleChange} required className="w-5 h-5 text-primary" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">{p}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Nom *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input name="nom" value={form.nom} required placeholder="Nom" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Prénom *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input name="prenom" value={form.prenom} required placeholder="Prénom" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Genre & Nationalité */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Genre *</label>
            <select name="genre" value={form.genre} onChange={handleChange} required className={inputClass}>
                <option value="">Choisir</option>
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Nationalité *</label>
            <div className="relative">
              <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <select name="nationalite" value={form.nationalite} onChange={handleChange} required className={`${inputClass} pl-10 appearance-none`}>
                <option value="">Sélectionnez un pays</option>
                {countries.map(c => <option key={c} value={c} className="dark:bg-gray-800">{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Date de Naissance *</label>
            <input type="date" name="date_naissance" value={form.date_naissance} className={inputClass} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Téléphone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input name="telephone" value={form.telephone} required placeholder="+212 ..." className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Email</label>
            <input type="email" name="email" value={form.email} placeholder="email@domaine.com" className={inputClass} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Profession *</label>
            <input name="profession" value={form.profession} required placeholder="Votre métier" className={inputClass} onChange={handleChange} />
          </div>
        </div>

        {/* Baptême */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Baptisé(e) ? *</label>
            <div className="flex gap-4">
              {["Oui", "Non"].map(b => (
                <label key={b} className="flex items-center gap-2 cursor-pointer dark:text-gray-200">
                  <input type="radio" name="baptise" value={b} checked={form.baptise === b} onChange={handleChange} required className="w-4 h-4 text-primary" />
                  {b}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold dark:text-gray-300">Année de Baptême</label>
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input name="date_bapteme" value={form.date_bapteme} placeholder="Ex: 2018" className={`${inputClass} pl-10`} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Adresse - THE ERROR SOURCE FIXED */}
        <div className="space-y-2">
          <label className="text-sm font-bold dark:text-gray-300">Adresse / Quartier *</label>
          <div className="relative">
            <Home className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <textarea 
                name="adresse" 
                value={form.adresse} 
                required 
                rows={2}
                placeholder="Votre adresse à Rabat" 
                className={`${inputClass} pl-10 resize-none`} 
                onChange={handleChange} 
            />
          </div>
        </div>

        {/* Commissions */}
        <div className="space-y-4">
          <label className="font-bold dark:text-gray-100 block">Commissions *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {commissionsList.map(c => (
              <label key={c} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-all">
                <input type="checkbox" checked={form.commissions.includes(c)} onChange={() => toggleCommission(c)} className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium dark:text-gray-300">{c}</span>
              </label>
            ))}
          </div>
        </div>

        {!isEdit && (
        <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
          <label className="flex items-start gap-3 text-sm dark:text-gray-300 cursor-pointer">
            <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} required className="mt-1 w-4 h-4 text-primary" />
            <span>J'accepte la politique de confidentialité.</span>
          </label>
        </div>
        )}

        {error && <p className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center">{error}</p>}

        <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-[0.98] ${loading ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed" : "bg-primary text-white shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"}`}
        >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isEdit ? "Modifier" : "S'inscrire")}
        </button>
      </form>
    </div>
  );
}