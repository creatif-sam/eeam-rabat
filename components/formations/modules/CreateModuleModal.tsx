"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CreateModuleModal({
  open,
  formationId,
  onClose,
  onCreated
}: any) {
  const supabase = createClient();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("formation_modules").insert({
      formation_id: formationId,
      titre,
      description,
      ordre: Date.now(),
      creator_id: user.id,
      creator_email: user.email
    });

    setTitre("");
    setDescription("");
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Nouveau module</h2>

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Titre du module"
          value={titre}
          onChange={e => setTitre(e.target.value)}
        />

        <textarea
          className="w-full border rounded-xl p-3"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl">
            Annuler
          </button>
          <button
            onClick={submit}
            className="flex-1 bg-cyan-500 text-white py-3 rounded-xl"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
