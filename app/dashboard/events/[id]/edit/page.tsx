"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    type: "worship",
    location: "",
    is_online: false,
    attendees: 0,
    color: "bg-blue-500",
    is_recurring: false
  });

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setForm({
      title: data.title,
      description: data.description ?? "",
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      type: data.type,
      location: data.location,
      is_online: data.is_online,
      attendees: data.attendees,
      color: data.color,
      is_recurring: data.is_recurring
    });

    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("events")
      .update(form)
      .eq("id", eventId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/events");
  };

  if (loading) {
    return <p>Loading event...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Modifier l événement
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow space-y-4"
      >
        {error && (
          <p className="text-red-600 font-medium">
            {error}
          </p>
        )}

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="event_date"
            value={form.event_date}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="worship">Culte</option>
            <option value="formation">Formation</option>
            <option value="prayer">Prière</option>
            <option value="youth">Jeunes</option>
            <option value="baptism">Baptême</option>
            <option value="leadership">Leadership</option>
            <option value="special">Spécial</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />

          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />
        </div>

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_online"
              checked={form.is_online}
              onChange={handleChange}
            />
            En ligne
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_recurring"
              checked={form.is_recurring}
              onChange={handleChange}
            />
            Récurrent
          </label>
        </div>

        <button
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
        >
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
