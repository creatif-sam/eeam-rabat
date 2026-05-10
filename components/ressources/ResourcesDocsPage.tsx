"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  FileText,
  File,
  FileImage,
  Edit2,
  Trash2,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import CategoryModal from "./CategoryModal";
import UploadDocumentModal from "./UploadDocumentModal";

const ADMIN_ROLES = ["admin", "pastor"];

export type Category = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_by: string | null;
  created_at: string;
};

export type Resource = {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  download_count: number;
  created_by: string | null;
  created_at: string;
  resource_categories?: { name: string; color: string } | null;
};

const COLOR_BADGE: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

function badgeCls(color: string) {
  return COLOR_BADGE[color] ?? COLOR_BADGE.gray;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ fileType }: { fileType: string | null }) {
  if (!fileType) return <FileText size={28} className="text-gray-400" />;
  if (fileType.includes("pdf")) return <FileText size={28} className="text-red-500" />;
  if (fileType.includes("image")) return <FileImage size={28} className="text-blue-500" />;
  if (fileType.includes("word") || fileType.includes("document"))
    return <FileText size={28} className="text-blue-600" />;
  if (fileType.includes("sheet") || fileType.includes("excel"))
    return <FileText size={28} className="text-green-600" />;
  if (fileType.includes("presentation") || fileType.includes("powerpoint"))
    return <FileText size={28} className="text-orange-500" />;
  return <File size={28} className="text-gray-500" />;
}

export default function ResourcesDocsPage({ role }: { role: string | null }) {
  const supabase = createClient();
  const isAdmin = role != null && ADMIN_ROLES.includes(role);

  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [catRes, docRes] = await Promise.all([
      supabase.from("resource_categories").select("*").order("name"),
      supabase
        .from("resources")
        .select("*, resource_categories(name, color)")
        .order("created_at", { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (docRes.data) setResources(docRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = resources.filter((r) => {
    const matchesSearch =
      search === "" ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.file_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || r.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownload = async (resource: Resource) => {
    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(resource.file_path);
    window.open(data.publicUrl, "_blank");
    // Increment download counter
    await supabase
      .from("resources")
      .update({ download_count: resource.download_count + 1 })
      .eq("id", resource.id);
    setResources((prev) =>
      prev.map((r) =>
        r.id === resource.id
          ? { ...r, download_count: r.download_count + 1 }
          : r
      )
    );
  };

  const handleDeleteResource = async (id: string, filePath: string) => {
    if (!confirm("Supprimer ce document définitivement ?")) return;
    await supabase.storage.from("documents").remove([filePath]);
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
      return;
    }
    setResources((prev) => prev.filter((r) => r.id !== id));
    toast.success("Document supprimé.");
  };

  const handleDeleteCategory = async (cat: Category) => {
    const hasResources = resources.some((r) => r.category_id === cat.id);
    if (hasResources) {
      toast.error(
        "Cette catégorie contient des documents. Veuillez les déplacer ou les supprimer d'abord."
      );
      return;
    }
    if (!confirm(`Supprimer la catégorie « ${cat.name} » ?`)) return;
    const { error } = await supabase
      .from("resource_categories")
      .delete()
      .eq("id", cat.id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    if (selectedCategory === cat.id) setSelectedCategory("all");
    toast.success("Catégorie supprimée.");
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-cyan-600" size={26} />
            Ressources &amp; Documents
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {resources.length} document{resources.length !== 1 ? "s" : ""} ·{" "}
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
            >
              <Plus size={15} /> Catégorie
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <Upload size={15} /> Ajouter document
            </button>
          </div>
        )}
      </div>

      {/* ── Search ──────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Rechercher un document par titre, description ou nom de fichier…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
      </div>

      {/* ── Category filter pills ────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selectedCategory === "all"
              ? "bg-cyan-600 text-white border-cyan-600"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Tous ({resources.length})
        </button>

        {categories.map((cat) => {
          const count = resources.filter((r) => r.category_id === cat.id).length;
          return (
            <div key={cat.id} className="flex items-center gap-0.5">
              <button
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {cat.name} ({count})
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setShowCategoryModal(true);
                    }}
                    title="Modifier"
                    className="p-1 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    title="Supprimer"
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Document grid ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <FolderOpen size={52} className="mx-auto mb-4 opacity-25" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">
            Aucun document trouvé
          </p>
          {isAdmin && (
            <p className="text-sm mt-1">
              Commencez par créer une catégorie puis ajoutez un document.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <div
              key={resource.id}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              {/* Top row: icon + title + delete */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <FileIcon fileType={resource.file_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                    {resource.title}
                  </p>
                  {resource.file_size != null && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatSize(resource.file_size)}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() =>
                      handleDeleteResource(resource.id, resource.file_path)
                    }
                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Description */}
              {resource.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* Footer: badge + download */}
              <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                {resource.resource_categories ? (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border truncate max-w-[55%] ${badgeCls(
                      resource.resource_categories.color
                    )}`}
                  >
                    {resource.resource_categories.name}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700">
                    Sans catégorie
                  </span>
                )}

                <button
                  onClick={() => handleDownload(resource)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors shrink-0"
                >
                  <Download size={13} />
                  Télécharger
                </button>
              </div>

              <p className="text-[10px] text-gray-400 leading-none">
                {resource.download_count} téléchargement
                {resource.download_count !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────── */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSaved={fetchAll}
        />
      )}

      {showUploadModal && (
        <UploadDocumentModal
          categories={categories}
          onClose={() => setShowUploadModal(false)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
