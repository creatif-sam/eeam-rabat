"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Clock,
  Users,
  CheckCircle,
  Play,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Video,
  FileText
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import ModulesList from "@/components/formations/modules/ModulesList";
import CreateFormationModal from "@/components/formations/CreateFormationModal";
import EditFormationModal from "@/components/formations/EditFormationModal";

type Module = {
  id: string;
  titre: string;
  est_complete: boolean;
};

type Formation = {
  id: string;
  titre: string;
  categorie: string;
  description: string;
  duree: string;
  sessions_total: number;
  sessions_completees: number;
  participants_max: number;
  date_debut: string;
  date_fin: string | null;
  horaire: string;
  lieu: string;
  niveau: string;
  statut: "a_venir" | "en_cours" | "terminee";
  taux_reussite: number;
  couleur: string;
  en_ligne: boolean;
  formateur_nom: string;
  formateur_photo: string | null;
  modules_formation: Module[];
  inscriptions_formation: { count: number }[];
};

export default function FormationsTab() {
  const supabase = createClient();

  const [formations, setFormations] = useState<Formation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);

  const [stats, setStats] = useState({
    totalFormations: 0,
    activeFormations: 0,
    totalParticipants: 0,
    completedThisYear: 0,
    averageCompletion: 0
  });

  const fetchData = async () => {
    const { data } = await supabase
      .from("formations")
      .select(`
        *,
        modules_formation(*),
        inscriptions_formation(count)
      `);

    if (!data) return;

    setFormations(data as Formation[]);

    const year = new Date().getFullYear();
    const total = data.length;

    setStats({
      totalFormations: total,
      activeFormations: data.filter(f => f.statut === "en_cours").length,
      totalParticipants: data.reduce(
        (sum, f) => sum + (f.inscriptions_formation?.[0]?.count || 0),
        0
      ),
      completedThisYear: data.filter(
        f => f.statut === "terminee" &&
        f.date_fin &&
        new Date(f.date_fin).getFullYear() === year
      ).length,
      averageCompletion: Math.round(
        data.reduce((s, f) => s + f.taux_reussite, 0) / (total || 1)
      )
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = [
    { id: "all", label: "Toutes" },
    { id: "leadership", label: "Leadership" },
    { id: "discipulat", label: "Discipulat" },
    { id: "louange", label: "Louange" },
    { id: "evangelisation", label: "Évangélisation" },
    { id: "gestion", label: "Gestion" }
  ];

  const statutBadge = (statut: string) => {
    if (statut === "en_cours") return { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (statut === "a_venir") return { label: "À venir", color: "bg-purple-100 text-purple-700 border-purple-200" };
    if (statut === "terminee") return { label: "Terminée", color: "bg-green-100 text-green-700 border-green-200" };
    return { label: statut, color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const filtered = formations.filter(f => {
    const matchSearch =
      f.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formateur_nom.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = selectedCategory === "all" || f.categorie === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion des Formations
          </h1>
          <p className="text-gray-600">
            Formations et programmes de développement spirituel
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} />
          Nouvelle formation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Stat icon={<GraduationCap />} label="Total formations" value={stats.totalFormations} />
        <Stat icon={<Play />} label="Formations actives" value={stats.activeFormations} />
        <Stat icon={<Users />} label="Participants" value={stats.totalParticipants} />
        <Stat icon={<Award />} label="Certifiés cette année" value={stats.completedThisYear} />
        <Stat icon={<TrendingUp />} label="Taux moyen" value={`${stats.averageCompletion}%`} />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedCategory === cat.id
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher une formation"
            className="pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filtered.map(f => {
          const badge = statutBadge(f.statut);
          return (
            <div key={f.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`p-6 bg-gradient-to-r ${f.couleur}`}>
                <span className={`px-3 py-1 text-xs rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
                <h3 className="text-xl font-bold text-white mt-3">{f.titre}</h3>
                <p className="text-white/80 text-sm">{f.description}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {f.formateur_photo && (
                    <img
                      src={f.formateur_photo}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Formateur</p>
                    <p className="font-semibold">{f.formateur_nom}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Clock size={14} /> {f.duree}
                  </span>
                  <span className="flex items-center gap-2">
                    <BookOpen size={14} /> {f.sessions_total} sessions
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={14} /> {f.inscriptions_formation?.[0]?.count || 0}/{f.participants_max}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} /> {f.horaire}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFormation(f)}
                    className="flex-1 bg-cyan-50 text-cyan-600 py-2 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Voir détails
                  </button>
                  <button
                    onClick={() => setEditingFormation(f)}
                    className="bg-gray-50 px-4 rounded-xl"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selectedFormation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

            <div className={`bg-gradient-to-r ${selectedFormation.couleur} p-6 text-white`}>
              <div className="flex justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{selectedFormation.titre}</h2>
                  <p className="text-white/80">{selectedFormation.description}</p>
                </div>
                <button
                  onClick={() => setSelectedFormation(null)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Horaire</p>
                    <p className="font-medium">{selectedFormation.horaire}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-xl">
                  {selectedFormation.en_ligne ? (
                    <Video size={20} className="text-purple-600" />
                  ) : (
                    <FileText size={20} className="text-purple-600" />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Lieu</p>
                    <p className="font-medium">{selectedFormation.lieu}</p>
                  </div>
                </div>
              </div>

              <ModulesList formationId={selectedFormation.id} />

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setEditingFormation(selectedFormation)}
                  className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl"
                >
                  Modifier la formation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateFormationModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchData}
      />

      <EditFormationModal
        formation={editingFormation}
        onClose={() => setEditingFormation(null)}
        onUpdated={fetchData}
      />
    </div>
  );
}

function Stat({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
