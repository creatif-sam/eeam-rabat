"use client";

import { useEffect, useState } from "react";
import { Heart, Plus, Edit, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";

/* ================= TYPES ================= */

type Member = {
  id: string;
  nom: string;
  prenom: string;
  paroisse: string;
  genre: "Homme" | "Femme";
};

type Mariage = {
  id: string;
  epoux_member_id: string | null;
  epoux_nom: string;
  epouse_member_id: string | null;
  epouse_nom: string;
  date_mariage: string;
  lieu: string | null;
  pasteur: string | null;
  type_mariage: string;
  paroisse: string | null;
  notes: string | null;
  created_at: string;
};

const TYPES_MARIAGE = ["Religieux", "Civil", "Civil et Religieux"];

/* ================= COMPONENT ================= */

export default function MariagesTab() {
  const supabase = createClient();

  const [mariages, setMariages] = useState<Mariage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editMariage, setEditMariage] = useState<Mariage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyForm = {
    epoux_member_id: "",
    epoux_nom: "",
    epouse_member_id: "",
    epouse_nom: "",
    date_mariage: "",
    lieu: "",
    pasteur: "",
    type_mariage: "Religieux",
    paroisse: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  // Whether the spouse is an external (non-member) person
  const [externalEpoux, setExternalEpoux] = useState(false);
  const [externalEpouse, setExternalEpouse] = useState(false);

  /* ================= FETCH ================= */

  const fetchData = async () => {
    setLoading(true);
    const [{ data: mariagesData }, { data: membersData }] = await Promise.all([
      supabase
        .from("member_marriages")
        .select("*")
        .order("date_mariage", { ascending: false }),
      supabase
        .from("member_registrations")
        .select("id, nom, prenom, paroisse, genre")
        .order("prenom"),
    ]);
    if (mariagesData) setMariages(mariagesData);
    if (membersData) setMembers(membersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER ================= */

  const filtered = mariages.filter((m) => {
    const str = `${m.epoux_nom} ${m.epouse_nom} ${m.lieu ?? ""} ${m.pasteur ?? ""}`.toLowerCase();
    const matchSearch = str.includes(search.toLowerCase());
    const matchType = filterType === "all" || m.type_mariage === filterType;
    return matchSearch && matchType;
  });

  /* ================= SAVE ================= */

  const openAdd = () => {
    setEditMariage(null);
    setForm(emptyForm);
    setExternalEpoux(false);
    setExternalEpouse(false);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (m: Mariage) => {
    setEditMariage(m);
    setForm({
      epoux_member_id: m.epoux_member_id ?? "",
      epoux_nom: m.epoux_nom,
      epouse_member_id: m.epouse_member_id ?? "",
      epouse_nom: m.epouse_nom,
      date_mariage: m.date_mariage,
      lieu: m.lieu ?? "",
      pasteur: m.pasteur ?? "",
      type_mariage: m.type_mariage,
      paroisse: m.paroisse ?? "",
      notes: m.notes ?? "",
    });
    setExternalEpoux(!m.epoux_member_id);
    setExternalEpouse(!m.epouse_member_id);
    setError(null);
    setShowModal(true);
  };

  // Auto-fill epoux_nom when a member is selected
  const handleEpouxMemberChange = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setForm((f) => ({
      ...f,
      epoux_member_id: memberId,
      epoux_nom: member ? `${member.prenom} ${member.nom}` : "",
    }));
  };

  const handleEpouseMemberChange = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setForm((f) => ({
      ...f,
      epouse_member_id: memberId,
      epouse_nom: member ? `${member.prenom} ${member.nom}` : "",
    }));
  };

  const handleSave = async () => {
    if (!form.epoux_nom || !form.epouse_nom || !form.date_mariage) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      epoux_member_id: form.epoux_member_id || null,
      epoux_nom: form.epoux_nom,
      epouse_member_id: form.epouse_member_id || null,
      epouse_nom: form.epouse_nom,
      date_mariage: form.date_mariage,
      lieu: form.lieu || null,
      pasteur: form.pasteur || null,
      type_mariage: form.type_mariage,
      paroisse: form.paroisse || null,
      notes: form.notes || null,
    };

    let err;
    if (editMariage) {
      ({ error: err } = await supabase
        .from("member_marriages")
        .update(payload)
        .eq("id", editMariage.id));
    } else {
      ({ error: err } = await supabase.from("member_marriages").insert(payload));
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
    await supabase.from("member_marriages").delete().eq("id", id);
    setConfirmDelete(null);
    fetchData();
  };

  /* ================= STATS ================= */

  const totalMariages = mariages.length;
  const totalReligieux = mariages.filter((m) => m.type_mariage === "Religieux").length;
  const totalCivil = mariages.filter((m) => m.type_mariage === "Civil").length;
  const totalDouble = mariages.filter((m) => m.type_mariage === "Civil et Religieux").length;

  const hommeMembers = members.filter((m) => m.genre === "Homme");
  const femmeMembers = members.filter((m) => m.genre === "Femme");

  if (loading) {
    return (
      <div className="p-8 text-gray-500 dark:text-gray-400">Chargement des mariages...</div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="text-pink-500" size={22} />
            Gestion des Mariages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Registre des mariages célébrés</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
        >
          <Plus size={16} />
          Enregistrer un mariage
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total mariages", value: totalMariages, color: "text-pink-600 dark:text-pink-400" },
          { label: "Religieux", value: totalReligieux, color: "text-purple-600 dark:text-purple-400" },
          { label: "Civil", value: totalCivil, color: "text-blue-600 dark:text-blue-400" },
          { label: "Civil & Religieux", value: totalDouble, color: "text-green-600 dark:text-green-400" },
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
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche époux / épouse / lieu..."
            className="pl-8 w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400 transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tous les types</option>
          {TYPES_MARIAGE.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-x-auto border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">#</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">Époux</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">Épouse</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden md:table-cell">Date</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden sm:table-cell">Type</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden lg:table-cell">Lieu</th>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden lg:table-cell">Pasteur</th>
              <th className="p-3 text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr
                key={m.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="p-3 text-gray-500 text-xs">{i + 1}</td>
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200 text-xs md:text-sm">
                  {m.epoux_nom}
                  {!m.epoux_member_id && (
                    <span className="ml-1 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1 rounded">ext.</span>
                  )}
                </td>
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200 text-xs md:text-sm">
                  {m.epouse_nom}
                  {!m.epouse_member_id && (
                    <span className="ml-1 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1 rounded">ext.</span>
                  )}
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-300 hidden md:table-cell text-xs">
                  {new Date(m.date_mariage).toLocaleDateString("fr-FR")}
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.type_mariage === "Religieux"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : m.type_mariage === "Civil"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  }`}>
                    {m.type_mariage}
                  </span>
                </td>
                <td className="p-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell text-xs">
                  {m.lieu ?? "-"}
                </td>
                <td className="p-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell text-xs">
                  {m.pasteur ?? "-"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(m.id)}
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
          <div className="p-8 text-center text-gray-400">Aucun mariage enregistré</div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editMariage ? "Modifier le mariage" : "Enregistrer un mariage"}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Époux */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Époux</h3>
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={externalEpoux}
                  onChange={(e) => {
                    setExternalEpoux(e.target.checked);
                    setForm((f) => ({ ...f, epoux_member_id: "", epoux_nom: "" }));
                  }}
                  className="rounded"
                />
                Personne externe
              </label>
            </div>
            {!externalEpoux ? (
              <select
                value={form.epoux_member_id}
                onChange={(e) => handleEpouxMemberChange(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              >
                <option value="">-- Sélectionner un membre --</option>
                {hommeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.prenom} {m.nom} — {m.paroisse}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.epoux_nom}
                onChange={(e) => setForm({ ...form, epoux_nom: e.target.value })}
                placeholder="Nom complet de l'époux *"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              />
            )}
          </div>

          {/* Épouse */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Épouse</h3>
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={externalEpouse}
                  onChange={(e) => {
                    setExternalEpouse(e.target.checked);
                    setForm((f) => ({ ...f, epouse_member_id: "", epouse_nom: "" }));
                  }}
                  className="rounded"
                />
                Personne externe
              </label>
            </div>
            {!externalEpouse ? (
              <select
                value={form.epouse_member_id}
                onChange={(e) => handleEpouseMemberChange(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              >
                <option value="">-- Sélectionner un membre --</option>
                {femmeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.prenom} {m.nom} — {m.paroisse}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.epouse_nom}
                onChange={(e) => setForm({ ...form, epouse_nom: e.target.value })}
                placeholder="Nom complet de l'épouse *"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              />
            )}
          </div>

          {/* Date, Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date du mariage <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date_mariage}
                onChange={(e) => setForm({ ...form, date_mariage: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de mariage
              </label>
              <select
                value={form.type_mariage}
                onChange={(e) => setForm({ ...form, type_mariage: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              >
                {TYPES_MARIAGE.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lieu, Paroisse */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
              <input
                type="text"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                placeholder="Ex: Salle des fêtes..."
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paroisse</label>
              <input
                type="text"
                value={form.paroisse}
                onChange={(e) => setForm({ ...form, paroisse: e.target.value })}
                placeholder="Ex: EEAM Kinshasa..."
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Pasteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pasteur officiant</label>
            <input
              type="text"
              value={form.pasteur}
              onChange={(e) => setForm({ ...form, pasteur: e.target.value })}
              placeholder="Nom du pasteur..."
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Informations complémentaires..."
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400 resize-none"
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
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              {saving ? "Enregistrement..." : editMariage ? "Modifier" : "Enregistrer"}
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
            Êtes-vous sûr de vouloir supprimer cet enregistrement de mariage ?
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
