"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X,
  ExternalLink,
  Loader2,
  RefreshCw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Parses a "YYYY-MM-DD" string as a local calendar date (avoids the UTC
// midnight shift that `new Date("YYYY-MM-DD")` introduces for timezones
// behind UTC, which can place an event on the wrong day in the grid).
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // Format: YYYY-MM-DD
  start_time: string; // Format: HH:MM
  end_time: string;   // Format: HH:MM
  location: string;
  color: string;
  is_recurring: boolean;
  recurring_type: string | null;
  recurring_end_date: string | null;
  date: Date;
};

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
      const eventDate = parseLocalDate(event.event_date);
      if (eventDate >= monthStart && eventDate <= monthEnd) result.push(event);
      continue;
    }

    const eventStart = parseLocalDate(event.event_date);
    const recurEnd = event.recurring_end_date
      ? parseLocalDate(event.recurring_end_date)
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
        case "daily":   d.setDate(d.getDate() + 1); break;
        case "weekly":  d.setDate(d.getDate() + 7); break;
        case "monthly": d.setMonth(d.getMonth() + 1); break;
        case "yearly":  d.setFullYear(d.getFullYear() + 1); break;
        default: current = new Date(recurEnd.getTime() + 1); continue;
      }
      current = d;
    }
  }
  return result;
}

export default function PublicCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dayEventsList, setDayEventsList] = useState<Event[] | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const supabase = createClient();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const cutoff = twoYearsAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("events")
      .select("id,title,description,event_date,start_time,end_time,location,color,is_recurring,recurring_type,recurring_end_date")
      // Keep recent/future one-off events plus all recurring events
      // (a recurring series can still be active today even if it started
      // years ago, so it must not be excluded by the date cutoff).
      .or(`event_date.gte.${cutoff},is_recurring.eq.true`);

    if (error) {
      console.error("Error fetching events:", error);
      toast.error("Impossible de charger le calendrier des événements.");
    } else if (data) {
      setEvents(data.map(e => ({ ...e, date: parseLocalDate(e.event_date) })));
    }
    setLoading(false);
  };

  // Helper: Create Google Calendar URL
  const getGoogleCalendarUrl = (event: Event) => {
    const base = "https://www.google.com/calendar/render?action=TEMPLATE";
    const fmtDate = event.event_date.replace(/-/g, "");
    const fmtStart = event.start_time.replace(/:/g, "");
    const fmtEnd = event.end_time.replace(/:/g, "");
    
    const dates = `${fmtDate}T${fmtStart}00/${fmtDate}T${fmtEnd}00`;

    // ctz tells Google Calendar to interpret the date/time above as
    // Morocco local time instead of UTC, otherwise the saved event shows
    // up at the wrong hour in the visitor's calendar.
    return `${base}&text=${encodeURIComponent(event.title)}&dates=${dates}&ctz=${encodeURIComponent("Africa/Casablanca")}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location)}`;
  };

  if (loading || !currentDate || !today) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Chargement du calendrier...</p>
      </div>
    );
  }

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
  const calendarDays = [...Array.from({ length: startingDayOfWeek }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-10 transition-all duration-300">
      
      {/* HEADER: Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-10">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar className="text-primary h-7 w-7" />
            </div>
            Événements
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold px-1">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="font-medium">Couleur = événement</span>
          <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
          <span>Cliquez pour voir</span>
        </div>

        <div className="flex gap-3 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            aria-label="Mois précédent"
            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:shadow-sm transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:shadow-sm transition-all text-sm font-bold"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            aria-label="Mois suivant"
            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:shadow-sm transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* GRID: Day Names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-6 mb-2 sm:mb-4 px-0 sm:px-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-black text-[9px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-400 dark:text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* GRID: Calendar Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-4">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square opacity-0" />;

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = date.toDateString() === today.toDateString();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
              className={`min-h-[46px] sm:min-h-[110px] border-2 rounded-xl sm:rounded-3xl p-1 sm:p-3 transition-all relative group ${
                isToday
                  ? "bg-primary/[0.03] border-primary shadow-lg shadow-primary/5 dark:bg-primary/5"
                  : "bg-white dark:bg-gray-900 border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md"
              }`}
            >
              <div className={`font-black text-[10px] sm:text-lg mb-1 sm:mb-2 ${isToday ? "text-primary" : "text-gray-400 dark:text-gray-600"}`}>
                {day}
              </div>

              {/* Desktop: full event tiles */}
              <div className="hidden sm:flex flex-col gap-1.5">
                {dayEvents.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`${ev.color} text-white text-[11px] font-bold px-2 py-1.5 rounded-xl w-full text-left truncate hover:scale-[1.03] transition-transform shadow-sm`}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>

              {/* Mobile: colored dot indicators */}
              <div className="flex sm:hidden flex-wrap gap-0.5 mt-0.5">
                {dayEvents.slice(0, 3).map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="relative flex-shrink-0"
                    title={ev.title}
                  >
                    <span className={`${ev.color} w-2 h-2 rounded-full block`} />
                    {ev.is_recurring && (
                      <span className="absolute -top-1 -right-1 text-[6px] text-gray-400">↻</span>
                    )}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    onClick={() => setDayEventsList(dayEvents)}
                    className="text-[8px] text-gray-400 leading-none underline"
                  >
                    +{dayEvents.length - 3}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Event Details */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-10 w-full max-w-xl shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
            
            {/* Decorative background element */}
            <div className={`absolute top-0 left-0 w-full h-2 ${selectedEvent.color}`} />

            <button
              onClick={() => setSelectedEvent(null)}
              aria-label="Fermer"
              className="absolute top-8 right-8 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-6 shadow-md ${selectedEvent.color}`}>
                {selectedEvent.is_recurring ? <><RefreshCw size={10} /> Récurrent</> : "Événement Paroisse"}
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                {selectedEvent.title}
              </h3>
            </div>

            {selectedEvent.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                {selectedEvent.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200">
                <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-primary">
                  <Clock size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Horaire</span>
                  <span className="font-bold">{selectedEvent.start_time} — {selectedEvent.end_time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200">
                <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-primary">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Lieu</span>
                  <span className="font-bold truncate max-w-[150px]">{selectedEvent.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <a
                href={getGoogleCalendarUrl(selectedEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-5 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-lg shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:-translate-y-1 transition-all"
              >
                <ExternalLink size={20} />
                Ajouter à mon Agenda
              </a>
              
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-4 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Retour au calendrier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Day overflow list (mobile) */}
      {dayEventsList && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Événements du jour</h3>
              <button
                onClick={() => setDayEventsList(null)}
                aria-label="Fermer"
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {dayEventsList.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => { setSelectedEvent(ev); setDayEventsList(null); }}
                  className={`${ev.color} text-white text-sm font-bold px-3 py-2.5 rounded-xl w-full text-left truncate hover:scale-[1.02] transition-transform shadow-sm`}
                >
                  {ev.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}