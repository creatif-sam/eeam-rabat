"use client";

import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Formation = {
  id: string;
  titre: string;
  categorie: string;
  description: string;
  duree: string;
  sessions_total: number;
  participants_max: number;
  date_debut: string;
  date_fin: string | null;
  horaire: string;
  lieu: string;
  niveau: string;
  couleur: string;
  en_ligne: boolean;
};

type Props = {
  formation: Formation | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditFormationModal({
  formation,
  onClose,
  onUpdated
}: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Formation | null>(null);

  useEffect(() => {
    if (formation) setForm(formation);
  }, [formation]);

  if (!formation || !form) return null;

  const submit = async () => {
    setLoading(true);

    await supabase
      .from("formations")
      .update({
        titre: form.titre,
        categorie: form.categorie,
        description: form.description,
        duree: form.duree,
        sessions_total: form.sessions_total,
        participants_max: form.participants_max,
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        horaire: form.horaire,
        lieu: form.lieu,
        niveau: form.niveau,
        couleur: form.couleur,
        en_ligne: form.en_ligne
      })
      .eq("id", formation.id);

    setLoading(false);
    onUpdated();
    onClose();
  };

  const remove = async () => {
    if (!confirm("Supprimer cette formation ?")) return;

    await supabase.from("formations").delete().eq("id", formation.id);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Modifier la formation
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X />
          </button>
        </div>

        <input
          className="w-full border rounded-xl p-3"
          value={form.titre}
          onChange={e => setForm({ ...form, titre: e.target.value })}
        />

        <select
          className="w-full border rounded-xl p-3"
          value={form.categorie}
          onChange={e => setForm({ ...form, categorie: e.target.value })}
        >
          <option value="leadership">Leadership</option>
          <option value="discipulat">Discipulat</option>
          <option value="louange">Louange</option>
          <option value="evangelisation">Évangélisation</option>
          <option value="gestion">Gestion</option>
        </select>

        <textarea
          className="w-full border rounded-xl p-3"
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl p-3"
            value={form.duree}
            onChange={e => setForm({ ...form, duree: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-xl p-3"
            value={form.sessions_total}
            onChange={e =>
              setForm({
                ...form,
                sessions_total: Number(e.target.value)
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            className="border rounded-xl p-3"
            value={form.date_debut}
            onChange={e => setForm({ ...form, date_debut: e.target.value })}
          />
          <input
            type="date"
            className="border rounded-xl p-3"
            value={form.date_fin || ""}
            onChange={e => setForm({ ...form, date_fin: e.target.value })}
          />
        </div>

        <input
          className="w-full border rounded-xl p-3"
          value={form.horaire}
          onChange={e => setForm({ ...form, horaire: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-3"
          value={form.lieu}
          onChange={e => setForm({ ...form, lieu: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-3"
          value={form.niveau}
          onChange={e => setForm({ ...form, niveau: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.en_ligne}
            onChange={e => setForm({ ...form, en_ligne: e.target.checked })}
          />
          Formation en ligne
        </label>

        <div className="flex gap-3 pt-4">
          <button
            onClick={remove}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Supprimer
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl shadow-lg disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
