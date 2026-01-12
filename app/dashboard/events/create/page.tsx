"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
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
    // Reset form and loading state when component mounts
    setForm({
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
    setLoading(false);
    setError(null);
  }, []);

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
    setLoading(true);
    setError(null);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("events")
      .insert({
        ...form,
        creator_id: user.id
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/events");
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Créer un événement
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow space-y-4"
        autoComplete="off"
      >
        {error && (
          <p className="text-red-600 font-medium">
            {error}
          </p>
        )}

        <input
          name="title"
          placeholder="Titre"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
          autoComplete="off"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          autoComplete="off"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="event_date"
            value={form.event_date}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
            autoComplete="off"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            autoComplete="off"
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
            autoComplete="off"
          />

          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
            autoComplete="off"
          />
        </div>

        <input
          name="location"
          placeholder="Lieu ou lien"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
          autoComplete="off"
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
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "Création..." : "Créer l'événement"}
        </button>
      </form>
    </div>
  );
}
