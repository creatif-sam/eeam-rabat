"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  color: string;
  date: Date;
};

export default function PublicCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from("events")
      .select(
        "id,title,description,event_date,start_time,end_time,location,color"
      );

    if (data) {
      setEvents(
        data.map(e => ({
          ...e,
          date: new Date(e.event_date)
        }))
      );
    }

    setLoading(false);
  };

  if (loading || !currentDate || !today) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow">
        Chargement du calendrier...
      </div>
    );
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay()
    };
  };

  const getEventsForDate = (date: Date) =>
    events.filter(e => e.date.toDateString() === date.toDateString());

  const { daysInMonth, startingDayOfWeek } =
    getDaysInMonth(currentDate);

  const monthNames = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ];

  const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

  const calendarDays = [
    ...Array.from({ length: startingDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mt-8 sm:mt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-cyan-600" />
            Calendrier de l’église
          </h2>
          <p className="text-gray-600 text-sm">
            {monthNames[currentDate.getMonth()]}{" "}
            {currentDate.getFullYear()}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1
                )
              )
            }
            className="p-2 rounded-lg border hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1
                )
              )
            }
            className="p-2 rounded-lg border hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-xs sm:text-sm">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center font-semibold"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
              />
            );
          }

          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );

          const isToday =
            date.toDateString() === today.toDateString();

          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
              className={`border rounded-lg p-1.5 sm:p-2 transition text-xs sm:text-sm ${
                isToday
                  ? "bg-cyan-50 border-cyan-400 ring-2 ring-cyan-300"
                  : "bg-slate-50"
              }`}
            >
              <div className="font-semibold mb-1">
                {day}
              </div>

              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`${ev.color} text-white text-[10px] sm:text-xs px-2 py-1 rounded mb-1 cursor-pointer truncate`}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Event modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              {selectedEvent.title}
            </h3>

            {selectedEvent.description && (
              <p className="text-gray-600 mb-4 text-sm">
                {selectedEvent.description}
              </p>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <Clock size={14} />
                {selectedEvent.start_time}{" "}
                {selectedEvent.end_time}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} />
                {selectedEvent.location}
              </p>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 text-sm text-gray-500"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
