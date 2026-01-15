"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        [name]: e.target.checked
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
      setError("Vous devez accepter la politique de confidentialité pour continuer.");
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
        setError("Un membre avec ce numéro de téléphone ou cet email existe déjà.");
        setLoading(false);
        return;
      }

      setError(error.message || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
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
        <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
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
      <div className="grid gap-2">
        <Label>Paroisse *</Label>
        <div className="space-y-2">
          {["Rabat centre ville", "Rabat Annexe J5"].map(p => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paroisse"
                value={p}
                checked={form.paroisse === p}
                onChange={handleChange}
                required
                className="h-4 w-4"
              />
              <span className="text-sm">{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Nom */}
      <div className="grid gap-2">
        <Label htmlFor="nom">Nom *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="nom"
            name="nom"
            value={form.nom}
            required
            placeholder="Nom *"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Prénom */}
      <div className="grid gap-2">
        <Label htmlFor="prenom">Prénom *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="prenom"
            name="prenom"
            value={form.prenom}
            required
            placeholder="Prénom *"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Genre */}
      <div className="grid gap-2">
        <Label>Genre *</Label>
        <div className="space-y-2">
          {["Femme", "Homme"].map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="genre"
                value={g}
                checked={form.genre === g}
                onChange={handleChange}
                required
                className="h-4 w-4"
              />
              <span className="text-sm">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Nationalité */}
      <div className="grid gap-2">
        <Label htmlFor="nationalite">Nationalité *</Label>
        <div className="relative">
          <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select
            value={form.nationalite}
            onValueChange={(value) => setForm(prev => ({ ...prev, nationalite: value }))}
            required
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Sélectionnez votre nationalité" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date de naissance */}
      <div className="grid gap-2">
        <Label htmlFor="date_naissance">Date de naissance *</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="date_naissance"
            type="date"
            name="date_naissance"
            value={form.date_naissance}
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Téléphone */}
      <div className="grid gap-2">
        <Label htmlFor="telephone">Téléphone *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="telephone"
            name="telephone"
            value={form.telephone}
            required
            placeholder="Téléphone *"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Email */}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="email"
            type="email"
            name="email"
            value={form.email}
            placeholder="Email"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Profession */}
      <div className="grid gap-2">
        <Label htmlFor="profession">Occupation professionnelle *</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="profession"
            name="profession"
            value={form.profession}
            required
            placeholder="Occupation professionnelle *"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Baptisé */}
      <div className="grid gap-2">
        <Label>Baptisé(e) *</Label>
        <div className="space-y-2">
          {["Oui", "Non"].map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="baptise"
                value={b}
                checked={form.baptise === b}
                onChange={handleChange}
                required
                className="h-4 w-4"
              />
              <span className="text-sm">{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date de baptême */}
      <div className="grid gap-2">
        <Label htmlFor="date_bapteme">Date ou année de baptême</Label>
        <div className="relative">
          <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="date_bapteme"
            name="date_bapteme"
            value={form.date_bapteme}
            placeholder="Date ou année de baptême"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Adresse */}
      <div className="grid gap-2">
        <Label htmlFor="adresse">Adresse / Quartier *</Label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="adresse"
            name="adresse"
            value={form.adresse}
            required
            placeholder="Adresse / Quartier *"
            className="pl-10"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Commissions */}
      <div className="grid gap-2">
        <Label>Commissions *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commissionsList.map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.commissions.includes(c)}
                onChange={() => toggleCommission(c)}
                className="h-4 w-4"
              />
              <span className="text-sm">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Consent */}
      {!isEdit && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              required
              className="h-4 w-4 mt-0.5"
            />
            <span>
              J'ai lu et j'accepte la{" "}
              <Link
                href="/politique-de-confidentialite"
                target="_blank"
                className="text-primary underline hover:text-primary/80"
              >
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Envoi en cours..." : isEdit ? "Modifier" : "Soumettre"}
      </Button>
    </form>
  );
}