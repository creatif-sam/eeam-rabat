"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "./ResourcesDocsPage";

const COLORS: { value: string; label: string; preview: string }[] = [
  { value: "blue",   label: "Bleu",   preview: "bg-blue-500" },
  { value: "rose",   label: "Rose",   preview: "bg-rose-500" },
  { value: "green",  label: "Vert",   preview: "bg-green-500" },
  { value: "purple", label: "Violet", preview: "bg-purple-500" },
  { value: "orange", label: "Orange", preview: "bg-orange-500" },
  { value: "cyan",   label: "Cyan",   preview: "bg-cyan-500" },
  { value: "yellow", label: "Jaune",  preview: "bg-yellow-500" },
  { value: "gray",   label: "Gris",   preview: "bg-gray-500" },
];

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm";

const LABEL_CLS =
  "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

export default function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [color, setColor] = useState(category?.color ?? "blue");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Le nom de la catégorie est requis.");
      return;
    }
    setLoading(true);

    if (category) {
      const { error } = await supabase
        .from("resource_categories")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          color,
        })
        .eq("id", category.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour.");
        setLoading(false);
        return;
      }
      toast.success("Catégorie mise à jour.");
    } else {
      const { error } = await supabase.from("resource_categories").insert({
        name: name.trim(),
        description: description.trim() || null,
        color,
      });

      if (error) {
        toast.error("Erreur lors de la création.");
        setLoading(false);
        return;
      }
      toast.success("Catégorie créée.");
    }

    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className={LABEL_CLS}>Nom *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Programme de prédication dimanche"
              className={INPUT_CLS}
            />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLS}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description optionnelle…"
              className={INPUT_CLS + " resize-none"}
            />
          </div>

          {/* Color picker */}
          <div>
            <label className={LABEL_CLS}>Couleur d'étiquette</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full ${c.preview} transition-transform ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-gray-500 dark:ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading
              ? "Enregistrement…"
              : category
              ? "Mettre à jour"
              : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
