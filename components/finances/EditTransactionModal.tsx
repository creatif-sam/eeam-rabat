"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EditTransactionModal({
  transaction,
  onClose,
  onUpdated
}: any) {
  const supabase = createClient();
  const [form, setForm] = useState(transaction);

  const save = async () => {
    await supabase
      .from("transactions_financieres")
      .update(form)
      .eq("id", transaction.id);

    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4">
        <h2 className="text-2xl font-bold">Modifier transaction</h2>

        <input value={form.description} className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, description: e.target.value })} />

        <input value={form.categorie} className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, categorie: e.target.value })} />

        <input type="number" value={form.montant} className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, montant: e.target.value })} />

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl">
            Annuler
          </button>
          <button
            onClick={save}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl shadow-lg shadow-cyan-500/30">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
