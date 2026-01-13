"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Activity,
  Download,
  Eye
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";
import MemberRegistrationForm from "@/components/public/MemberRegistrationForm";

/* ================= TYPES ================= */

type Member = {
  id: string;
  paroisse: string;
  nom: string;
  prenom: string;
  genre: "Homme" | "Femme";
  nationalite: string;
  telephone: string;
  email: string | null;
  baptise: "Oui" | "Non";
  commissions: string[];
  date_naissance?: string | null;
  date_bapteme?: string | null;
  adresse: string;
  profession: string;
  created_at: string;
};

/* ================= COMPONENT ================= */

export default function MembersTab() {
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState<"all" | "Homme" | "Femme">("all");
  const [filterBaptise, setFilterBaptise] = useState<"all" | "Oui" | "Non">("all");
  const [filterParoisse, setFilterParoisse] = useState("all");
  const [filterCommission, setFilterCommission] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ================= FETCH ================= */

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("member_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  /* ================= STATS ================= */

  const totalMembers = members.length;
  const totalMen = members.filter(m => m.genre === "Homme").length;
  const totalWomen = members.filter(m => m.genre === "Femme").length;
  const totalBaptised = members.filter(m => m.baptise === "Oui").length;
  const nationalities = new Set(members.map(m => m.nationalite)).size;

  /* ================= FILTER OPTIONS ================= */

  const paroisses = Array.from(new Set(members.map(m => m.paroisse)));
  const commissions = Array.from(
    new Set(members.flatMap(m => m.commissions ?? []))
  );

  /* ================= FILTER LOGIC ================= */

  const filteredMembers = members
    .filter(m => {
      const matchesSearch =
        `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        m.telephone.includes(search) ||
        (m.email ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesGenre = filterGenre === "all" || m.genre === filterGenre;
      const matchesBaptise = filterBaptise === "all" || m.baptise === filterBaptise;
      const matchesParoisse = filterParoisse === "all" || m.paroisse === filterParoisse;
      const matchesCommission =
        filterCommission === "all" ||
        (m.commissions ?? []).includes(filterCommission);

      return (
        matchesSearch &&
        matchesGenre &&
        matchesBaptise &&
        matchesParoisse &&
        matchesCommission
      );
    })
    .sort((a, b) => {
      const prenomCompare = a.prenom.localeCompare(b.prenom, "fr", {
        sensitivity: "base"
      });
      if (prenomCompare !== 0) return prenomCompare;
      return a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" });
    });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= EXPORT ================= */

  const exportCSV = () => {
    const headers = [
      "Nom",
      "Prénom",
      "Paroisse",
      "Genre",
      "Nationalité",
      "Téléphone",
      "Email",
      "Baptisé",
      "Commissions"
    ];

    const rows = filteredMembers.map(m => [
      m.nom,
      m.prenom,
      m.paroisse,
      m.genre,
      m.nationalite,
      m.telephone,
      m.email ?? "",
      m.baptise,
      (m.commissions ?? []).join(", ")
    ]);

    const csv =
      headers.join(";") +
      "\n" +
      rows.map(r => r.map(v => `"${v}"`).join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "membres-eeam.csv";
    link.click();
  };

  if (loading) {
    return <div className="p-8">Chargement des membres...</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestion des Membres</h1>
          <p className="text-gray-600 text-sm md:text-base">Administration et suivi</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border rounded-xl flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Download size={18} />
            Exporter
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-600 text-white px-4 py-2 md:px-5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <UserPlus size={18} />
            Ajouter un membre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Total membres" value={totalMembers} />
        <StatCard label="Hommes" value={totalMen} />
        <StatCard label="Femmes" value={totalWomen} />
        <StatCard label="Baptisés" value={totalBaptised} />
        <StatCard label="Nationalités" value={nationalities} />
      </div>

      <div className="bg-white p-3 md:p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Recherche..."
          className="border rounded-lg px-3 py-2 text-sm md:text-base"
        />

        <select
          value={filterParoisse}
          onChange={e => {
            setFilterParoisse(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm md:text-base"
        >
          <option value="all">Toutes les paroisses</option>
          {paroisses.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filterCommission}
          onChange={e => {
            setFilterCommission(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm md:text-base"
        >
          <option value="all">Toutes les commissions</option>
          {commissions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterGenre}
          onChange={e => {
            setFilterGenre(e.target.value as any);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm md:text-base"
        >
          <option value="all">Genre</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>

        <select
          value={filterBaptise}
          onChange={e => {
            setFilterBaptise(e.target.value as any);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm md:text-base"
        >
          <option value="all">Baptême</option>
          <option value="Oui">Baptisé</option>
          <option value="Non">Non baptisé</option>
        </select>
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-gray-100">
            <tr>
               <th className="p-2 md:p-3 text-left">#</th>
              <th className="p-2 md:p-3 text-left">Nom</th>
              <th className="p-2 md:p-3 hidden sm:table-cell">Paroisse</th>
              <th className="p-2 md:p-3 hidden md:table-cell">Genre</th>
              <th className="p-2 md:p-3">Téléphone</th>
              <th className="p-2 md:p-3 hidden lg:table-cell">Baptisé</th>
              <th className="p-2 md:p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
  {paginatedMembers.map((m, index) => (
    <tr key={m.id} className="border-t">
      <td className="p-2 md:p-3 text-gray-500 text-xs md:text-sm">
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>
      <td className="p-2 md:p-3 font-medium text-xs md:text-sm">
        <div className="flex flex-col">
          <span>{m.prenom} {m.nom}</span>
          <span className="text-gray-500 sm:hidden">{m.paroisse}</span>
          <span className="text-gray-500 md:hidden lg:table-cell">{m.genre}</span>
        </div>
      </td>
      <td className="p-2 md:p-3 hidden sm:table-cell text-xs md:text-sm">{m.paroisse}</td>
      <td className="p-2 md:p-3 hidden md:table-cell text-xs md:text-sm">{m.genre}</td>
      <td className="p-2 md:p-3 text-xs md:text-sm">{m.telephone}</td>
      <td className="p-2 md:p-3 hidden lg:table-cell text-xs md:text-sm">{m.baptise}</td>
      <td className="p-2 md:p-3">
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => {
              setSelectedMember(m);
              setShowViewModal(true);
            }}
            className="px-2 py-1 md:px-3 md:py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs md:text-sm"
          >
            <Eye size={14} />
          </button>

          <button
            onClick={() => {
              setSelectedMember(m);
              setShowEditModal(true);
            }}
            className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs md:text-sm"
          >
            <Edit size={14} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>

        {!filteredMembers.length && (
          <div className="p-6 text-center text-gray-500">
            Aucun membre trouvé
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 p-3 md:p-4">
            <button
  disabled={currentPage === 1}
  onClick={() => setCurrentPage(p => p - 1)}
  className="px-3 py-1 md:px-4 md:py-1 rounded bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed text-sm"
>
  Précédent
</button>

<span className="text-xs md:text-sm">
  Page {currentPage} sur {totalPages}
</span>

<button
  disabled={currentPage === totalPages}
  onClick={() => setCurrentPage(p => p + 1)}
  className="px-3 py-1 md:px-4 md:py-1 rounded bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed text-sm"
>
  Suivant
</button>

          </div>
        )}
      </div>

      <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title="Détails du membre">
        {selectedMember && (
          <div className="space-y-3 text-sm">
            <p><strong>Nom:</strong> {selectedMember.prenom} {selectedMember.nom}</p>
            <p><strong>Paroisse:</strong> {selectedMember.paroisse}</p>
            <p><strong>Genre:</strong> {selectedMember.genre}</p>
            <p><strong>Nationalité:</strong> {selectedMember.nationalite}</p>
            <p><strong>Téléphone:</strong> {selectedMember.telephone}</p>
            <p><strong>Email:</strong> {selectedMember.email ?? "-"}</p>
            <p><strong>Baptisé:</strong> {selectedMember.baptise}</p>
            <p><strong>Commissions:</strong> {(selectedMember.commissions ?? []).join(", ")}</p>
          </div>
        )}
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un membre">
        <MemberRegistrationForm
          onSuccess={() => {
            setShowAddModal(false);
            fetchMembers();
          }}
        />
      </Modal>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le membre">
        {selectedMember && (
          <MemberRegistrationForm
            initialData={selectedMember}
            isEdit
            onSuccess={() => {
              setShowEditModal(false);
              fetchMembers();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-3 md:p-4 shadow">
      <p className="text-xs md:text-sm text-gray-600">{label}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}
