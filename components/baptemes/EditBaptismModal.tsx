"use client";

import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Baptism = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  temoignage: string | null;
  statut: "en_attente" | "en_preparation" | "approuve" | "baptise" | "rejete";
};

type Props = {
  baptism: Baptism;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditBaptismModal({
  baptism,
  onClose,
  onUpdated
}: Props) {
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: baptism.full_name,
    email: baptism.email,
    phone: baptism.phone || "",
    temoignage: baptism.temoignage || "",
    statut: baptism.statut
  });

  const [saving, setSaving] = useState(false);

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true);

    await supabase
      .from("baptisms")
      .update({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        temoignage: form.temoignage || null,
        statut: form.statut
      })
      .eq("id", baptism.id);

    setSaving(false);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Modifier la demande
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        <input
          name="full_name"
          value={form.full_name}
          onChange={updateField}
          placeholder="Nom complet"
          className="w-full border p-3 rounded-xl"
        />

        <input
          name="email"
          value={form.email}
          onChange={updateField}
          placeholder="Email"
          className="w-full border p-3 rounded-xl"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={updateField}
          placeholder="Téléphone"
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          name="temoignage"
          value={form.temoignage}
          onChange={updateField}
          placeholder="Témoignage"
          rows={4}
          className="w-full border p-3 rounded-xl"
        />

        <select
          name="statut"
          value={form.statut}
          onChange={updateField}
          className="w-full border p-3 rounded-xl"
        >
          <option value="en_attente">En attente</option>
          <option value="en_preparation">En préparation</option>
          <option value="approuve">Approuvé</option>
          <option value="baptise">Baptisé</option>
          <option value="rejete">Rejeté</option>
        </select>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
          >
            Annuler
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-cyan-500/30"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
