"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import type { Baptism, Attendee, PresenceRecord, ParcoursType, SectionTab } from "@/components/baptemes/bapteme.types";
import { buildSessionDates, isArchived, monthKey } from "@/components/baptemes/bapteme.types";
import BaptemeHeader from "@/components/baptemes/BaptemeHeader";
import SessionList from "@/components/baptemes/SessionList";
import SessionDetailHeader from "@/components/baptemes/SessionDetailHeader";
import SessionStatsCards from "@/components/baptemes/SessionStatsCards";
import AttendancePanel from "@/components/baptemes/AttendancePanel";
import type { AttendeeFormData } from "@/components/baptemes/AttendancePanel";
import CreateSessionModal from "@/components/baptemes/CreateSessionModal";
import type { CreateForm } from "@/components/baptemes/CreateSessionModal";
import EditSessionModal from "@/components/baptemes/EditSessionModal";
import type { EditForm } from "@/components/baptemes/EditSessionModal";

const DEFAULT_CREATE_FORM: CreateForm = {
  title: "",
  description: "",
  coordinator: "",
  address: "",
  parcours_type: "bapteme",
  date_debut: "",
  date_fin: "",
};

export default function BaptemesTab() {
  const supabase = createClient();

  // ── Core data ────────────────────────────────────────────────────────────
  const [baptisms, setBaptisms] = useState<Baptism[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filter / navigation state ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [parcoursTab, setParcoursTab] = useState<ParcoursType>("bapteme");
  const [sectionTab, setSectionTab] = useState<SectionTab>("active");
  const [selected, setSelected] = useState<Baptism | null>(null);

  // ── Attendance state ──────────────────────────────────────────────────────
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [presenceRecords, setPresenceRecords] = useState<PresenceRecord[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [attendeeForm, setAttendeeForm] = useState<AttendeeFormData>({ full_name: "", phone: "", email: "" });

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(DEFAULT_CREATE_FORM);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBaptisms(); }, []);

  // ── Data handlers ─────────────────────────────────────────────────────────
  const fetchBaptisms = async () => {
    const { data } = await supabase
      .from("baptisms")
      .select("*")
      .order("date_demande", { ascending: false });
    setBaptisms((data as Baptism[]) || []);
    setLoading(false);
  };

  const loadAttendeesAndPresence = async (baptismId: string) => {
    setLoadingAttendees(true);
    const [{ data: attendeesData }, { data: recordsData }] = await Promise.all([
      supabase
        .from("baptism_attendees")
        .select("id, baptism_id, full_name, phone, email, note, created_at")
        .eq("baptism_id", baptismId)
        .order("created_at"),
      supabase
        .from("baptism_presence_records")
        .select("id, baptism_id, attendee_id, session_date, present")
        .eq("baptism_id", baptismId),
    ]);
    setAttendees((attendeesData as Attendee[]) || []);
    setPresenceRecords((recordsData as PresenceRecord[]) || []);
    setLoadingAttendees(false);
  };

  const upsertPresence = async (attendeeId: string, sessionDate: string, present: boolean) => {
    if (!selected) return;
    const { error } = await supabase.from("baptism_presence_records").upsert(
      { baptism_id: selected.id, attendee_id: attendeeId, session_date: sessionDate, present },
      { onConflict: "baptism_id,attendee_id,session_date" }
    );
    if (error) { toast.error("Impossible d'enregistrer la présence."); return; }
    setPresenceRecords(prev => {
      const idx = prev.findIndex(
        r => r.baptism_id === selected.id && r.attendee_id === attendeeId && r.session_date === sessionDate
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], present };
        return next;
      }
      return [...prev, { id: `${selected.id}-${attendeeId}-${sessionDate}`, baptism_id: selected.id, attendee_id: attendeeId, session_date: sessionDate, present }];
    });
  };

  const addAttendee = async () => {
    if (!selected || !attendeeForm.full_name.trim()) { toast.error("Le nom est requis"); return; }
    const { error } = await supabase.from("baptism_attendees").insert({
      baptism_id: selected.id,
      full_name: attendeeForm.full_name,
      phone: attendeeForm.phone || null,
      email: attendeeForm.email || null,
    });
    if (error) { toast.error("Erreur lors de l'ajout"); return; }
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
    if (!createForm.title.trim()) { toast.error("Le titre est requis"); return; }
    if (!createForm.date_debut || !createForm.date_fin) { toast.error("Veuillez renseigner les dates."); return; }
    if (new Date(createForm.date_fin) < new Date(createForm.date_debut)) { toast.error("La date de fin doit être après la date de début."); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Non authentifié"); setSaving(false); return; }
    const { error } = await supabase.from("baptisms").insert({
      full_name: createForm.title,
      email: null, phone: null, age: null,
      temoignage: createForm.description || null,
      address: createForm.address || null,
      conseiller: createForm.coordinator || null,
      parcours_type: createForm.parcours_type,
      date_debut: createForm.date_debut,
      date_fin: createForm.date_fin,
      creator_id: user.id,
      creator_email: user.email,
    });
    setSaving(false);
    if (error) { toast.error("Erreur lors de la création"); return; }
    toast.success("Demande créée !");
    setShowCreate(false);
    setCreateForm(DEFAULT_CREATE_FORM);
    fetchBaptisms();
  };

  const saveBaptism = async () => {
    if (!editForm) return;
    if (!editForm.date_debut || !editForm.date_fin) { toast.error("Date de début et date de fin requises."); return; }
    if (new Date(editForm.date_fin) < new Date(editForm.date_debut)) { toast.error("La date de fin doit être après la date de début."); return; }
    setSaving(true);
    const { error } = await supabase.from("baptisms").update({
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone || null,
      temoignage: editForm.temoignage || null,
      parcours_type: editForm.parcours_type,
      date_debut: editForm.date_debut,
      date_fin: editForm.date_fin,
      date_bapteme: editForm.date_bapteme || null,
      ceremony_location: editForm.ceremony_location || null,
      conseiller: editForm.conseiller || null,
    }).eq("id", editForm.id);
    setSaving(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Demande mise à jour !");
    const updated = { ...editForm } as Baptism;
    setBaptisms(prev => prev.map(row => (row.id === updated.id ? updated : row)));
    if (selected?.id === updated.id) setSelected(updated);
    setShowEdit(false);
    setEditForm(null);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const scopedRows = useMemo(() => {
    return baptisms.filter(row => {
      if (row.parcours_type !== parcoursTab) return false;
      const archived = isArchived(row);
      if (sectionTab === "active" && archived) return false;
      if (sectionTab === "archive" && !archived) return false;
      return (
        row.full_name.toLowerCase().includes(search.toLowerCase()) ||
        row.email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [baptisms, parcoursTab, sectionTab, search]);

  useEffect(() => {
    if (selected && !scopedRows.some(r => r.id === selected.id)) setSelected(null);
  }, [scopedRows, selected]);

  const year = new Date().getFullYear();
  const listStats = {
    total: scopedRows.length,
    thisYear: scopedRows.filter(r => new Date(r.date_demande).getFullYear() === year).length,
    activeSessions: scopedRows.filter(r => !isArchived(r)).length,
  };

  const sessionDates = useMemo(
    () => buildSessionDates(selected?.date_debut, selected?.date_fin),
    [selected?.date_debut, selected?.date_fin]
  );

  const monthGroups = useMemo(
    () => Array.from(new Set(sessionDates.map(monthKey))),
    [sessionDates]
  );

  const totalPresences = useMemo(
    () => (selected ? presenceRecords.filter(r => r.baptism_id === selected.id && r.present).length : 0),
    [presenceRecords, selected]
  );

  const totalAbsences = useMemo(
    () => (selected ? attendees.length * sessionDates.length - totalPresences : 0),
    [attendees, sessionDates, totalPresences, selected]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <BaptemeHeader
        parcoursTab={parcoursTab}
        sectionTab={sectionTab}
        onParcoursChange={setParcoursTab}
        onSectionChange={setSectionTab}
        onNewClick={() => setShowCreate(true)}
      />

      <div className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 140px)" }}>
        <SessionList
          rows={scopedRows}
          selected={selected}
          stats={listStats}
          search={search}
          onSearch={setSearch}
          onSelect={openSelected}
        />


        <main className="flex-1 min-w-0 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          {!selected ? (
            <div className="flex flex-col items-center justify-center gap-4 h-full py-24 px-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Loader2 size={36} className="text-cyan-400 opacity-40" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                Sélectionnez une session dans la liste pour afficher les détails et la feuille de présences.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 md:p-6">

              <SessionDetailHeader
                selected={selected}
                sessionDates={sessionDates}
                attendees={attendees}
                onEdit={() => { setEditForm({ ...selected, ceremony_location: selected.ceremony_location ?? "" }); setShowEdit(true); }}
                onClose={() => setSelected(null)}
              />

              <SessionStatsCards
                totalPresences={totalPresences}
                totalAbsences={totalAbsences}
                attendeesCount={attendees.length}
                sessionDatesCount={sessionDates.length}
              />

              <AttendancePanel
                attendees={attendees}
                presenceRecords={presenceRecords}
                sessionDates={sessionDates}
                monthGroups={monthGroups}
                loadingAttendees={loadingAttendees}
                showAddAttendee={showAddAttendee}
                attendeeForm={attendeeForm}
                onToggleAddForm={() => setShowAddAttendee(v => !v)}
                onFormChange={setAttendeeForm}
                onAddAttendee={addAttendee}
                onRemoveAttendee={removeAttendee}
                onUpsertPresence={upsertPresence}
              />
            </div>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateSessionModal
          form={createForm}
          saving={saving}
          onFormChange={setCreateForm}
          onSubmit={createBaptism}
          onClose={() => { setShowCreate(false); setCreateForm(DEFAULT_CREATE_FORM); }}
        />
      )}

      {showEdit && editForm && (
        <EditSessionModal
          editForm={editForm}
          saving={saving}
          onFormChange={setEditForm}
          onSubmit={saveBaptism}
          onClose={() => { setShowEdit(false); setEditForm(null); }}
        />
      )}
    </div>
  );
}
