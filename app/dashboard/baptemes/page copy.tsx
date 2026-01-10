"use client";

import { useEffect, useState } from "react";
import {
  Droplet,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Eye
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
  documents: string[];
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

  useEffect(() => {
    fetchBaptisms();
  }, []);

  const fetchBaptisms = async () => {
    const { data } = await supabase
      .from("baptisms")
      .select("*")
      .order("created_at", { ascending: false });

    setBaptisms((data as Baptism[]) || []);
    setLoading(false);
  };

  const approuver = async (id: string) => {
    await supabase
      .from("baptisms")
      .update({ statut: "approuve" })
      .eq("id", id);

    fetchBaptisms();
    setSelected(null);
  };

  const rejeter = async (id: string) => {
    await supabase
      .from("baptisms")
      .update({ statut: "rejete" })
      .eq("id", id);

    fetchBaptisms();
    setSelected(null);
  };

  const filtered = baptisms.filter(b =>
    b.full_name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

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

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Baptêmes</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          <Plus size={18} />
          Nouvelle demande
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          placeholder="Rechercher par nom ou email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-xl w-72"
        />
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(b => (
          <div
            key={b.id}
            onClick={() => setSelected(b)}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{b.full_name}</h3>
                <p className="text-sm text-gray-500">{b.email}</p>
              </div>
              <span className="text-sm font-semibold">
                {statutLabel(b.statut)}
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Demande le{" "}
              {new Date(b.date_demande).toLocaleDateString("fr-FR")}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{selected.full_name}</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="space-y-2 text-gray-700">
              <p className="flex items-center gap-2">
                <Mail size={16} /> {selected.email}
              </p>
              {selected.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={16} /> {selected.phone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <User size={16} /> Créé par {selected.creator_email}
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={16} /> Statut{" "}
                <strong>{statutLabel(selected.statut)}</strong>
              </p>
            </div>

            {selected.temoignage && (
              <div className="bg-gray-50 p-4 rounded-xl italic">
                "{selected.temoignage}"
              </div>
            )}

            {selected.statut === "en_attente" && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => approuver(selected.id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Approuver
                </button>
                <button
                  onClick={() => rejeter(selected.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
