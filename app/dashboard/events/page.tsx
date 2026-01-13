"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Bell,
  Video,
  Edit,
  Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  type: string;
  location: string;
  is_online: boolean;
  attendees: number;
  color: string;
  is_recurring: boolean;
  creator_id: string;
  created_at: string;
  date: Date;
};

export default function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);
 
  const router = useRouter();


  const fetchEvents = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*");

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const mapped = data.map((e: any) => ({
      ...e,
      date: new Date(e.event_date)
    }));

    setEvents(mapped);
    setLoading(false);
  };

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

  const getEventsForDate = (date: Date) => {
    return events.filter(
      e => e.date.toDateString() === date.toDateString()
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ];

  const dayNames = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

  const calendarDays = [
    ...Array.from({ length: startingDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const upcomingEvents = [...events]
    .filter(e => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (loading) {
    return <p>Loading events...</p>;
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Gestion des Événements</h1>
       <button
  onClick={() => router.push("/dashboard/events/create")}
  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm md:text-base"
>
  <Plus size={18} />
  Nouvel événement
</button>

      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
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
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ChevronLeft size={16} />
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
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center font-semibold text-xs md:text-sm py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`}
                />
              );
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );

            const dayEvents = getEventsForDate(date);

            return (
              <div
                key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                className="border rounded-lg p-1 md:p-2 bg-white min-h-[60px] md:min-h-[80px]"
              >
                <div className="font-semibold text-xs md:text-sm mb-1">
                  {day}
                </div>

                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`${ev.color} text-white text-xs px-1 md:px-2 py-1 rounded mb-1 cursor-pointer truncate`}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-base md:text-lg">
          <Bell size={18} />
          Événements à venir
        </h3>

        {upcomingEvents.map(ev => (
          <div
            key={ev.id}
            className="border rounded-xl p-3 md:p-4 mb-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedEvent(ev)}
          >
            <p className="font-semibold text-sm md:text-base mb-2">{ev.title}</p>
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                <Calendar size={12} />
                {ev.date.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                <Clock size={12} />
                {ev.start_time} - {ev.end_time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              {selectedEvent.title}
            </h2>

            <p className="text-gray-600 mb-4 text-sm md:text-base">
              {selectedEvent.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Calendar size={16} />
                <span>{selectedEvent.date.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Clock size={16} />
                <span>{selectedEvent.start_time} - {selectedEvent.end_time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <MapPin size={16} />
                <span>{selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Users size={16} />
                <span>{selectedEvent.attendees} participants</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  router.push(`/dashboard/events/${selectedEvent.id}/edit`)
                }
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base font-medium"
              >
                <Edit size={16} />
                Modifier
              </button>

              <button className="bg-gray-200 p-3 rounded-xl flex items-center justify-center">
                <Trash2 size={16} />
              </button>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 text-sm text-gray-500 w-full text-center py-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
