"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock,
  MapPin, Users, Bell, Edit, Trash2, Loader2, X,
  RefreshCw, Download, FileSpreadsheet, FileText as FilePdf
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  type: string;
  location: string;
  is_online: boolean;
  attendees: number;
  color: string;
  is_recurring: boolean;
  recurring_type: string | null;
  recurring_end_date: string | null;
  creator_id: string;
  created_at: string;
  date: Date;
};

const TYPE_LABELS: Record<string, string> = {
  worship: "Culte",
  formation: "Formation",
  prayer: "Prière",
  youth: "Jeunes",
  baptism: "Baptême",
  leadership: "Leadership",
  special: "Spécial",
  reunion: "Réunion",
};

const RECURRING_LABELS: Record<string, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  yearly: "Annuel",
  none: "Non",
};

// Expand recurring events into virtual occurrences for the given month
function expandEventsForMonth(events: Event[], year: number, month: number): Event[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const result: Event[] = [];

  for (const event of events) {
    const isRecurring =
      event.is_recurring &&
      event.recurring_type &&
      event.recurring_type !== "none";

    if (!isRecurring) {
      // Only include non-recurring events that fall within this month
      const eventDate = new Date(event.event_date);
      if (eventDate >= monthStart && eventDate <= monthEnd) {
        result.push(event);
      }
      continue;
    }

    const eventStart = new Date(event.event_date);
    const recurEnd = event.recurring_end_date
      ? new Date(event.recurring_end_date)
      : monthEnd;

    let current = new Date(eventStart);

    while (current <= monthEnd && current <= recurEnd) {
      if (current >= monthStart) {
        result.push({
          ...event,
          id: `${event.id}_${current.toISOString().split("T")[0]}`,
          date: new Date(current),
          event_date: current.toISOString().split("T")[0],
        });
      }

      const d = new Date(current);
      switch (event.recurring_type) {
        case "daily":
          d.setDate(d.getDate() + 1);
          break;
        case "weekly":
          d.setDate(d.getDate() + 7);
          break;
        case "monthly":
          d.setMonth(d.getMonth() + 1);
          break;
        case "yearly":
          d.setFullYear(d.getFullYear() + 1);
          break;
        default:
          current = new Date(recurEnd.getTime() + 1); // exit loop
          continue;
      }
      current = d;
    }
  }

  return result;
}

export default function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*");
    if (error) { console.error(error); setLoading(false); return; }
    setEvents(data.map((e: any) => ({ ...e, date: new Date(e.event_date) })));
    setLoading(false);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const supabase = createClient();
    // Use base id (strip virtual suffix for recurring occurrences)
    const baseId = id.includes("_") ? id.split("_")[0] : id;
    await supabase.from("events").delete().eq("id", baseId);
    setEvents(prev => prev.filter(e => e.id !== baseId && !e.id.startsWith(baseId + "_")));
    setSelectedEvent(null);
    toast.success("Événement supprimé");
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const expandedEvents = expandEventsForMonth(events, currentDate.getFullYear(), currentDate.getMonth());

  const getEventsForDate = (date: Date) =>
    expandedEvents.filter(e => e.date.toDateString() === date.toDateString());

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

  const calendarDays = [
    ...Array.from({ length: startingDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const upcomingEvents = [...expandedEvents]
    .filter(e => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const today = new Date();

  // ── Export helpers ──────────────────────────────────────────────
  const getMonthEventsForExport = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return expandEventsForMonth(events, year, month)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const exportExcel = () => {
    const monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const evts = getMonthEventsForExport();
    const rows = evts.map((e, i) => ({
      "#": i + 1,
      Titre: e.title,
      "Date début": new Date(e.event_date).toLocaleDateString("fr-FR"),
      "Date fin": e.end_date ? new Date(e.end_date).toLocaleDateString("fr-FR") : new Date(e.event_date).toLocaleDateString("fr-FR"),
      "Heure début": e.start_time,
      "Heure fin": e.end_time,
      Type: TYPE_LABELS[e.type] ?? e.type,
      Lieu: e.location,
      "En ligne": e.is_online ? "Oui" : "Non",
      Participants: e.attendees,
      Récurrent: e.is_recurring ? (RECURRING_LABELS[e.recurring_type ?? ""] ?? e.recurring_type ?? "Oui") : "Non",
      Description: e.description ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, monthLabel);
    XLSX.writeFile(wb, `evenements-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}.xlsx`);
    toast.success("Export Excel téléchargé !");
  };

  const exportPDF = async () => {
    const monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const rows = getMonthEventsForExport();

    // Dynamic import to avoid SSR issues
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.setTextColor(6, 182, 212); // cyan-500
    doc.text(`Événements — ${monthLabel}`, 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 23);

    autoTable(doc, {
      startY: 28,
      head: [["#", "Titre", "Date début", "Heure", "Type", "Lieu", "En ligne", "Participants", "Récurrent"]],
      body: rows.map((e, i) => [
        (i + 1).toString(),
        e.title,
        new Date(e.event_date).toLocaleDateString("fr-FR"),
        `${e.start_time} - ${e.end_time}`,
        TYPE_LABELS[e.type] ?? e.type,
        e.is_online ? e.location : e.location,
        e.is_online ? `Oui — ${e.location}` : "Non",
        e.attendees.toString(),
        e.is_recurring ? (RECURRING_LABELS[e.recurring_type ?? ""] ?? e.recurring_type ?? "Oui") : "Non",
      ]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [6, 182, 212], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 253, 255] },
      columnStyles: { 0: { cellWidth: 8 }, 5: { cellWidth: 36 }, 6: { cellWidth: 36 } },
      theme: "striped",
    });

    doc.save(`evenements-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}.pdf`);
    toast.success("Export PDF téléchargé !");
  };
  // ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-cyan-500" size={32} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Événements
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export buttons */}
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            title="Exporter le mois en Excel"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            title="Exporter le mois en PDF"
          >
            <FilePdf size={15} /> PDF
          </button>
          <button
            onClick={() => router.push("/dashboard/events/create")}
            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} /> Nouvel événement
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {expandedEvents.length} événement{expandedEvents.length !== 1 ? "s" : ""} ce mois
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors font-medium"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-xs py-2 text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === today.toDateString();

            return (
              <div
                key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                className={`border rounded-xl p-1.5 md:p-2 min-h-[60px] md:min-h-[80px] transition-colors ${
                  isToday
                    ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-700"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
              >
                <div className={`font-semibold text-xs md:text-sm mb-1 ${
                  isToday ? "text-cyan-600 dark:text-cyan-400" : "text-gray-700 dark:text-gray-300"
                }`}>
                  {day}
                </div>
                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`${ev.color || "bg-blue-500"} text-white text-xs px-1.5 py-0.5 rounded mb-0.5 cursor-pointer truncate hover:opacity-80 transition-opacity flex items-center gap-0.5`}
                  >
                    {ev.is_recurring && <RefreshCw size={8} className="flex-shrink-0 opacity-80" />}
                    <span className="truncate">{ev.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-base md:text-lg text-gray-800 dark:text-white">
          <Bell size={18} className="text-cyan-500" />
          Événements à venir
        </h3>

        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Aucun événement à venir</p>
        ) : (
          upcomingEvents.map(ev => (
            <div
              key={ev.id}
              className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 md:p-4 mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors"
              onClick={() => setSelectedEvent(ev)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.color || "bg-blue-500"}`} />
                <p className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200">{ev.title}</p>
                {ev.is_recurring && <span title="Récurrent"><RefreshCw size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" /></span>}
              </div>
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Calendar size={12} />
                  {ev.date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Clock size={12} />
                  {ev.start_time} - {ev.end_time}
                </p>
                {ev.location && (
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <MapPin size={12} /> {ev.location}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${selectedEvent.color || "bg-blue-500"}`} />
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h2>
                {selectedEvent.is_recurring && (
                  <span className="flex items-center gap-1 text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full">
                    <RefreshCw size={10} />
                    {selectedEvent.recurring_type}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            {selectedEvent.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2.5 text-sm md:text-base text-gray-700 dark:text-gray-300">
                <Calendar size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span>{selectedEvent.date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm md:text-base text-gray-700 dark:text-gray-300">
                <Clock size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span>{selectedEvent.start_time} - {selectedEvent.end_time}</span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2.5 text-sm md:text-base text-gray-700 dark:text-gray-300">
                  <MapPin size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                  {selectedEvent.is_online && /^https?:\/\//i.test(selectedEvent.location) ? (
                    <a
                      href={selectedEvent.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-700 dark:hover:text-cyan-300 break-all"
                    >
                      {selectedEvent.location}
                    </a>
                  ) : (
                    <span>{selectedEvent.location}</span>
                  )}
                </div>
              )}
              {selectedEvent.attendees > 0 && (
                <div className="flex items-center gap-2.5 text-sm md:text-base text-gray-700 dark:text-gray-300">
                  <Users size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>{selectedEvent.attendees} participants</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const baseId = selectedEvent.id.includes("_") ? selectedEvent.id.split("_")[0] : selectedEvent.id;
                  router.push(`/dashboard/events/${baseId}/edit`);
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
              >
                <Edit size={16} /> Modifier
              </button>
              <button
                onClick={() => deleteEvent(selectedEvent.id)}
                className="px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
