"use client";

import { useState } from "react";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Baptism = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  temoignage: string | null;
  statut: "en_attente" | "en_preparation" | "approuve" | "baptise" | "rejete";
};

type Props = { baptism: Baptism; onClose: () => void; onUpdated: () => void; };

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-xl text-sm outline-none focus:border-cyan-400 transition-colors";

export default function EditBaptismModal({ baptism, onClose, onUpdated }: Props) {
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: baptism.full_name, email: baptism.email,
    phone: baptism.phone || "", temoignage: baptism.temoignage || "", statut: baptism.statut,
  });
  const [saving, setSaving] = useState(false);

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("baptisms").update({
      full_name: form.full_name, email: form.email,
      phone: form.phone || null, temoignage: form.temoignage || null, statut: form.statut,
    }).eq("id", baptism.id);
    setSaving(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Demande mise à jour");
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-6 space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modifier la demande</h2>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          {([["full_name","Nom complet"],["email","Email"],["phone","Téléphone"]] as [string,string][]).map(([name,ph]) => (
            <input key={name} name={name} placeholder={ph} value={(form as any)[name]} onChange={updateField} className={inputCls} />
          ))}
          <textarea name="temoignage" value={form.temoignage} onChange={updateField} placeholder="Témoignage" rows={3} className={inputCls} style={{ resize: "none" }} />
          <select name="statut" value={form.statut} onChange={updateField} className={inputCls}>
            <option value="en_attente">En attente</option>
            <option value="en_preparation">En préparation</option>
            <option value="approuve">Approuvé</option>
            <option value="baptise">Baptisé</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors">Annuler</button>
          <button onClick={save} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
