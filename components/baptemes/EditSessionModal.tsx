"use client";

import { Edit, Check, Loader2, X } from "lucide-react";
import type { Baptism, ParcoursType } from "./bapteme.types";
import { inputCls, toDateInputValue } from "./bapteme.types";

export type EditForm = Baptism & { ceremony_location: string };

type Props = {
  editForm: EditForm;
  saving: boolean;
  onFormChange: (form: EditForm) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function EditSessionModal({
  editForm,
  saving,
  onFormChange,
  onSubmit,
  onClose,
}: Props) {
  const textFields: [keyof EditForm, string][] = [
    ["full_name", "Nom / Titre"],
    ["email", "Email"],
    ["phone", "Téléphone"],
    ["ceremony_location", "Lieu de cérémonie"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 my-4">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit size={16} className="text-cyan-500" /> Modifier la fiche
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
              value={(editForm[key] as string) || ""}
              onChange={e => onFormChange({ ...editForm, [key]: e.target.value })}
              className={inputCls}
            />
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Parcours
              </label>
              <select
                value={editForm.parcours_type}
                onChange={e =>
                  onFormChange({
                    ...editForm,
                    parcours_type: e.target.value as ParcoursType,
                  })
                }
                className={inputCls}
              >
                <option value="bapteme">Baptême</option>
                <option value="affermissement">Affermissement</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Coordinateur
              </label>
              <input
                type="text"
                value={editForm.conseiller || ""}
                onChange={e => onFormChange({ ...editForm, conseiller: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Date de début
              </label>
              <input
                type="date"
                value={toDateInputValue(editForm.date_debut)}
                onChange={e => onFormChange({ ...editForm, date_debut: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                Date de fin
              </label>
              <input
                type="date"
                value={toDateInputValue(editForm.date_fin)}
                onChange={e => onFormChange({ ...editForm, date_fin: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <textarea
            placeholder="Témoignage / Description"
            value={editForm.temoignage || ""}
            rows={3}
            onChange={e => onFormChange({ ...editForm, temoignage: e.target.value })}
            className={inputCls}
            style={{ resize: "none" }}
          />

          <button
            onClick={onSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
