"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateFormationModal({ open, onClose, onCreated }: Props) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    categorie: "",
    description: "",
    duree: "",
    sessions_total: 0,
    participants_max: 0,
    date_debut: "",
    date_fin: "",
    horaire: "",
    lieu: "",
    niveau: "",
    couleur: "from-cyan-500 to-blue-600",
    en_ligne: false
  });

  if (!open) return null;

  const submit = async () => {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    await supabase.from("formations").insert({
      ...form,
      statut: "a_venir",
      taux_reussite: 0,
      formateur_nom: user.email,
      createur_id: user.id
    });

    setLoading(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Nouvelle formation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X />
          </button>
        </div>

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Titre de la formation"
          value={form.titre}
          onChange={e => setForm({ ...form, titre: e.target.value })}
        />

        <select
          className="w-full border rounded-xl p-3"
          value={form.categorie}
          onChange={e => setForm({ ...form, categorie: e.target.value })}
        >
          <option value="">Catégorie</option>
          <option value="leadership">Leadership</option>
          <option value="discipulat">Discipulat</option>
          <option value="louange">Louange</option>
          <option value="evangelisation">Évangélisation</option>
          <option value="gestion">Gestion</option>
        </select>

        <textarea
          className="w-full border rounded-xl p-3"
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl p-3"
            placeholder="Durée"
            value={form.duree}
            onChange={e => setForm({ ...form, duree: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-xl p-3"
            placeholder="Sessions"
            value={form.sessions_total}
            onChange={e =>
              setForm({ ...form, sessions_total: Number(e.target.value) })
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
            value={form.date_fin}
            onChange={e => setForm({ ...form, date_fin: e.target.value })}
          />
        </div>

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Horaire"
          value={form.horaire}
          onChange={e => setForm({ ...form, horaire: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Lieu"
          value={form.lieu}
          onChange={e => setForm({ ...form, lieu: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Niveau"
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
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200"
          >
            Annuler
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl shadow-lg disabled:opacity-50"
          >
            Créer la formation
          </button>
        </div>
      </div>
    </div>
  );
}
