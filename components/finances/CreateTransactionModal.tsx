"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const REVENUE_CATEGORIES = [
  { value: "offrande", label: "Offrande" },
  { value: "dime", label: "Dime" },
  { value: "gifts", label: "Gifts" },
  { value: "special_offering", label: "Special Offering" }
];

export default function CreateTransactionModal({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();

  const [form, setForm] = useState({
    date_transaction: "",
    description: "",
    categorie: "offrande",
    montant: "",
    type: "revenu"
  });

  const submit = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      toast.error("Utilisateur non connecté.");
      return;
    }

    if (!form.montant || Number(form.montant) <= 0) {
      toast.error("Veuillez saisir un montant valide.");
      return;
    }

    if (!form.date_transaction) {
      toast.error("Veuillez sélectionner une date.");
      return;
    }

    if (form.type === "depense" && !form.description.trim()) {
      toast.error("Veuillez saisir une description pour la dépense.");
      return;
    }

    const revenueLabel =
      REVENUE_CATEGORIES.find(item => item.value === form.categorie)?.label ?? "Revenu";

    const payload = {
      date_transaction: form.date_transaction,
      description:
        form.type === "depense"
          ? form.description.trim()
          : (form.description.trim() || `Revenu: ${revenueLabel}`),
      categorie: form.type === "revenu" ? form.categorie : "depense",
      montant: Number(form.montant),
      type: form.type,
      source: null,
      vendeur: null,
      creator_id: user.id,
      creator_email: user.email
    };

    const { error } = await supabase.from("transactions_financieres").insert(payload);

    if (error) {
      toast.error("Impossible de créer la transaction.");
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle transaction</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            value={form.type}
            className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            onChange={e =>
              setForm({
                ...form,
                type: e.target.value
              })
            }
          >
            <option value="revenu">Revenu</option>
            <option value="depense">Dépense</option>
          </select>
        </div>

        {form.type === "revenu" ? (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input
                type="date"
                value={form.date_transaction}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, date_transaction: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type de revenu</label>
              <select
                value={form.categorie}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, categorie: e.target.value })}
              >
                {REVENUE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
              <input
                type="number"
                min="0"
                placeholder="Montant"
                value={form.montant}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, montant: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (optionnelle)</label>
              <input
                placeholder="Note ou précision"
                value={form.description}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input
                type="date"
                value={form.date_transaction}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, date_transaction: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input
                placeholder="Description de la dépense"
                value={form.description}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
              <input
                type="number"
                min="0"
                placeholder="Montant"
                value={form.montant}
                className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onChange={e => setForm({ ...form, montant: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-3 rounded-xl">
            Annuler
          </button>
          <button
            onClick={submit}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl shadow-lg shadow-cyan-500/30">
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
