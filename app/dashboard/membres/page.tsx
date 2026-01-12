"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  UserCheck,
  Activity
} from "lucide-react";

/* =========================
   Types aligned with registration
========================= */

type Member = {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string;
  paroisse: string;
  genre: "Femme" | "Homme";
  baptise: "Oui" | "Non";
  nationalite: string;
  commissions: string[];
  created_at: string;
};

/* =========================
   Mock data (replace with Supabase later)
========================= */

const members: Member[] = [
  {
    id: 1,
    nom: "Mansouri",
    prenom: "Sarah",
    email: "sarah@email.com",
    telephone: "+212600000001",
    paroisse: "Rabat centre ville",
    genre: "Femme",
    baptise: "Oui",
    nationalite: "Marocaine",
    commissions: ["Groupe Musical", "Commission Accueil"],
    created_at: "2026-01-05"
  },
  {
    id: 2,
    nom: "Benjelloun",
    prenom: "Karim",
    email: null,
    telephone: "+212600000002",
    paroisse: "Rabat Annexe J5",
    genre: "Homme",
    baptise: "Non",
    nationalite: "Camerounaise",
    commissions: ["Aucun"],
    created_at: "2026-01-09"
  }
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

/* =========================
   Derived stats
========================= */

const totalMembers = members.length;
const totalFemmes = members.filter(m => m.genre === "Femme").length;
const totalHommes = members.filter(m => m.genre === "Homme").length;
const totalBaptises = members.filter(m => m.baptise === "Oui").length;
const totalNationalites = new Set(
  members.map(m => m.nationalite)
).size;

/* =========================
   Helpers
========================= */

const getMemberStatus = (member: Member) => {
  const created = new Date(member.created_at);
  const now = new Date();
  const diffDays =
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays <= 30 ? "new" : "active";
};

const getStatusLabel = (status: string) =>
  status === "new" ? "Nouveau" : "Actif";

const getStatusColor = (status: string) =>
  status === "new"
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-green-100 text-green-700 border-green-200";

/* =========================
   Component
========================= */

export default function MembersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterParoisse, setFilterParoisse] = useState("all");
  const [filterBaptise, setFilterBaptise] = useState("all");
  const [filterCommission, setFilterCommission] = useState("all");

  const filteredMembers = members.filter(member => {
    const fullName = `${member.prenom} ${member.nom}`.toLowerCase();

    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.telephone.includes(searchQuery);

    const matchesParoisse =
      filterParoisse === "all" || member.paroisse === filterParoisse;

    const matchesBaptise =
      filterBaptise === "all" || member.baptise === filterBaptise;

    const matchesCommission =
      filterCommission === "all" ||
      member.commissions.includes(filterCommission);

    return (
      matchesSearch &&
      matchesParoisse &&
      matchesBaptise &&
      matchesCommission
    );
  });

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestion des Membres
          </h1>
          <p className="text-gray-600">
            Données issues des inscriptions
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border rounded-xl flex items-center gap-2">
            <Download size={18} />
            Exporter
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center gap-2">
            <UserPlus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total membres" value={totalMembers} icon={<Users />} />
        <StatCard label="Femmes" value={totalFemmes} icon={<UserCheck />} />
        <StatCard label="Hommes" value={totalHommes} icon={<UserCheck />} />
        <StatCard label="Baptisés" value={totalBaptises} icon={<Activity />} />
        <StatCard label="Nationalités" value={totalNationalites} icon={<MapPin />} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-wrap gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 border rounded-xl w-64"
          />
        </div>

        <select
          value={filterParoisse}
          onChange={e => setFilterParoisse(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="all">Toutes les paroisses</option>
          <option value="Rabat centre ville">Rabat centre ville</option>
          <option value="Rabat Annexe J5">Rabat Annexe J5</option>
        </select>

        <select
          value={filterBaptise}
          onChange={e => setFilterBaptise(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="all">Tous</option>
          <option value="Oui">Baptisés</option>
          <option value="Non">Non baptisés</option>
        </select>

        <select
          value={filterCommission}
          onChange={e => setFilterCommission(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="all">Toutes les commissions</option>
          {commissionsList.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => {
          const status = getMemberStatus(member);

          return (
            <div key={member.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">
                    {member.prenom} {member.nom}
                  </h3>
                  <span className={`inline-block px-3 py-1 text-xs rounded-full border ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>
                <MoreVertical size={18} />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    {member.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {member.telephone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {member.paroisse}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Inscrit le{" "}
                  {new Date(member.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Commissions: {member.commissions.join(", ")}
              </p>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-cyan-50 text-cyan-600 rounded-xl flex justify-center gap-2">
                  <Eye size={16} />
                  Voir
                </button>
                <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl flex justify-center gap-2">
                  <Edit size={16} />
                  Modifier
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Small stat card component
========================= */

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-cyan-600">{icon}</div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
