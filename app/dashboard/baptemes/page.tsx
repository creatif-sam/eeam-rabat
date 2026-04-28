"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Droplet,
  Plus,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  Users,
  Edit,
  Trash2,
  ChevronRight,
  Loader2,
  X,
  Check,
  FileText,
  MapPin,
  BookOpen,
  Archive,
  Clock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ParcoursType = "bapteme" | "affermissement";
type SectionTab = "active" | "archive";

type Baptism = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  address: string | null;
  statut: string;
  parcours_type: ParcoursType;
  date_demande: string;
  date_debut: string | null;
  date_fin: string | null;
  archived_at: string | null;
  date_bapteme: string | null;
  ceremony_location: string | null;
  conseiller: string | null;
  temoignage: string | null;
  creator_id: string;
  creator_email: string;
};

type Attendee = {
  id: string;
  baptism_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  created_at: string;
};

type PresenceRecord = {
  id: string;
  baptism_id: string;
  attendee_id: string;
  session_date: string;
  present: boolean;
};

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors";

function fmtDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR");
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.split("T")[0];
}

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric"
  });
}

function buildSessionDates(start?: string | null, end?: string | null) {
  if (!start || !end) return [] as string[];
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) return [];

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 7);
  }
  return dates;
}

export default function BaptemesTab() {
  const supabase = createClient();
  const [baptisms, setBaptisms] = useState<Baptism[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [parcoursTab, setParcoursTab] = useState<ParcoursType>("bapteme");
  const [sectionTab, setSectionTab] = useState<SectionTab>("active");
  const [selected, setSelected] = useState<Baptism | null>(null);

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [presenceRecords, setPresenceRecords] = useState<PresenceRecord[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [attendeeForm, setAttendeeForm] = useState({ full_name: "", phone: "", email: "" });

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    coordinator: "",
    address: "",
    parcours_type: "bapteme" as ParcoursType,
    date_debut: "",
    date_fin: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBaptisms();
  }, []);

  const isArchived = (row: Baptism) => {
    if (row.archived_at) return true;
    if (!row.date_fin) return false;
    const threshold = new Date(row.date_fin);
    threshold.setDate(threshold.getDate() + 7);
    const now = new Date();
    return now > threshold;
  };

  const fetchBaptisms = async () => {
    const { data } = await supabase.from("baptisms").select("*").order("date_demande", { ascending: false });
    setBaptisms((data as Baptism[]) || []);
    setLoading(false);
  };

  const loadAttendeesAndPresence = async (baptismId: string) => {
    setLoadingAttendees(true);
    const [{ data: attendeesData }, { data: recordsData }] = await Promise.all([
      supabase.from("baptism_attendees").select("id, baptism_id, full_name, phone, email, note, created_at").eq("baptism_id", baptismId).order("created_at"),
      supabase.from("baptism_presence_records").select("id, baptism_id, attendee_id, session_date, present").eq("baptism_id", baptismId)
    ]);

    setAttendees((attendeesData as Attendee[]) || []);
    setPresenceRecords((recordsData as PresenceRecord[]) || []);
    setLoadingAttendees(false);
  };

  const upsertPresence = async (attendeeId: string, sessionDate: string, present: boolean) => {
    if (!selected) return;
    const { error } = await supabase.from("baptism_presence_records").upsert(
      {
        baptism_id: selected.id,
        attendee_id: attendeeId,
        session_date: sessionDate,
        present
      },
      { onConflict: "baptism_id,attendee_id,session_date" }
    );

    if (error) {
      toast.error("Impossible d'enregistrer la présence.");
      return;
    }

    setPresenceRecords(prev => {
      const idx = prev.findIndex(
        r => r.baptism_id === selected.id && r.attendee_id === attendeeId && r.session_date === sessionDate
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], present };
        return next;
      }
      return [
        ...prev,
        {
          id: `${selected.id}-${attendeeId}-${sessionDate}`,
          baptism_id: selected.id,
          attendee_id: attendeeId,
          session_date: sessionDate,
          present
        }
      ];
    });
  };

  const addAttendee = async () => {
    if (!selected || !attendeeForm.full_name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    const { error } = await supabase.from("baptism_attendees").insert({
      baptism_id: selected.id,
      full_name: attendeeForm.full_name,
      phone: attendeeForm.phone || null,
      email: attendeeForm.email || null
    });
    if (error) {
      toast.error("Erreur lors de l'ajout");
      return;
    }
    toast.success("Participant ajouté");
    setAttendeeForm({ full_name: "", phone: "", email: "" });
    setShowAddAttendee(false);
    loadAttendeesAndPresence(selected.id);
  };

  const removeAttendee = async (id: string) => {
    await supabase.from("baptism_attendees").delete().eq("id", id);
    setAttendees(prev => prev.filter(a => a.id !== id));
    setPresenceRecords(prev => prev.filter(r => r.attendee_id !== id));
    toast.success("Participant retiré");
  };

  const openSelected = (row: Baptism) => {
    setSelected(row);
    loadAttendeesAndPresence(row.id);
  };

  const createBaptism = async () => {
    if (!createForm.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!createForm.date_debut || !createForm.date_fin) {
      toast.error("Veuillez renseigner la date de début et la date de fin.");
      return;
    }
    if (new Date(createForm.date_fin) < new Date(createForm.date_debut)) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }

    setSaving(true);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Non authentifié");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("baptisms").insert({
      full_name: createForm.title,
      email: null,
      phone: null,
      temoignage: createForm.description || null,
      age: null,
      address: createForm.address || null,
      conseiller: createForm.coordinator || null,
      parcours_type: createForm.parcours_type,
      date_debut: createForm.date_debut,
      date_fin: createForm.date_fin,
      creator_id: user.id,
      creator_email: user.email
    });

    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la création");
      return;
    }

    toast.success("Demande créée !");
    setShowCreate(false);
    setCreateForm({
      title: "",
      description: "",
      coordinator: "",
      address: "",
      parcours_type: "bapteme",
      date_debut: "",
      date_fin: ""
    });
    fetchBaptisms();
  };

  const saveBaptism = async () => {
    if (!editForm) return;

    if (!editForm.date_debut || !editForm.date_fin) {
      toast.error("Date de début et date de fin requises.");
      return;
    }
    if (new Date(editForm.date_fin) < new Date(editForm.date_debut)) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("baptisms")
      .update({
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone || null,
        temoignage: editForm.temoignage || null,
        parcours_type: editForm.parcours_type,
        date_debut: editForm.date_debut,
        date_fin: editForm.date_fin,
        date_bapteme: editForm.date_bapteme || null,
        ceremony_location: editForm.ceremony_location || null,
        conseiller: editForm.conseiller || null
      })
      .eq("id", editForm.id);

    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
      return;
    }

    toast.success("Demande mise à jour !");
    const updated = { ...editForm } as Baptism;
    setBaptisms(prev => prev.map(row => (row.id === updated.id ? updated : row)));
    if (selected?.id === updated.id) setSelected(updated);
    setShowEdit(false);
    setEditForm(null);
  };

  const scopedRows = useMemo(() => {
    return baptisms.filter(row => {
      if (row.parcours_type !== parcoursTab) return false;
      const rowArchived = isArchived(row);
      if (sectionTab === "active" && rowArchived) return false;
      if (sectionTab === "archive" && !rowArchived) return false;

      const matchSearch =
        row.full_name.toLowerCase().includes(search.toLowerCase()) || row.email.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [baptisms, parcoursTab, sectionTab, search]);

  useEffect(() => {
    if (!selected) return;
    const stillVisible = scopedRows.some(row => row.id === selected.id);
    if (!stillVisible) setSelected(null);
  }, [scopedRows, selected]);

  const year = new Date().getFullYear();
  const stats = {
    total: scopedRows.length,
    thisYear: scopedRows.filter(row => new Date(row.date_demande).getFullYear() === year).length,
    activeSessions: scopedRows.filter(row => !isArchived(row)).length,
    archivedSessions: scopedRows.filter(row => isArchived(row)).length
  };

  const sessionDates = useMemo(() => buildSessionDates(selected?.date_debut, selected?.date_fin), [selected?.date_debut, selected?.date_fin]);

  const monthGroups = useMemo(() => {
    const unique = Array.from(new Set(sessionDates.map(monthKey)));
    return unique;
  }, [sessionDates]);

  const getPresence = (attendeeId: string, sessionDate: string) => {
    return presenceRecords.find(r => r.attendee_id === attendeeId && r.session_date === sessionDate)?.present ?? false;
  };

  const countMonth = (attendeeId: string, month: string) => {
    return sessionDates
      .filter(d => monthKey(d) === month)
      .reduce((acc, d) => (getPresence(attendeeId, d) ? acc + 1 : acc), 0);
  };

  const countTotal = (attendeeId: string) => {
    return sessionDates.reduce((acc, d) => (getPresence(attendeeId, d) ? acc + 1 : acc), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-slate-50 dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Suivi Baptême</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Gestion des parcours et des absences</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus size={14} /> Nouveau
        </button>
      </div>

      <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setParcoursTab("bapteme")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            parcoursTab === "bapteme"
              ? "bg-cyan-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Droplet size={16} />
          <span>Baptême</span>
        </button>
        <button
          onClick={() => setParcoursTab("affermissement")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            parcoursTab === "affermissement"
              ? "bg-cyan-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <BookOpen size={16} />
          <span>Affermissement</span>
        </button>
        <button
          onClick={() => setSectionTab("active")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sectionTab === "active"
              ? "bg-emerald-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <BookOpen size={16} />
          <span>En cours</span>
        </button>
        <button
          onClick={() => setSectionTab("archive")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sectionTab === "archive"
              ? "bg-gray-700 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Archive size={16} />
          <span>Archive</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-15rem)] bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="flex flex-col w-full md:w-80 shrink-0 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 overflow-hidden max-h-[55vh] md:max-h-none rounded-xl md:rounded-none">
        <div className="px-4 md:px-5 py-4 border-b border-gray-100 dark:border-gray-800">

          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-cyan-400 text-gray-700 dark:text-gray-300 transition-colors"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sessions {parcoursTab === "bapteme" ? "de baptême" : "d'affermissement"} en {sectionTab === "active" ? "cours" : "archive"}.
          </p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {[
            { label: "Total", val: stats.total, color: "text-cyan-600" },
            { label: "Année", val: stats.thisYear, color: "text-green-600" },
            { label: "Actives", val: stats.activeSessions, color: "text-blue-600" }
          ].map(s => (
            <div key={s.label} className="py-3 px-2 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
          {scopedRows.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune fiche trouvée</p>}
          {scopedRows.map(row => (
            <button
              key={row.id}
              onClick={() => openSelected(row)}
              className={`w-full text-left px-5 py-4 transition-colors ${
                selected?.id === row.id
                  ? "bg-cyan-50 dark:bg-cyan-900/20 border-r-2 border-r-cyan-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{row.full_name}</p>
                <ChevronRight size={14} className="text-gray-400 shrink-0 ml-2" />
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">Coordinateur: {row.conseiller || "-"}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Début: {fmtDate(row.date_debut)}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  {row.date_fin ? new Date(row.date_fin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "Sans fin"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 p-8 text-center">
            <Droplet size={56} className="opacity-20" />
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Sélectionnez une fiche</p>
              <p className="text-sm text-gray-400">Gérez les dates, le statut et la liste d'absences</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors"
            >
              + Ajouter une fiche
            </button>
          </div>
        ) : (
          <>
            <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.full_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selected.parcours_type === "bapteme" ? "Parcours Baptême" : "Parcours Affermissement"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isArchived(selected) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <Archive size={11} /> Archivé
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setEditForm({ ...selected, ceremony_location: selected.ceremony_location || "" });
                      setShowEdit(true);
                    }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { icon: User, label: "Coordinateur", val: selected.conseiller || "-" },
                      { icon: Calendar, label: "Date de début", val: fmtDate(selected.date_debut) },
                      { icon: Calendar, label: "Date de fin", val: fmtDate(selected.date_fin) },
                      { icon: MapPin, label: "Lieu", val: selected.ceremony_location || selected.address || "-" }
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

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Participants et absences</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vue matricielle par date de séance (comme une feuille d'émargement)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddAttendee(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      <Plus size={14} /> Ajouter participant
                    </button>
                  </div>

                  {showAddAttendee && (
                    <div className="bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-800/50 rounded-2xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">Nouveau participant</p>
                      <input
                        value={attendeeForm.full_name}
                        onChange={e => setAttendeeForm({ ...attendeeForm, full_name: e.target.value })}
                        placeholder="Nom complet *"
                        className={inputCls}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={attendeeForm.phone}
                          onChange={e => setAttendeeForm({ ...attendeeForm, phone: e.target.value })}
                          placeholder="Téléphone"
                          className={inputCls}
                        />
                        <input
                          value={attendeeForm.email}
                          onChange={e => setAttendeeForm({ ...attendeeForm, email: e.target.value })}
                          placeholder="Email"
                          className={inputCls}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowAddAttendee(false)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={addAttendee}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingAttendees ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-cyan-500" />
                    </div>
                  ) : attendees.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
                      <Users size={40} className="opacity-20 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucun participant enregistré</p>
                    </div>
                  ) : sessionDates.length === 0 ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300">
                      Définissez une date de début et une date de fin pour afficher la matrice d'absences.
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto shadow-sm">
                      <table className="min-w-[980px] w-full">
                        <thead>
                          <tr className="bg-gray-900 text-white">
                            <th className="px-3 py-2 text-left text-xs font-semibold sticky left-0 bg-gray-900">Nom</th>
                            {sessionDates.map(date => (
                              <th key={date} className="px-2 py-2 text-center text-xs font-semibold whitespace-nowrap">
                                {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </th>
                            ))}
                            {monthGroups.map(m => (
                              <th key={m} className="px-2 py-2 text-center text-xs font-semibold whitespace-nowrap bg-gray-800">
                                Total {monthLabel(m)}
                              </th>
                            ))}
                            <th className="px-2 py-2 text-center text-xs font-semibold bg-gray-800">Total</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendees.map((a, rowIndex) => (
                            <tr key={a.id} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}>
                              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-inherit">
                                {a.full_name}
                              </td>
                              {sessionDates.map(date => {
                                const present = getPresence(a.id, date);
                                return (
                                  <td key={`${a.id}-${date}`} className="px-2 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={present}
                                      onChange={e => upsertPresence(a.id, date, e.target.checked)}
                                      className="w-4 h-4 accent-green-600"
                                    />
                                  </td>
                                );
                              })}
                              {monthGroups.map(m => (
                                <td key={`${a.id}-${m}`} className="px-2 py-2 text-center text-sm font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50/50 dark:bg-cyan-900/10">
                                  {countMonth(a.id, m)}
                                </td>
                              ))}
                              <td className="px-2 py-2 text-center text-sm font-bold text-gray-900 dark:text-white bg-cyan-50 dark:bg-cyan-900/20">
                                {countTotal(a.id)}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  onClick={() => removeAttendee(a.id)}
                                  className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
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
            </div>
          </>
        )}
      </div>

      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Droplet size={16} className="text-cyan-500" /> Nouvelle fiche
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {([
                ["title", "Titre *", "text"],
                ["coordinator", "Coordinateur", "text"],
                ["address", "Adresse", "text"]
              ] as [string, string, string][]).map(([key, ph, type]) => (
                <input
                  key={key}
                  type={type}
                  placeholder={ph}
                  value={(createForm as any)[key]}
                  onChange={e => setCreateForm({ ...createForm, [key]: e.target.value })}
                  className={inputCls}
                />
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Parcours</label>
                  <select
                    value={createForm.parcours_type}
                    onChange={e => setCreateForm({ ...createForm, parcours_type: e.target.value as ParcoursType })}
                    className={inputCls}
                  >
                    <option value="bapteme">Baptême</option>
                    <option value="affermissement">Affermissement</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Statut</label>
                  <input value="Session en cours" readOnly className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Date de début</label>
                  <input
                    type="date"
                    value={createForm.date_debut}
                    onChange={e => setCreateForm({ ...createForm, date_debut: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Date de fin</label>
                  <input
                    type="date"
                    value={createForm.date_fin}
                    onChange={e => setCreateForm({ ...createForm, date_fin: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <textarea
                placeholder="Description"
                value={createForm.description}
                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
                className={inputCls}
                style={{ resize: "none" }}
              />
              <button
                onClick={createBaptism}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Créer la fiche
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 my-4">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit size={16} className="text-cyan-500" /> Modifier la fiche
              </h2>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setEditForm(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {([
                ["full_name", "Nom complet"],
                ["email", "Email"],
                ["phone", "Téléphone"],
                ["conseiller", "Conseiller"],
                ["ceremony_location", "Lieu de cérémonie"]
              ] as [string, string][]).map(([key, ph]) => (
                <input
                  key={key}
                  placeholder={ph}
                  value={editForm[key] || ""}
                  onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                  className={inputCls}
                />
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Parcours</label>
                  <select
                    value={editForm.parcours_type}
                    onChange={e => setEditForm({ ...editForm, parcours_type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="bapteme">Baptême</option>
                    <option value="affermissement">Affermissement</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Coordinateur</label>
                  <input
                    value={editForm.conseiller || ""}
                    onChange={e => setEditForm({ ...editForm, conseiller: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Date de début</label>
                  <input
                    type="date"
                    value={toDateInputValue(editForm.date_debut)}
                    onChange={e => setEditForm({ ...editForm, date_debut: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Date de fin</label>
                  <input
                    type="date"
                    value={toDateInputValue(editForm.date_fin)}
                    onChange={e => setEditForm({ ...editForm, date_fin: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <textarea
                placeholder="Témoignage"
                value={editForm.temoignage || ""}
                rows={3}
                onChange={e => setEditForm({ ...editForm, temoignage: e.target.value })}
                className={inputCls}
                style={{ resize: "none" }}
              />
              <button
                onClick={saveBaptism}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
