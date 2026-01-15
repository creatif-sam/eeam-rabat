"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X // Added for a better close experience
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
      .select("id,title,description,event_date,start_time,end_time,location,color");

    if (data) {
      setEvents(data.map(e => ({ ...e, date: new Date(e.event_date) })));
    }
    setLoading(false);
  };

  if (loading || !currentDate || !today) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-800 text-gray-500 animate-pulse">
        Chargement du calendrier...
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

  const getEventsForDate = (date: Date) =>
    events.filter(e => e.date.toDateString() === date.toDateString());

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const calendarDays = [...Array.from({ length: startingDayOfWeek }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <section className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-8 mt-8 sm:mt-12 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Calendar className="text-primary h-6 w-6" />
            Calendrier de l’église
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square opacity-0" />;

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = date.toDateString() === today.toDateString();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
              className={`min-h-[80px] sm:min-h-[110px] border rounded-2xl p-2 transition-all relative ${
                isToday
                  ? "bg-primary/5 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] dark:bg-primary/10"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className={`font-bold text-sm mb-2 ${isToday ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                {day}
              </div>

              <div className="space-y-1">
                {dayEvents.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`${ev.color} text-white text-[9px] sm:text-[11px] font-medium px-2 py-1 rounded-lg w-full text-left truncate hover:brightness-110 transition-all shadow-sm`}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-4 ${selectedEvent.color}`}>
              Événement
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              {selectedEvent.title}
            </h3>

            {selectedEvent.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-primary">
                  <Clock size={18} />
                </div>
                <span className="font-semibold">{selectedEvent.start_time} — {selectedEvent.end_time}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-primary">
                  <MapPin size={18} />
                </div>
                <span className="font-semibold">{selectedEvent.location}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-8 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-90 transition-opacity"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}