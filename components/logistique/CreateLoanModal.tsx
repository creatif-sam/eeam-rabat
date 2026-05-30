"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ItemOption = {
  id: string;
  name: string;
  category: string;
  quantity: number;
};

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-cyan-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function CreateLoanModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [form, setForm] = useState({
    item_id: "",
    lent_to: "",
    quantity_lent: "1",
    lent_at: new Date().toISOString().split("T")[0],
    expected_return: "",
    notes: "",
  });

  useEffect(() => {
    supabase
      .from("logistics_items")
      .select("id, name, category, quantity")
      .order("category")
      .order("name")
      .then(({ data }) => setItems(data || []));
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.item_id) {
      toast.error("Sélectionnez un équipement.");
      return;
    }
    if (!form.lent_to.trim()) {
      toast.error("Veuillez indiquer à qui l'équipement est prêté.");
      return;
    }
    const qty = parseInt(form.quantity_lent, 10);
    if (isNaN(qty) || qty < 1) {
      toast.error("La quantité doit être au moins 1.");
      return;
    }
    if (!form.lent_at) {
      toast.error("La date de prêt est requise.");
      return;
    }

    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("loans").insert({
      item_id: form.item_id,
      lent_to: form.lent_to.trim(),
      quantity_lent: qty,
      lent_at: form.lent_at,
      expected_return: form.expected_return || null,
      notes: form.notes.trim() || null,
      created_by: user?.id ?? null,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de l'enregistrement du prêt.");
      return;
    }
    toast.success("Prêt enregistré.");
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Enregistrer un prêt
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Équipement *</label>
            <select name="item_id" value={form.item_id} onChange={handleChange} className={inputClass}>
              <option value="">— Sélectionner un équipement —</option>
              {items.map(it => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.category}) — Qté disponible : {it.quantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Prêté à *</label>
            <input
              name="lent_to"
              value={form.lent_to}
              onChange={handleChange}
              className={inputClass}
              placeholder="Nom de la personne ou du groupe"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Quantité</label>
              <input
                name="quantity_lent"
                type="number"
                min="1"
                value={form.quantity_lent}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date prêt *</label>
              <input
                name="lent_at"
                type="date"
                value={form.lent_at}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Retour prévu</label>
              <input
                name="expected_return"
                type="date"
                value={form.expected_return}
                onChange={handleChange}
                className={inputClass}
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
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
