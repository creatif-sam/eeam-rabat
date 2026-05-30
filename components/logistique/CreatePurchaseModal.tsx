"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  "Mobilier",
  "Audiovisuel",
  "Nourriture",
  "Fournitures",
  "Maintenance",
  "Autre",
];

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-cyan-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function CreatePurchaseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    item_name: "",
    amount: "",
    currency: "MAD",
    bought_by: "",
    purchase_date: new Date().toISOString().split("T")[0],
    category: "Autre",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.item_name.trim()) {
      toast.error("Le nom de l'article est requis.");
      return;
    }
    if (!form.bought_by.trim()) {
      toast.error("L'acheteur est requis.");
      return;
    }
    if (!form.purchase_date) {
      toast.error("La date est requise.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Upload receipt if provided
    let receipt_url: string | null = null;
    if (receiptFile) {
      const ext = receiptFile.name.split(".").pop() ?? "bin";
      const path = `${user?.id ?? "anon"}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, receiptFile, { upsert: false });
      if (uploadError) {
        toast.error("Erreur lors du téléversement du reçu.");
        setSubmitting(false);
        return;
      }
      receipt_url = path;
    }

    const { error } = await supabase.from("purchases").insert({
      item_name: form.item_name.trim(),
      amount: form.amount ? parseFloat(form.amount) : null,
      currency: form.currency,
      bought_by: form.bought_by.trim(),
      purchase_date: form.purchase_date,
      category: form.category,
      notes: form.notes.trim() || null,
      receipt_url,
      created_by: user?.id ?? null,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Erreur lors de l'enregistrement.");
      return;
    }

    toast.success("Achat enregistré.");
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ajouter un achat
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-5 space-y-4">
          <div>
            <label className={labelClass}>Article acheté *</label>
            <input
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="ex. Câble HDMI, Chaises×10…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Montant</label>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass}>Devise</label>
              <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                <option value="MAD">MAD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Acheté par *</label>
              <input
                name="bought_by"
                value={form.bought_by}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nom de l'acheteur"
              />
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input
                name="purchase_date"
                type="date"
                value={form.purchase_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Receipt upload */}
          <div>
            <label className={labelClass}>Reçu / Photo</label>
            <label className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {receiptFile
                  ? receiptFile.name
                  : "Cliquer pour choisir une image ou un PDF"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
              />
            </label>
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
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800 shrink-0">
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
