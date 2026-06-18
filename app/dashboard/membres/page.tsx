"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Download,
  Edit,
  Eye,
  LogOut,
  Heart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";
import MemberRegistrationForm from "@/components/public/MemberRegistrationForm";
import DepartsTab from "@/components/membres/DepartsTab";
import MariagesTab from "@/components/membres/MariagesTab";

/* ================= TYPES ================= */

type TabId = "membres" | "departs" | "mariages";

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

export default function MembersPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabId>("membres");

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

  const totalMembers = members.length;
  const totalMen = members.filter(m => m.genre === "Homme").length;
  const totalWomen = members.filter(m => m.genre === "Femme").length;
  const totalBaptised = members.filter(m => m.baptise === "Oui").length;
  const nationalities = new Set(members.map(m => m.nationalite)).size;

  const paroisses = Array.from(new Set(members.map(m => m.paroisse)));
  const commissions = Array.from(new Set(members.flatMap(m => m.commissions ?? [])));

  const filteredMembers = members
    .filter(m => {
      const matchesSearch =
        `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        m.telephone.includes(search) ||
        (m.email ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesGenre = filterGenre === "all" || m.genre === filterGenre;
      const matchesBaptise = filterBaptise === "all" || m.baptise === filterBaptise;
      const matchesParoisse = filterParoisse === "all" || m.paroisse === filterParoisse;
      const matchesCommission = filterCommission === "all" || (m.commissions ?? []).includes(filterCommission);
      return matchesSearch && matchesGenre && matchesBaptise && matchesParoisse && matchesCommission;
    })
    .sort((a, b) => {
      const c = a.prenom.localeCompare(b.prenom, "fr", { sensitivity: "base" });
      if (c !== 0) return c;
      return a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" });
    });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ["Nom", "Prenom", "Paroisse", "Genre", "Nationalite", "Telephone", "Email", "Baptise", "Commissions"];
    const rows = filteredMembers.map(m => [
      m.nom, m.prenom, m.paroisse, m.genre, m.nationalite,
      m.telephone, m.email ?? "", m.baptise, (m.commissions ?? []).join(", ")
    ]);
    const csv = headers.join(";") + "\n" + rows.map(r => r.map(v => `"${v}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "membres-eeam.csv";
    link.click();
  };

  const TABS = [
    { id: "membres" as TabId, label: "Membres", icon: "users", activeClass: "bg-cyan-600 text-white" },
    { id: "departs" as TabId, label: "Gestion des Departs", icon: "logout", activeClass: "bg-red-600 text-white" },
    { id: "mariages" as TabId, label: "Gestion des Mariages", icon: "heart", activeClass: "bg-pink-600 text-white" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-slate-50 dark:bg-gray-950 min-h-screen">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Gestion des Membres</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Administration et suivi</p>
      </div>

      <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? tab.activeClass
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.id === "membres" && <Users size={16} />}
            {tab.id === "departs" && <LogOut size={16} />}
            {tab.id === "mariages" && <Heart size={16} />}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "departs" && <DepartsTab />}
      {activeTab === "mariages" && <MariagesTab />}

      {activeTab === "membres" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Chargement des membres...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download size={18} />
                  Exporter
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-cyan-600 text-white px-4 py-2 md:px-5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <UserPlus size={18} />
                  Ajouter un membre
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                <StatCard label="Total membres" value={totalMembers} />
                <StatCard label="Hommes" value={totalMen} />
                <StatCard label="Femmes" value={totalWomen} />
                <StatCard label="Baptises" value={totalBaptised} />
                <StatCard label="Nationalites" value={nationalities} />
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 md:p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Recherche..."
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-colors"
                />
                <select
                  value={filterParoisse}
                  onChange={e => { setFilterParoisse(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="all">Toutes les paroisses</option>
                  {paroisses.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={filterCommission}
                  onChange={e => { setFilterCommission(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="all">Toutes les commissions</option>
                  {commissions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={filterGenre}
                  onChange={e => { setFilterGenre(e.target.value as any); setCurrentPage(1); }}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="all">Genre</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
                <select
                  value={filterBaptise}
                  onChange={e => { setFilterBaptise(e.target.value as any); setCurrentPage(1); }}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="all">Bapteme</option>
                  <option value="Oui">Baptise</option>
                  <option value="Non">Non baptise</option>
                </select>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-x-auto border border-gray-100 dark:border-gray-800">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-2 md:p-3 text-left text-gray-700 dark:text-gray-300">#</th>
                      <th className="p-2 md:p-3 text-left text-gray-700 dark:text-gray-300">Nom</th>
                      <th className="p-2 md:p-3 hidden sm:table-cell text-gray-700 dark:text-gray-300">Paroisse</th>
                      <th className="p-2 md:p-3 hidden md:table-cell text-gray-700 dark:text-gray-300">Genre</th>
                      <th className="p-2 md:p-3 text-gray-700 dark:text-gray-300">Telephone</th>
                      <th className="p-2 md:p-3 hidden lg:table-cell text-gray-700 dark:text-gray-300">Baptise</th>
                      <th className="p-2 md:p-3 text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((m, index) => (
                      <tr
                        key={m.id}
                        className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-2 md:p-3 text-gray-500 dark:text-gray-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-2 md:p-3 font-medium text-gray-800 dark:text-gray-200">
                          <div className="flex flex-col">
                            <span>{m.prenom} {m.nom}</span>
                            <span className="text-gray-500 dark:text-gray-400 sm:hidden">{m.paroisse}</span>
                          </div>
                        </td>
                        <td className="p-2 md:p-3 hidden sm:table-cell text-gray-700 dark:text-gray-300">{m.paroisse}</td>
                        <td className="p-2 md:p-3 hidden md:table-cell text-gray-700 dark:text-gray-300">{m.genre}</td>
                        <td className="p-2 md:p-3 text-gray-700 dark:text-gray-300">{m.telephone}</td>
                        <td className="p-2 md:p-3 hidden lg:table-cell text-gray-700 dark:text-gray-300">{m.baptise}</td>
                        <td className="p-2 md:p-3">
                          <div className="flex gap-1 md:gap-2">
                            <button
                              onClick={() => { setSelectedMember(m); setShowViewModal(true); }}
                              className="px-2 py-1 md:px-3 md:py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => { setSelectedMember(m); setShowEditModal(true); }}
                              className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                  <div className="text-center py-16">
                    <Users size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">Aucun membre trouvé.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 text-sm text-cyan-500 hover:underline"
                    >
                      Ajouter le premier membre
                    </button>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 p-3 md:p-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-3 py-1 md:px-4 md:py-1 rounded bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed text-sm"
                    >
                      Precedent
                    </button>
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
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

              <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title="Details du membre">
                {selectedMember && (
                  <div className="space-y-3 text-sm">
                    <p><strong>Nom:</strong> {selectedMember.prenom} {selectedMember.nom}</p>
                    <p><strong>Paroisse:</strong> {selectedMember.paroisse}</p>
                    <p><strong>Genre:</strong> {selectedMember.genre}</p>
                    <p><strong>Nationalite:</strong> {selectedMember.nationalite}</p>
                    <p><strong>Telephone:</strong> {selectedMember.telephone}</p>
                    <p><strong>Email:</strong> {selectedMember.email ?? "-"}</p>
                    <p><strong>Baptise:</strong> {selectedMember.baptise}</p>
                    <p><strong>Commissions:</strong> {(selectedMember.commissions ?? []).join(", ")}</p>
                  </div>
                )}
              </Modal>

              <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un membre">
                <MemberRegistrationForm onSuccess={() => { setShowAddModal(false); fetchMembers(); }} />
              </Modal>

              <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le membre">
                {selectedMember && (
                  <MemberRegistrationForm
                    initialData={selectedMember}
                    isEdit
                    onSuccess={() => { setShowEditModal(false); fetchMembers(); }}
                  />
                )}
              </Modal>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-3 md:p-4 shadow border border-gray-100 dark:border-gray-800">
      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
