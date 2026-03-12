"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-xl outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm";
const labelCls = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", event_date: "", end_date: "",
    start_time: "", end_time: "",
    type: "worship", location: "", is_online: false, attendees: 0,
    color: "bg-blue-500", is_recurring: false,
    recurring_type: "none", recurring_end_date: ""
  });

  useEffect(() => {
    setForm({
      title: "", description: "", event_date: "", end_date: "",
      start_time: "", end_time: "",
      type: "worship", location: "", is_online: false, attendees: 0,
      color: "bg-blue-500", is_recurring: false,
      recurring_type: "none", recurring_end_date: ""
    });
    setLoading(false);
    setError(null);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Non authentifié"); setLoading(false); return; }

    const payload: Record<string, any> = { ...form, creator_id: user.id };
    if (!payload.end_date) payload.end_date = null;
    if (!form.is_recurring) {
      payload.recurring_type = "none";
      payload.recurring_end_date = null;
    } else if (!payload.recurring_end_date) {
      payload.recurring_end_date = null;
    }

    const { error: insertError } = await supabase.from("events").insert(payload);
    if (insertError) { setError(insertError.message); setLoading(false); return; }
    toast.success("Événement créé !");
    router.push("/dashboard/events");
  };

  const EVENT_COLORS = [
    { label: "Bleu", value: "bg-blue-500" }, { label: "Cyan", value: "bg-cyan-500" },
    { label: "Vert", value: "bg-green-500" }, { label: "Violet", value: "bg-purple-500" },
    { label: "Rose", value: "bg-pink-500" }, { label: "Orange", value: "bg-orange-500" },
    { label: "Rouge", value: "bg-red-500" }, { label: "Gris", value: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Créer un événement
        </h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-5" autoComplete="off">
          {error && <p className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">{error}</p>}

          <div>
            <label className={labelCls}>Titre *</label>
            <input name="title" placeholder="Titre de l'événement" value={form.title} onChange={handleChange} required className={inputCls} autoComplete="off" />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" placeholder="Description (optionnel)" value={form.description} onChange={handleChange} className={inputCls} rows={3} autoComplete="off" style={{ resize: "none" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date de début *</label>
              <input type="date" name="event_date" value={form.event_date} onChange={handleChange} required className={inputCls} autoComplete="off" />
            </div>
            <div>
              <label className={labelCls}>Date de fin</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} min={form.event_date || undefined} className={inputCls} autoComplete="off" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls} autoComplete="off">
                <option value="worship">Culte</option>
                <option value="formation">Formation</option>
                <option value="prayer">Prière</option>
                <option value="youth">Jeunes</option>
                <option value="baptism">Baptême</option>
                <option value="leadership">Leadership</option>
                <option value="special">Spécial</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Participants prévus</label>
              <input type="number" name="attendees" value={form.attendees} onChange={handleChange} min={0} className={inputCls} autoComplete="off" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Heure de début *</label>
              <input type="time" name="start_time" value={form.start_time} onChange={handleChange} required className={inputCls} autoComplete="off" />
            </div>
            <div>
              <label className={labelCls}>Heure de fin *</label>
              <input type="time" name="end_time" value={form.end_time} onChange={handleChange} required className={inputCls} autoComplete="off" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Lieu ou lien *</label>
            <input name="location" placeholder="Bâtiment principal / http://..." value={form.location} onChange={handleChange} required className={inputCls} autoComplete="off" />
          </div>

          <div>
            <label className={labelCls}>Couleur de l&apos;événement</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {EVENT_COLORS.map(c => (
                <button type="button" key={c.value} onClick={() => setForm(p => ({ ...p, color: c.value }))}
                  className={`w-8 h-8 rounded-lg ${c.value} border-2 transition-all ${form.color === c.value ? "border-gray-900 dark:border-white scale-110" : "border-transparent"}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_online" checked={form.is_online} onChange={handleChange} className="w-4 h-4 rounded accent-cyan-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">En ligne</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_recurring" checked={form.is_recurring} onChange={handleChange} className="w-4 h-4 rounded accent-cyan-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Récurrent</span>
            </label>
          </div>

          {form.is_recurring && (
            <div className="bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-400">
                <RefreshCw size={15} />
                Configuration de la récurrence
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fréquence *</label>
                  <select name="recurring_type" value={form.recurring_type} onChange={handleChange} className={inputCls}>
                    <option value="none">— Sélectionner —</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date de fin de récurrence</label>
                  <input type="date" name="recurring_end_date" value={form.recurring_end_date} onChange={handleChange} min={form.event_date || undefined} className={inputCls} />
                </div>
              </div>
              {form.recurring_type !== "none" && (
                <p className="text-xs text-cyan-600 dark:text-cyan-500">
                  {form.recurring_type === "daily" && "Cet événement se répétera chaque jour."}
                  {form.recurring_type === "weekly" && "Cet événement se répétera chaque semaine le même jour."}
                  {form.recurring_type === "monthly" && "Cet événement se répétera chaque mois à la même date."}
                  {form.recurring_type === "yearly" && "Cet événement se répétera chaque année à la même date."}
                  {form.recurring_end_date && ` Jusqu'au ${new Date(form.recurring_end_date).toLocaleDateString("fr-FR")}.`}
                </p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-60 shadow-sm">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Création...</> : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
