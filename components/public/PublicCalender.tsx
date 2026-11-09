"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import {
  EVENT_COLUMNS,
  expandEvents,
  fmtLongDate,
  fmtTime,
  fmtTimeRange,
  sameDay,
  toDateStr,
  type DbEvent,
  type Occurrence,
} from "@/lib/site/events";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DEFAULT_COLOR = "bg-cyan-600";
const MAX_DESKTOP_TILES = 3;
const SWIPE_THRESHOLD_PX = 50;

/* ------------------------------------------------------------------ */
/* Add-to-calendar                                                     */
/* ------------------------------------------------------------------ */

function compactDateTime(dateStr: string, time: string | null) {
  const hhmm = (time ?? "00:00").slice(0, 5).replace(":", "");
  return `${dateStr.replace(/-/g, "")}T${hhmm}00`;
}

function endDateTime(ev: Occurrence) {
  if (ev.end_time) return compactDateTime(ev.dateStr, ev.end_time);
  // Default to one hour when no end time is set
  const [h, m] = (ev.start_time ?? "00:00").split(":").map(Number);
  const end = new Date(ev.date.getFullYear(), ev.date.getMonth(), ev.date.getDate(), h + 1, m || 0);
  return compactDateTime(toDateStr(end), `${end.getHours()}:${String(end.getMinutes()).padStart(2, "0")}`.padStart(5, "0"));
}

function googleCalendarUrl(ev: Occurrence) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${compactDateTime(ev.dateStr, ev.start_time)}/${endDateTime(ev)}`,
    // Interpret the times above as Morocco local time
    ctz: "Africa/Casablanca",
    details: ev.description ?? "",
    location: ev.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function downloadIcs(ev: Occurrence) {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EEAM Rabat//Calendrier//FR",
    "BEGIN:VEVENT",
    `UID:${ev.key}@eeam-rabat`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Africa/Casablanca:${compactDateTime(ev.dateStr, ev.start_time)}`,
    `DTEND;TZID=Africa/Casablanca:${endDateTime(ev)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    ev.description ? `DESCRIPTION:${icsEscape(ev.description)}` : "",
    ev.location ? `LOCATION:${icsEscape(ev.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^\w\-]+/g, "_").slice(0, 60) || "evenement"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function EventRow({ ev, onOpen, dimmed }: { ev: Occurrence; onOpen: () => void; dimmed?: boolean }) {
  return (
    <button
      onClick={onOpen}
      className={`group w-full flex items-stretch gap-3 text-left rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all overflow-hidden ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      <span className={`w-1.5 shrink-0 ${ev.color || DEFAULT_COLOR}`} />
      <span className="flex-1 min-w-0 py-3 pr-3">
        <span className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white truncate">{ev.title}</span>
          {ev.is_recurring && <RefreshCw size={12} className="text-gray-400 shrink-0" aria-label="Récurrent" />}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} /> {fmtTimeRange(ev)}
          </span>
          {ev.location && (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin size={14} className="shrink-0" /> <span className="truncate">{ev.location}</span>
            </span>
          )}
        </span>
      </span>
      <ChevronRight size={18} className="self-center mr-3 text-gray-300 group-hover:text-gray-500 shrink-0" />
    </button>
  );
}

function CalendarSkeleton() {
  return (
    <section className="p-4 sm:p-8 animate-pulse" aria-busy="true" aria-label="Chargement du calendrier">
      <div className="flex justify-between mb-8">
        <div className="h-9 w-48 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-11 w-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="h-12 sm:h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function PublicCalendar() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null); // first day of displayed month
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "agenda">("month");
  const [openEvent, setOpenEvent] = useState<Occurrence | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setToday(t);
    setSelectedDay(t);
    setMonth(new Date(t.getFullYear(), t.getMonth(), 1));

    (async () => {
      const supabase = createClient();
      const cutoff = toDateStr(new Date(now.getFullYear() - 2, now.getMonth(), 1));
      const { data, error } = await supabase
        .from("events")
        .select(EVENT_COLUMNS)
        // Recent/future one-off events + every recurring series (may have started long ago)
        .or(`event_date.gte.${cutoff},is_recurring.eq.true`);

      if (error) {
        console.error("Error fetching events:", error);
        toast.error("Impossible de charger le calendrier des événements.");
      } else {
        setEvents((data ?? []) as DbEvent[]);
      }
      setLoading(false);
    })();
  }, []);

  // Escape closes the detail sheet; lock page scroll while it's open
  useEffect(() => {
    if (!openEvent) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenEvent(null);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openEvent]);

  // 6-week grid, Monday first
  const gridDays = useMemo(() => {
    if (!month) return [];
    const offset = (month.getDay() + 6) % 7;
    const first = new Date(month.getFullYear(), month.getMonth(), 1 - offset);
    return Array.from({ length: 42 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
  }, [month]);

  const occurrences = useMemo(
    () => (gridDays.length ? expandEvents(events, gridDays[0], gridDays[gridDays.length - 1]) : []),
    [events, gridDays]
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of occurrences) {
      const list = map.get(o.dateStr);
      if (list) list.push(o);
      else map.set(o.dateStr, [o]);
    }
    return map;
  }, [occurrences]);

  if (loading || !month || !today || !selectedDay) return <CalendarSkeleton />;

  const monthEvents = occurrences.filter((o) => o.date.getMonth() === month.getMonth() && o.date.getFullYear() === month.getFullYear());
  const selectedEvents = byDay.get(toDateStr(selectedDay)) ?? [];
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  const goToMonth = (offset: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    const isTodayMonth = next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth();
    setSelectedDay(isTodayMonth ? today : next);
  };

  const goToday = () => {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today);
  };

  const selectDay = (d: Date) => {
    if (d.getMonth() !== month.getMonth()) {
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    setSelectedDay(d);
  };

  // Agenda view: group the month's events by day
  const agendaGroups: { date: Date; items: Occurrence[] }[] = [];
  for (const o of monthEvents) {
    const last = agendaGroups[agendaGroups.length - 1];
    if (last && sameDay(last.date, o.date)) last.items.push(o);
    else agendaGroups.push({ date: o.date, items: [o] });
  }

  const monthLabel = `${MONTHS[month.getMonth()].charAt(0).toUpperCase()}${MONTHS[month.getMonth()].slice(1)} ${month.getFullYear()}`;

  return (
    <section className="p-3 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
            <CalendarDays size={26} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">{monthLabel}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {monthEvents.length === 0
                ? "Aucun événement ce mois-ci"
                : `${monthEvents.length} événement${monthEvents.length > 1 ? "s" : ""} ce mois-ci`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800" role="tablist" aria-label="Affichage">
            {([
              ["month", "Mois", LayoutGrid],
              ["agenda", "Agenda", List],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                role="tab"
                aria-selected={view === value}
                onClick={() => setView(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === value
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            <button
              onClick={() => goToMonth(-1)}
              aria-label="Mois précédent"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToday}
              disabled={isCurrentMonth && sameDay(selectedDay, today)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-default transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => goToMonth(1)}
              aria-label="Mois suivant"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {view === "month" ? (
        <>
          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
            {WEEKDAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid (swipe to change month on touch devices) */}
          <div
            className="grid grid-cols-7 gap-1 sm:gap-2"
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const delta = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) goToMonth(delta > 0 ? -1 : 1);
            }}
          >
            {gridDays.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const isToday = sameDay(d, today);
              const isSelected = sameDay(d, selectedDay);
              const isPast = d < today;
              const dayEvents = byDay.get(toDateStr(d)) ?? [];

              return (
                <div
                  key={d.getTime()}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}${dayEvents.length ? ` — ${dayEvents.length} événement${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                  onClick={() => selectDay(d)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectDay(d);
                    }
                  }}
                  className={`relative min-h-[52px] sm:min-h-[112px] rounded-xl sm:rounded-2xl border p-1 sm:p-2 text-left cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50/70 dark:bg-cyan-900/20 shadow-sm"
                      : inMonth
                        ? "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                        : "border-transparent bg-gray-50/60 dark:bg-gray-800/30"
                  }`}
                >
                  <div className="flex justify-center sm:justify-start">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs sm:text-sm font-bold ${
                        isToday
                          ? "bg-cyan-600 text-white"
                          : !inMonth
                            ? "text-gray-300 dark:text-gray-600"
                            : isPast
                              ? "text-gray-400 dark:text-gray-500"
                              : "text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </div>

                  {/* Desktop: event chips */}
                  <div className="hidden sm:flex flex-col gap-1 mt-1">
                    {dayEvents.slice(0, MAX_DESKTOP_TILES).map((ev) => (
                      <button
                        key={ev.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(d);
                          setOpenEvent(ev);
                        }}
                        title={`${fmtTimeRange(ev)} · ${ev.title}`}
                        className={`${ev.color || DEFAULT_COLOR} ${!inMonth || isPast ? "opacity-60" : ""} text-white text-[11px] font-semibold px-2 py-1 rounded-lg w-full text-left truncate hover:brightness-110 transition`}
                      >
                        {ev.start_time && <span className="opacity-80 mr-1">{fmtTime(ev.start_time)}</span>}
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > MAX_DESKTOP_TILES && (
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-1">
                        +{dayEvents.length - MAX_DESKTOP_TILES} autre{dayEvents.length - MAX_DESKTOP_TILES > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Mobile: dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex sm:hidden justify-center gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span key={ev.key} className={`${ev.color || DEFAULT_COLOR} w-1.5 h-1.5 rounded-full ${!inMonth ? "opacity-50" : ""}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day panel */}
          <div className="mt-6 sm:mt-8" aria-live="polite">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              {sameDay(selectedDay, today) ? "Aujourd'hui · " : ""}
              {fmtLongDate(selectedDay)}
            </h3>
            {selectedEvents.length ? (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((ev) => (
                  <EventRow key={ev.key} ev={ev} onOpen={() => setOpenEvent(ev)} dimmed={selectedDay < today} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-5 text-center">
                Aucun événement ce jour.
              </p>
            )}
          </div>
        </>
      ) : (
        /* Agenda view */
        <div className="flex flex-col gap-6">
          {agendaGroups.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-10 text-center">
              Aucun événement prévu en {MONTHS[month.getMonth()]}.
            </p>
          ) : (
            agendaGroups.map(({ date, items }) => {
              const past = date < today;
              const isToday = sameDay(date, today);
              return (
                <div key={date.getTime()} className="flex gap-3 sm:gap-5">
                  <div className={`w-12 sm:w-14 shrink-0 text-center ${past ? "opacity-50" : ""}`}>
                    <div className="text-[11px] font-bold uppercase text-gray-400">
                      {date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}
                    </div>
                    <div
                      className={`mx-auto mt-0.5 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-black ${
                        isToday ? "bg-cyan-600 text-white" : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {items.map((ev) => (
                      <EventRow key={ev.key} ev={ev} onOpen={() => setOpenEvent(ev)} dimmed={past} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Event detail: bottom sheet on mobile, dialog on desktop */}
      {openEvent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm sm:p-4"
          onClick={() => setOpenEvent(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className={`h-2 ${openEvent.color || DEFAULT_COLOR}`} />
            <div className="sm:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />

            <button
              onClick={() => setOpenEvent(null)}
              aria-label="Fermer"
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              {openEvent.is_recurring && (
                <span className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <RefreshCw size={12} /> Événement récurrent
                </span>
              )}
              <h3 id="event-title" className="pr-10 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {openEvent.title}
              </h3>

              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200">
                <li className="flex items-start gap-3">
                  <CalendarDays size={20} className="mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="font-semibold">{fmtLongDate(openEvent.date)}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={20} className="mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="font-semibold">{fmtTimeRange(openEvent)}</span>
                </li>
                {openEvent.location && (
                  <li className="flex items-start gap-3">
                    <MapPin size={20} className="mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(openEvent.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold break-words hover:underline"
                    >
                      {openEvent.location}
                    </a>
                  </li>
                )}
              </ul>

              {openEvent.description && (
                <p className="mt-5 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{openEvent.description}</p>
              )}

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={googleCalendarUrl(openEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-colors"
                >
                  <ExternalLink size={18} /> Google Agenda
                </a>
                <button
                  onClick={() => downloadIcs(openEvent)}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Download size={18} /> Apple / Outlook (.ics)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
