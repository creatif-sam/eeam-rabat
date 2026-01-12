"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  location: string;
  is_online: boolean;
  color: string;
  date: Date;
};

export default function EventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const supabase = createClient();
    const today = new Date();

    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,event_date,start_time,location,is_online,color"
      );

    if (error || !data) {
      console.error("Failed to load events", error);
      setLoading(false);
      return;
    }

    const upcoming = data
      .map(e => ({
        ...e,
        date: new Date(e.event_date)
      }))
      .filter(e => e.date >= new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ))
      .sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      )
      .slice(0, 5);

    setEvents(upcoming);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8">
        Chargement des événements...
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="text-cyan-600" />
        Prochains événements
      </h2>

      {!events.length && (
        <p className="text-sm text-gray-500">
          Aucun événement à venir pour le moment.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map(event => (
          <div
            key={event.id}
            className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all"
          >
            <div
              className={`w-full h-2 ${event.color} rounded-full mb-3`}
            />

            <h4 className="font-bold text-gray-800 mb-2">
              {event.title}
            </h4>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={12} />
                {event.date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                })} · {event.start_time}
              </div>

              <div className="flex items-center gap-2">
                {event.is_online ? (
                  <Video size={12} />
                ) : (
                  <MapPin size={12} />
                )}
                {event.is_online
                  ? "En ligne"
                  : event.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
