"use client";

import { useEffect, useState } from "react";
import EditBaptismModal from "@/components/baptemes/EditBaptismModal";

import {
  Droplet,
  Plus,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Edit
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Baptism = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  address: string | null;
  statut: "en_attente" | "en_preparation" | "approuve" | "baptise" | "rejete";
  date_demande: string;
  date_bapteme: string | null;
  conseiller: string | null;
  temoignage: string | null;
  preparation_completee: number;
  preparation_totale: number;
  creator_id: string;
  creator_email: string;
};

export default function BaptemesTab() {
  const supabase = createClient();

  const [baptisms, setBaptisms] = useState<Baptism[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Baptism | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Baptism | null>(null);

  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    temoignage: ""
  });

  useEffect(() => {
    fetchBaptisms();
  }, []);

  const fetchBaptisms = async () => {
    const { data } = await supabase.from("baptisms").select("*");
    setBaptisms((data as Baptism[]) || []);
    setLoading(false);
  };

  const year = new Date().getFullYear();

  const stats = {
    total: baptisms.length,
    thisYear: baptisms.filter(
      b => new Date(b.date_demande).getFullYear() === year
    ).length,
    upcoming: baptisms.filter(b => b.statut === "approuve").length,
    pending: baptisms.filter(b => b.statut === "en_attente").length,
    nextCeremony: baptisms
      .filter(b => b.date_bapteme)
      .sort(
        (a, b) =>
          new Date(a.date_bapteme!).getTime() -
          new Date(b.date_bapteme!).getTime()
      )[0]?.date_bapteme
  };

  const statutLabel = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return "En attente";
      case "en_preparation":
        return "En préparation";
      case "approuve":
        return "Approuvé";
      case "baptise":
        return "Baptisé";
      case "rejete":
        return "Rejeté";
      default:
        return statut;
    }
  };

  const filtered = baptisms.filter(b =>
    b.full_name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  const approuver = async (id: string) => {
    await supabase.from("baptisms").update({ statut: "approuve" }).eq("id", id);
    fetchBaptisms();
    setSelected(null);
  };

  const rejeter = async (id: string) => {
    await supabase.from("baptisms").update({ statut: "rejete" }).eq("id", id);
    fetchBaptisms();
    setSelected(null);
  };

  const submitCreate = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !user.email) return;

    await supabase.from("baptisms").insert({
      full_name: createForm.full_name,
      email: createForm.email,
      phone: createForm.phone || null,
      temoignage: createForm.temoignage || null,
      creator_id: user.id,
      creator_email: user.email
    });

    setShowCreate(false);
    setCreateForm({ full_name: "", email: "", phone: "", temoignage: "" });
    fetchBaptisms();
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Gestion des Baptêmes
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Suivi des candidats et cérémonies de baptême
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 md:px-4 md:py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 text-sm md:text-base"
        >
          <Plus size={18} />
          Nouvelle demande
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard icon={<Droplet />} label="Total baptêmes" value={stats.total} color="blue" />
        <StatCard icon={<CheckCircle />} label="Cette année" value={stats.thisYear} color="green" />
        <StatCard icon={<Calendar />} label="À venir" value={stats.upcoming} color="cyan" />
        <StatCard icon={<Clock />} label="En attente" value={stats.pending} color="amber" />
        <StatCard
          icon={<Users />}
          label="Prochaine cérémonie"
          value={
            stats.nextCeremony
              ? new Date(stats.nextCeremony).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short"
                })
              : "-"
          }
          color="purple"
        />
      </div>

      {/* Search */}
      <input
        placeholder="Rechercher un candidat"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="pl-4 pr-4 py-2 border border-gray-200 rounded-xl w-full md:w-64"
      />

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filtered.map(b => (
          <div
            key={b.id}
            onClick={() => setSelected(b)}
            className="bg-white p-4 md:p-6 rounded-xl shadow hover:shadow-md cursor-pointer relative"
          >
            <button
              onClick={e => {
                e.stopPropagation();
                setEditing(b);
              }}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Edit size={16} />
            </button>

            <h3 className="text-lg font-bold text-gray-800">{b.full_name}</h3>
            <p className="text-sm text-gray-500">{b.email}</p>
            <p className="mt-2 font-medium">{statutLabel(b.statut)}</p>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl md:text-2xl font-bold">{selected.full_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm md:text-base">
                <Mail size={16} /> {selected.email}
              </p>
              {selected.phone && (
                <p className="flex items-center gap-2 text-sm md:text-base">
                  <Phone size={16} /> {selected.phone}
                </p>
              )}
              <p className="flex items-center gap-2 text-sm md:text-base">
                <User size={16} /> Créé par {selected.creator_email}
              </p>
            </div>

            {selected.temoignage && (
              <div className="bg-gray-50 p-3 md:p-4 rounded-xl italic text-sm md:text-base">
                "{selected.temoignage}"
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => {
                  setSelected(null);
                  setEditing(selected);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base font-medium"
              >
                <Edit size={16} />
                Modifier
              </button>

              {selected.statut === "en_attente" && (
                <>
                  <button
                    onClick={() => approuver(selected.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                  >
                    <CheckCircle size={16} />
                    Approuver
                  </button>
                  <button
                    onClick={() => rejeter(selected.id)}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl md:text-2xl font-bold">Nouvelle demande</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Nom complet"
                value={createForm.full_name}
                onChange={e =>
                  setCreateForm({ ...createForm, full_name: e.target.value })
                }
                className="w-full border p-3 rounded-xl text-sm md:text-base"
              />

              <input
                placeholder="Email"
                value={createForm.email}
                onChange={e =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="w-full border p-3 rounded-xl text-sm md:text-base"
              />

              <input
                placeholder="Téléphone"
                value={createForm.phone}
                onChange={e =>
                  setCreateForm({ ...createForm, phone: e.target.value })
                }
                className="w-full border p-3 rounded-xl text-sm md:text-base"
              />

              <textarea
                placeholder="Témoignage"
                value={createForm.temoignage}
                onChange={e =>
                  setCreateForm({ ...createForm, temoignage: e.target.value })
                }
                className="w-full border p-3 rounded-xl text-sm md:text-base"
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm md:text-base"
              >
                Annuler
              </button>

              <button
                onClick={submitCreate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 font-semibold shadow-lg shadow-cyan-500/30 text-sm md:text-base"
              >
                Créer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <EditBaptismModal
          baptism={editing}
          onClose={() => setEditing(null)}
          onUpdated={fetchBaptisms}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  const colors: any = {
    blue: "from-blue-50 to-indigo-50 bg-blue-500 border-blue-100",
    green: "from-green-50 to-emerald-50 bg-green-500 border-green-100",
    cyan: "from-cyan-50 to-teal-50 bg-cyan-500 border-cyan-100",
    amber: "from-amber-50 to-orange-50 bg-amber-500 border-amber-100",
    purple: "from-purple-50 to-violet-50 bg-purple-500 border-purple-100"
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-4 md:p-6 border shadow-sm`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 ${colors[color].split(" ")[2]} rounded-xl flex items-center justify-center mb-3 md:mb-4 text-white`}>
        {icon}
      </div>
      <p className="text-gray-600 text-xs md:text-sm mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
