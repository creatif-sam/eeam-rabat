"use client";

import { useRef, useState } from "react";
import { X, Upload, File as FileIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "./ResourcesDocsPage";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm";

const LABEL_CLS =
  "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
  "text/csv",
];

const MAX_SIZE_MB = 50;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadDocumentModal({
  categories,
  onClose,
  onSaved,
}: {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "Type de fichier non supporté. Utilisez PDF, Word, Excel, PowerPoint, image ou texte.";
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Le fichier dépasse la limite de ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const applyFile = (f: File) => {
    const err = validateFile(f);
    setFileError(err);
    if (!err) setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) applyFile(f);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (!file) {
      toast.error("Veuillez sélectionner un fichier.");
      return;
    }

    setUploading(true);
    setProgress(20);

    const ext = file.name.split(".").pop() ?? "bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const folder = categoryId || "general";
    const storagePath = `${folder}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      toast.error("Erreur lors de l'upload : " + uploadError.message);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(70);

    const { error: dbError } = await supabase.from("resources").insert({
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      file_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    });

    if (dbError) {
      toast.error("Erreur lors de l'enregistrement.");
      // Roll back the storage upload
      await supabase.storage.from("documents").remove([storagePath]);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    toast.success("Document ajouté avec succès.");
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-100 dark:border-gray-800 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Ajouter un document
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={LABEL_CLS}>Titre *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Programme Culte Dimanche 17 Mai 2026"
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

          {/* Category */}
          <div>
            <label className={LABEL_CLS}>Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">— Sans catégorie —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div>
            <label className={LABEL_CLS}>Fichier *</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragOver
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                  : fileError
                  ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) applyFile(f);
                }}
              />

              {file && !fileError ? (
                <div className="flex flex-col items-center gap-2">
                  <FileIcon size={32} className="text-cyan-600" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload
                    size={32}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Glissez un fichier ici ou{" "}
                    <span className="text-cyan-600 font-medium">
                      cliquez pour parcourir
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, Word, Excel, PowerPoint, images — max {MAX_SIZE_MB} MB
                  </p>
                </div>
              )}
            </div>

            {fileError && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={15} />
                {fileError}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Upload en cours…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !file || !!fileError || !title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            {uploading ? "Upload…" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
