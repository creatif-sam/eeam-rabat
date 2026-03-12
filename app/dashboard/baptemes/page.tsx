"use client";

import { useEffect, useState } from "react";
import {
  Droplet, Plus, Search, Calendar, User, Phone, Mail,
  CheckCircle, Clock, XCircle, Users, Edit, Trash2,
  ChevronRight, UserCheck, UserX, Loader2, X, Check,
  FileText, MapPin, Filter
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type BaptismStatus = "en_attente" | "en_preparation" | "approuve" | "baptise" | "rejete";

type Baptism = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  address: string | null;
  statut: BaptismStatus;
  date_demande: string;
  date_bapteme: string | null;
  ceremony_location: string | null;
  conseiller: string | null;
  temoignage: string | null;
  preparation_completee: number;
  preparation_totale: number;
  creator_id: string;
  creator_email: string;
};

type Attendee = {
  id: string;
  baptism_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  present: boolean;
  note: string | null;
  created_at: string;
};

const STATUS_CFG: Record<BaptismStatus, { label: string; color: string; bg: string; dot: string }> = {
  en_attente:     { label: "En attente",      color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20",  dot: "bg-amber-500" },
  en_preparation: { label: "En préparation",  color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20",    dot: "bg-blue-500" },
  approuve:       { label: "Approuvé",        color: "text-cyan-600 dark:text-cyan-400",    bg: "bg-cyan-50 dark:bg-cyan-900/20",    dot: "bg-cyan-500" },
  baptise:        { label: "Baptisé ✓",       color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  dot: "bg-green-500" },
  rejete:         { label: "Rejeté",          color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-900/20",      dot: "bg-red-500" },
};

function StatusBadge({ s }: { s: BaptismStatus }) {
  const cfg = STATUS_CFG[s];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
    </span>
  );
}

const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors";

export default function BaptemesTab() {
  const supabase = createClient();
  const [baptisms, setBaptisms] = useState<Baptism[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BaptismStatus | "all">("all");
  const [selected, setSelected] = useState<Baptism | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "presences">("details");

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [attendeeForm, setAttendeeForm] = useState({ full_name: "", phone: "", email: "" });

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", phone: "", temoignage: "", age: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBaptisms(); }, []);

  const fetchBaptisms = async () => {
    const { data } = await supabase.from("baptisms").select("*").order("date_demande", { ascending: false });
    setBaptisms((data as Baptism[]) || []);
    setLoading(false);
  };

  const loadAttendees = async (baptismId: string) => {
    setLoadingAttendees(true);
    const { data } = await supabase.from("baptism_attendees").select("*").eq("baptism_id", baptismId).order("created_at");
    setAttendees((data as Attendee[]) || []);
    setLoadingAttendees(false);
  };

  const addAttendee = async () => {
    if (!selected || !attendeeForm.full_name.trim()) { toast.error("Le nom est requis"); return; }
    const { error } = await supabase.from("baptism_attendees").insert({
      baptism_id: selected.id,
      full_name: attendeeForm.full_name,
      phone: attendeeForm.phone || null,
      email: attendeeForm.email || null,
      present: false,
    });
    if (error) { toast.error("Erreur lors de l'ajout"); return; }
    toast.success("Participant ajouté");
    setAttendeeForm({ full_name: "", phone: "", email: "" });
    setShowAddAttendee(false);
    loadAttendees(selected.id);
  };

  const togglePresence = async (id: string, present: boolean) => {
    await supabase.from("baptism_attendees").update({ present }).eq("id", id);
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, present } : a));
    toast.success(present ? "Présence enregistrée ✓" : "Marqué absent");
  };

  const removeAttendee = async (id: string) => {
    await supabase.from("baptism_attendees").delete().eq("id", id);
    setAttendees(prev => prev.filter(a => a.id !== id));
    toast.success("Participant retiré");
  };

  const openSelected = (b: Baptism) => {
    setSelected(b);
    setActiveTab("details");
    loadAttendees(b.id);
  };

  const createBaptism = async () => {
    if (!createForm.full_name.trim()) { toast.error("Le nom est requis"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Non authentifié"); setSaving(false); return; }
    const { error } = await supabase.from("baptisms").insert({
      full_name: createForm.full_name, email: createForm.email,
      phone: createForm.phone || null, temoignage: createForm.temoignage || null,
      age: createForm.age ? parseInt(createForm.age) : null,
      address: createForm.address || null,
      creator_id: user.id, creator_email: user.email,
    });
    setSaving(false);
    if (error) { toast.error("Erreur lors de la création"); return; }
    toast.success("Demande créée !");
    setShowCreate(false);
    setCreateForm({ full_name: "", email: "", phone: "", temoignage: "", age: "", address: "" });
    fetchBaptisms();
  };

  const saveBaptism = async () => {
    if (!editForm) return;
    setSaving(true);
    const { error } = await supabase.from("baptisms").update({
      full_name: editForm.full_name, email: editForm.email, phone: editForm.phone || null,
      temoignage: editForm.temoignage || null, statut: editForm.statut,
      date_bapteme: editForm.date_bapteme || null,
      ceremony_location: editForm.ceremony_location || null,
      conseiller: editForm.conseiller || null,
    }).eq("id", editForm.id);
    setSaving(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Demande mise à jour !");
    const updated = { ...editForm } as Baptism;
    setBaptisms(prev => prev.map(b => b.id === updated.id ? updated : b));
    if (selected?.id === updated.id) setSelected(updated);
    setShowEdit(false);
    setEditForm(null);
  };

  const updateStatus = async (id: string, statut: BaptismStatus) => {
    await supabase.from("baptisms").update({ statut }).eq("id", id);
    setBaptisms(prev => prev.map(b => b.id === id ? { ...b, statut } : b));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, statut } : prev);
    const labels: Record<string, string> = { approuve: "Candidat approuvé !", rejete: "Candidat rejeté", baptise: "Marqué comme baptisé !" };
    toast.success(labels[statut] || "Statut mis à jour");
  };

  const year = new Date().getFullYear();
  const stats = {
    total: baptisms.length,
    thisYear: baptisms.filter(b => new Date(b.date_demande).getFullYear() === year).length,
    upcoming: baptisms.filter(b => b.statut === "approuve").length,
    pending: baptisms.filter(b => b.statut === "en_attente").length,
    baptised: baptisms.filter(b => b.statut === "baptise").length,
  };

  const filtered = baptisms.filter(b => {
    const matchSearch = b.full_name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-cyan-500" size={32} />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── Left Sidebar ── */}
      <div className="flex flex-col w-72 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Droplet size={18} className="text-cyan-500" /> Baptêmes
            </h1>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors">
              <Plus size={13} /> Nouveau
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-cyan-400 text-gray-700 dark:text-gray-300 transition-colors" />
          </div>

          <div className="flex gap-1 flex-wrap">
            {([["all","Tous",stats.total],["en_attente","Attente",stats.pending],["approuve","Approuvé",stats.upcoming],["baptise","Baptisé",stats.baptised]] as [BaptismStatus|"all",string,number][]).map(([key,label,count]) => (
              <button key={key} onClick={() => setFilterStatus(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === key ? "bg-cyan-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                {label} <span className="opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {[{label:"Total",val:stats.total,color:"text-cyan-600"},{label:"Année",val:stats.thisYear,color:"text-green-600"},{label:"Baptisés",val:stats.baptised,color:"text-blue-600"}].map(s => (
            <div key={s.label} className="py-3 px-2 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Candidates list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
          {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun candidat trouvé</p>}
          {filtered.map(b => (
            <button key={b.id} onClick={() => openSelected(b)}
              className={`w-full text-left px-5 py-4 transition-colors ${selected?.id === b.id ? "bg-cyan-50 dark:bg-cyan-900/20 border-r-2 border-r-cyan-500" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{b.full_name}</p>
                <ChevronRight size={14} className="text-gray-400 shrink-0 ml-2" />
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">{b.email}</p>
              <div className="flex items-center justify-between">
                <StatusBadge s={b.statut} />
                {b.date_bapteme && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(b.date_bapteme).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 p-8 text-center">
            <Droplet size={56} className="opacity-20" />
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Sélectionnez un candidat</p>
              <p className="text-sm text-gray-400">Gérez les détails et les présences à la cérémonie de baptême</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors">
              + Ajouter un candidat
            </button>
          </div>
        ) : (
          <>
            {/* Detail header */}
            <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.full_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge s={selected.statut} />
                  <button onClick={() => { setEditForm({ ...selected, ceremony_location: selected.ceremony_location || "" }); setShowEdit(true); }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-1">
                {(["details","presences"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-cyan-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    {tab === "details" ? "Détails" : `Présences${attendees.length > 0 ? ` (${attendees.length})` : ""}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "details" ? (
                <div className="space-y-5 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Mail, label: "Email", val: selected.email },
                      { icon: Phone, label: "Téléphone", val: selected.phone || "—" },
                      { icon: User, label: "Âge", val: selected.age ? `${selected.age} ans` : "—" },
                      { icon: MapPin, label: "Adresse", val: selected.address || "—" },
                      { icon: Calendar, label: "Date de demande", val: new Date(selected.date_demande).toLocaleDateString("fr-FR") },
                      { icon: Calendar, label: "Date de baptême", val: selected.date_bapteme ? new Date(selected.date_bapteme).toLocaleDateString("fr-FR") : "Non fixée" },
                      { icon: MapPin, label: "Lieu de cérémonie", val: selected.ceremony_location || "—" },
                      { icon: User, label: "Conseiller", val: selected.conseiller || "—" },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={11} className="text-gray-400" />
                          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">{label}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{val}</p>
                      </div>
                    ))}
                  </div>

                  {selected.temoignage && (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-2 flex items-center gap-1.5">
                        <FileText size={12} /> Témoignage
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">&ldquo;{selected.temoignage}&rdquo;</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    {selected.statut === "en_attente" && (
                      <>
                        <button onClick={() => updateStatus(selected.id, "approuve")}
                          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
                          <CheckCircle size={15} /> Approuver
                        </button>
                        <button onClick={() => updateStatus(selected.id, "rejete")}
                          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">
                          <XCircle size={15} /> Rejeter
                        </button>
                      </>
                    )}
                    {selected.statut === "en_preparation" && (
                      <button onClick={() => updateStatus(selected.id, "approuve")}
                        className="flex items-center gap-2 py-2.5 px-5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors">
                        <CheckCircle size={15} /> Marquer comme approuvé
                      </button>
                    )}
                    {selected.statut === "approuve" && (
                      <button onClick={() => updateStatus(selected.id, "baptise")}
                        className="flex items-center gap-2 py-2.5 px-5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        <Droplet size={15} /> Marquer comme baptisé
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── Presence Tab ── */
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Liste de présence</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cérémonie de {selected.full_name}</p>
                    </div>
                    <button onClick={() => setShowAddAttendee(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Invités", val: attendees.length, border: "border-gray-200 dark:border-gray-700", text: "text-gray-800 dark:text-white" },
                      { label: "Présents", val: attendees.filter(a => a.present).length, border: "border-green-200 dark:border-green-800", text: "text-green-600" },
                      { label: "Absents", val: attendees.filter(a => !a.present).length, border: "border-red-200 dark:border-red-800", text: "text-red-500" },
                    ].map(s => (
                      <div key={s.label} className={`bg-white dark:bg-gray-900 rounded-xl border ${s.border} p-3 text-center`}>
                        <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add attendee form */}
                  {showAddAttendee && (
                    <div className="bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-800/50 rounded-2xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">Nouveau participant</p>
                      <input value={attendeeForm.full_name} onChange={e => setAttendeeForm({ ...attendeeForm, full_name: e.target.value })}
                        placeholder="Nom complet *" className={inputCls} />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={attendeeForm.phone} onChange={e => setAttendeeForm({ ...attendeeForm, phone: e.target.value })}
                          placeholder="Téléphone" className={inputCls} />
                        <input value={attendeeForm.email} onChange={e => setAttendeeForm({ ...attendeeForm, email: e.target.value })}
                          placeholder="Email" className={inputCls} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowAddAttendee(false)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Annuler</button>
                        <button onClick={addAttendee} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors">Ajouter</button>
                      </div>
                    </div>
                  )}

                  {/* Attendees table */}
                  {loadingAttendees ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan-500" /></div>
                  ) : attendees.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
                      <Users size={40} className="opacity-20 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucun participant enregistré</p>
                      <p className="text-xs text-gray-400 mt-1">Cliquez sur &ldquo;Ajouter&rdquo; pour enregistrer les présences</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Présent</th>
                            <th className="px-4 py-3 w-10" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                          {attendees.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 transition-colors ${a.present ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                                    {a.full_name[0].toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{a.full_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{a.phone || a.email || "—"}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => togglePresence(a.id, !a.present)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${a.present ? "bg-green-500 hover:bg-green-600 text-white shadow-sm" : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600"}`}>
                                  {a.present ? <UserCheck size={16} /> : <UserX size={16} />}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <button onClick={() => removeAttendee(a.id)}
                                  className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Droplet size={16} className="text-cyan-500" /> Nouvelle demande
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-3">
              {([["full_name","Nom complet *","text"],["email","Email","email"],["phone","Téléphone","tel"],["age","Âge","number"],["address","Adresse","text"]] as [string,string,string][]).map(([key,ph,type]) => (
                <input key={key} type={type} placeholder={ph} value={(createForm as any)[key]}
                  onChange={e => setCreateForm({ ...createForm, [key]: e.target.value })} className={inputCls} />
              ))}
              <textarea placeholder="Témoignage" value={createForm.temoignage}
                onChange={e => setCreateForm({ ...createForm, temoignage: e.target.value })}
                rows={3} className={inputCls} style={{ resize: "none" }} />
              <button onClick={createBaptism} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Créer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 my-4">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit size={16} className="text-cyan-500" /> Modifier la demande
              </h2>
              <button onClick={() => { setShowEdit(false); setEditForm(null); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-3">
              {([["full_name","Nom complet"],["email","Email"],["phone","Téléphone"],["conseiller","Conseiller"],["ceremony_location","Lieu de cérémonie"]] as [string,string][]).map(([key,ph]) => (
                <input key={key} placeholder={ph} value={editForm[key] || ""}
                  onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className={inputCls} />
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Date de baptême</label>
                <input type="date" value={editForm.date_bapteme || ""}
                  onChange={e => setEditForm({ ...editForm, date_bapteme: e.target.value })} className={inputCls} />
              </div>
              <textarea placeholder="Témoignage" value={editForm.temoignage || ""} rows={3}
                onChange={e => setEditForm({ ...editForm, temoignage: e.target.value })}
                className={inputCls} style={{ resize: "none" }} />
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Statut</label>
                <select value={editForm.statut} onChange={e => setEditForm({ ...editForm, statut: e.target.value })}
                  className={inputCls}>
                  <option value="en_attente">En attente</option>
                  <option value="en_preparation">En préparation</option>
                  <option value="approuve">Approuvé</option>
                  <option value="baptise">Baptisé</option>
                  <option value="rejete">Rejeté</option>
                </select>
              </div>
              <button onClick={saveBaptism} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
