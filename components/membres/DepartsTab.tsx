"use client";

import { useEffect, useState } from "react";
import { LogOut, Plus, Edit, Trash2, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";

/* ================= TYPES ================= */

type Member = {
  id: string;
  nom: string;
  prenom: string;
  paroisse: string;
};

type Depart = {
  id: string;
  member_id: string;
  date_depart: string;
  motif: string;
  destination: string | null;
  notes: string | null;
  statut: string;
  created_at: string;
  member_registrations?: {
    nom: string;
    prenom: string;
    paroisse: string;
  };
};

const MOTIFS = ["Transfert", "Décès", "Exclusion", "Démission", "Déménagement", "Autre"];
const STATUTS = ["confirmé", "en_attente"];

/* ================= COMPONENT ================= */

export default function DepartsTab() {
  const supabase = createClient();

  const [departs, setDeparts] = useState<Depart[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMotif, setFilterMotif] = useState("all");
  const [filterStatut, setFilterStatut] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editDepart, setEditDepart] = useState<Depart | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const emptyForm = {
    member_id: "",
    date_depart: "",
    motif: "Transfert",
    destination: "",
    notes: "",
    statut: "confirmé",
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const fetchData = async () => {
    setLoading(true);
    const [{ data: departsData }, { data: membersData }] = await Promise.all([
      supabase
        .from("member_departures")
        .select("*, member_registrations(nom, prenom, paroisse)")
        .order("date_depart", { ascending: false }),
      supabase
        .from("member_registrations")
        .select("id, nom, prenom, paroisse")
        .order("prenom"),
    ]);
    if (departsData) setDeparts(departsData);
    if (membersData) setMembers(membersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER ================= */

  const filtered = departs.filter((d) => {
    const name = `${d.member_registrations?.prenom ?? ""} ${d.member_registrations?.nom ?? ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || d.motif.toLowerCase().includes(search.toLowerCase());
    const matchMotif = filterMotif === "all" || d.motif === filterMotif;
    const matchStatut = filterStatut === "all" || d.statut === filterStatut;
    return matchSearch && matchMotif && matchStatut;
  });

  /* ================= SAVE ================= */

  const openAdd = () => {
    setEditDepart(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (d: Depart) => {
    setEditDepart(d);
    setForm({
      member_id: d.member_id,
      date_depart: d.date_depart,
      motif: d.motif,
      destination: d.destination ?? "",
      notes: d.notes ?? "",
      statut: d.statut,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.member_id || !form.date_depart || !form.motif) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      member_id: form.member_id,
      date_depart: form.date_depart,
      motif: form.motif,
      destination: form.destination || null,
      notes: form.notes || null,
      statut: form.statut,
    };

    let err;
    if (editDepart) {
      ({ error: err } = await supabase
        .from("member_departures")
        .update(payload)
        .eq("id", editDepart.id));
    } else {
      ({ error: err } = await supabase.from("member_departures").insert(payload));
    }

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setShowModal(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("member_departures").delete().eq("id", id);
    setConfirmDelete(null);
    fetchData();
  };

  /* ================= STATS ================= */

  const totalDeparts = departs.length;
  const totalConfirmed = departs.filter((d) => d.statut === "confirmé").length;
  const totalPending = departs.filter((d) => d.statut === "en_attente").length;

  if (loading) {
    return (
      <div className="p-8 text-gray-500 dark:text-gray-400">Chargement des départs...</div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LogOut className="text-red-500" size={22} />
            Gestion des Départs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suivi des membres ayant quitté l'église</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
        >
          <Plus size={16} />
          Enregistrer un départ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total départs", value: totalDeparts, color: "text-red-600 dark:text-red-400" },
          { label: "Confirmés", value: totalConfirmed, color: "text-green-600 dark:text-green-400" },
          { label: "En attente", value: totalPending, color: "text-yellow-600 dark:text-yellow-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 md:p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche membre / motif..."
            className="pl-8 w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 transition-colors"
          />
        </div>
        <select
          value={filterMotif}
          onChange={(e) => setFilterMotif(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tous les motifs</option>
          {MOTIFS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="confirmé">Confirmé</option>
          <option value="en_attente">En attente</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-x-auto border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">#</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">Membre</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden sm:table-cell">Paroisse</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">Motif</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden md:table-cell">Date départ</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden lg:table-cell">Destination</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">Statut</th>
              <th className="p-3 text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr
                key={d.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="p-3 text-gray-500 text-xs">{i + 1}</td>
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                  {d.member_registrations?.prenom} {d.member_registrations?.nom}
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell text-xs">
                  {d.member_registrations?.paroisse ?? "-"}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300 text-xs">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full text-xs">
                    {d.motif}
                  </span>
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-300 hidden md:table-cell text-xs">
                  {new Date(d.date_depart).toLocaleDateString("fr-FR")}
                </td>
                <td className="p-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell text-xs">
                  {d.destination ?? "-"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      d.statut === "confirmé"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {d.statut === "confirmé" ? "Confirmé" : "En attente"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(d)}
                      className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(d.id)}
                      className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="p-8 text-center text-gray-400">Aucun départ enregistré</div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editDepart ? "Modifier le départ" : "Enregistrer un départ"}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Membre <span className="text-red-500">*</span>
            </label>
            <select
              value={form.member_id}
              onChange={(e) => setForm({ ...form, member_id: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
            >
              <option value="">-- Sélectionner un membre --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.prenom} {m.nom} — {m.paroisse}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de départ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date_depart}
                onChange={(e) => setForm({ ...form, date_depart: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motif <span className="text-red-500">*</span>
              </label>
              <select
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              >
                {MOTIFS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destination
              </label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="Ex: Église ABC, Kinshasa..."
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              >
                <option value="confirmé">Confirmé</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Informations complémentaires..."
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              {saving ? "Enregistrement..." : editDepart ? "Modifier" : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cet enregistrement de départ ?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
