"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    categorie: "",
    montant: "",
    type: "revenu",
    source: "",
    vendeur: ""
  });

  const submit = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !user.email) return;

    await supabase.from("transactions_financieres").insert({
      date_transaction: form.date_transaction,
      description: form.description,
      categorie: form.categorie,
      montant: Number(form.montant),
      type: form.type,
      source: form.type === "revenu" ? form.source : null,
      vendeur: form.type === "depense" ? form.vendeur : null,
      creator_id: user.id,
      creator_email: user.email
    });

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4">
        <h2 className="text-2xl font-bold">Nouvelle transaction</h2>

        <input type="date" className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, date_transaction: e.target.value })} />

        <input placeholder="Description" className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, description: e.target.value })} />

        <input placeholder="Catégorie" className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, categorie: e.target.value })} />

        <input type="number" placeholder="Montant" className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, montant: e.target.value })} />

        <select className="w-full border p-3 rounded-xl"
          onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="revenu">Revenu</option>
          <option value="depense">Dépense</option>
        </select>

        {form.type === "revenu" ? (
          <input placeholder="Source" className="w-full border p-3 rounded-xl"
            onChange={e => setForm({ ...form, source: e.target.value })} />
        ) : (
          <input placeholder="Vendeur" className="w-full border p-3 rounded-xl"
            onChange={e => setForm({ ...form, vendeur: e.target.value })} />
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl">
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
