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
};

export default function EventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        event_date,
        start_time,
        location,
        is_online,
        color
      `)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5);

    if (error) {
      console.error("Failed to load public events", error);
      setLoading(false);
      return;
    }

    setEvents(data ?? []);
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
    <section className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar size={28} className="text-cyan-600" />
        Prochains événements
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {events.map(event => (
          <div
            key={event.id}
            className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all hover:border-cyan-300"
          >
            <div
              className={`w-full h-2 ${event.color} rounded-full mb-3`}
            />

            <h4 className="font-bold text-gray-800 mb-2">
              {event.title}
            </h4>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock size={12} />
                <span>
                  {new Date(event.event_date).toLocaleDateString(
                    "fr-FR",
                    { day: "numeric", month: "long" }
                  )} · {event.start_time}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                {event.is_online ? (
                  <Video size={12} />
                ) : (
                  <MapPin size={12} />
                )}
                <span className="truncate">
                  {event.is_online ? "En ligne" : event.location}
                </span>
              </div>
            </div>
          </div>
        ))}

        {!events.length && (
          <p className="text-sm text-gray-500 col-span-full">
            Aucun événement à venir pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}
