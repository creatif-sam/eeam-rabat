"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  "Mobilier",
  "Audiovisuel",
  "Informatique",
  "Cuisine",
  "Bureau",
  "Autre",
];

const CONDITIONS = [
  { value: "bon", label: "Bon état" },
  { value: "moyen", label: "État moyen" },
  { value: "mauvais", label: "Mauvais état" },
];

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-cyan-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function CreateItemModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Mobilier",
    quantity: "1",
    min_quantity: "0",
    condition: "bon",
    location: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom est requis.");
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      toast.error("La quantité doit être au moins 1.");
      return;
    }
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("logistics_items").insert({
      name: form.name.trim(),
      category: form.category,
      quantity: qty,
      min_quantity: parseInt(form.min_quantity, 10) || 0,
      condition: form.condition,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      created_by: user?.id ?? null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de la création.");
      return;
    }
    toast.success("Équipement ajouté.");
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ajouter un équipement
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Nom *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="ex. Chaise pliante, Microphone sans fil…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Catégorie</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantité</label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Qté min. (alerte stock)</label>
              <input
                name="min_quantity"
                type="number"
                min="0"
                value={form.min_quantity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>État</label>
              <select name="condition" value={form.condition} onChange={handleChange} className={inputClass}>
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Emplacement</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputClass}
              placeholder="ex. Salle principale"
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className={inputClass}
              placeholder="Informations complémentaires…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
