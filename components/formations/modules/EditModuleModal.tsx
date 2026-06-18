"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function EditModuleModal({ module, onClose, onUpdated }: any) {
  const supabase = createClient();
  const [form, setForm] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (module) setForm(module);
  }, [module]);

  if (!form) return null;

  const save = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from("formation_modules")
      .update({
        titre: form.titre,
        description: form.description,
        est_complete: form.est_complete
      })
      .eq("id", form.id);

    setIsSubmitting(false);

    if (error) {
      toast.error("Impossible de mettre à jour le module.");
      return;
    }

    onUpdated();
    onClose();
  };

  const remove = () => {
    if (isSubmitting) return;
    toast("Supprimer ce module ?", {
      action: {
        label: "Supprimer",
        onClick: async () => {
          setIsSubmitting(true);
          const { error } = await supabase.from("formation_modules").delete().eq("id", form.id);
          setIsSubmitting(false);

          if (error) {
            toast.error("Impossible de supprimer le module.");
            return;
          }

          onUpdated();
          onClose();
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Modifier le module</h2>

        <input
          className="w-full border rounded-xl p-3"
          value={form.titre}
          onChange={e => setForm({ ...form, titre: e.target.value })}
        />

        <textarea
          className="w-full border rounded-xl p-3"
          value={form.description || ""}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.est_complete}
            onChange={e =>
              setForm({ ...form, est_complete: e.target.checked })
            }
          />
          Module terminé
        </label>

        <div className="flex gap-3">
          <button
            onClick={remove}
            disabled={isSubmitting}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl disabled:opacity-50"
          >
            Supprimer
          </button>
          <button
            onClick={save}
            disabled={isSubmitting}
            className="flex-1 bg-cyan-500 text-white py-3 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
