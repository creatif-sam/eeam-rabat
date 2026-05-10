"use client";

import { Droplet, Plus, Loader2, X } from "lucide-react";
import type { ParcoursType } from "./bapteme.types";
import { inputCls } from "./bapteme.types";

export type CreateForm = {
  title: string;
  description: string;
  coordinator: string;
  address: string;
  parcours_type: ParcoursType;
  date_debut: string;
  date_fin: string;
};

type Props = {
  form: CreateForm;
  saving: boolean;
  onFormChange: (form: CreateForm) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function CreateSessionModal({
  form,
  saving,
  onFormChange,
  onSubmit,
  onClose,
}: Props) {
  const textFields: [keyof CreateForm, string][] = [
    ["title", "Titre *"],
    ["coordinator", "Coordinateur"],
    ["address", "Adresse"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Droplet size={16} className="text-cyan-500" /> Nouvelle fiche
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-3">
          {textFields.map(([key, placeholder]) => (
            <input
              key={key}
              type="text"
              placeholder={placeholder}
              value={form[key] as string}
              onChange={e => onFormChange({ ...form, [key]: e.target.value })}
              className={inputCls}
            />
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Parcours
              </label>
              <select
                value={form.parcours_type}
                onChange={e =>
                  onFormChange({ ...form, parcours_type: e.target.value as ParcoursType })
                }
                className={inputCls}
              >
                <option value="bapteme">Baptême</option>
                <option value="affermissement">Affermissement</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Statut
              </label>
              <input value="Session en cours" readOnly className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Date de début
              </label>
              <input
                type="date"
                value={form.date_debut}
                onChange={e => onFormChange({ ...form, date_debut: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Date de fin
              </label>
              <input
                type="date"
                value={form.date_fin}
                onChange={e => onFormChange({ ...form, date_fin: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => onFormChange({ ...form, description: e.target.value })}
            rows={3}
            className={inputCls}
            style={{ resize: "none" }}
          />

          <button
            onClick={onSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Créer la fiche
          </button>
        </div>
      </div>
    </div>
  );
}
