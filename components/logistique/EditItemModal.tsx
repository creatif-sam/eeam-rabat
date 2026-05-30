"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type LogisticsItem = {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  condition: "bon" | "moyen" | "mauvais";
  location: string | null;
  notes: string | null;
};

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

export default function EditItemModal({
  item,
  onClose,
  onUpdated,
}: {
  item: LogisticsItem;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    quantity: String(item.quantity),
    min_quantity: String(item.min_quantity),
    condition: item.condition,
    location: item.location ?? "",
    notes: item.notes ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("La quantité doit être 0 ou plus.");
      return;
    }
    const minQty = parseInt(form.min_quantity, 10);
    if (isNaN(minQty) || minQty < 0) {
      toast.error("La quantité minimum doit être 0 ou plus.");
      return;
    }

    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const delta = qty - item.quantity;

    const { error } = await supabase
      .from("logistics_items")
      .update({
        quantity: qty,
        min_quantity: minQty,
        condition: form.condition,
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq("id", item.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour.");
      setSubmitting(false);
      return;
    }

    // Log stock movement if quantity changed
    if (delta !== 0) {
      await supabase.from("stock_movements").insert({
        item_id: item.id,
        delta,
        reason: "Mise à jour manuelle",
        changed_by: user?.id ?? null,
      });
    }

    toast.success("Équipement mis à jour.");
    setSubmitting(false);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Modifier l&apos;équipement
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Quantité actuelle</label>
              <input
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Qté min. (alerte)</label>
              <input
                name="min_quantity"
                type="number"
                min="0"
                value={form.min_quantity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>État</label>
              <select name="condition" value={form.condition} onChange={handleChange} className={inputClass}>
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
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
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={2}
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
            {submitting ? "Enregistrement…" : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
}
