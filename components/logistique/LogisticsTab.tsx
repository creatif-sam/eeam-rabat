"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Package, Trash2, Search, Pencil, AlertTriangle, FileDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import CreateItemModal from "./CreateItemModal";
import EditItemModal from "./EditItemModal";

type LogisticsItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  condition: "bon" | "moyen" | "mauvais";
  location: string | null;
  notes: string | null;
  created_at: string;
};

const CONDITION_BADGE: Record<string, string> = {
  bon: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  moyen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  mauvais: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const CONDITION_LABEL: Record<string, string> = {
  bon: "Bon état",
  moyen: "Moyen",
  mauvais: "Mauvais",
};

export default function LogisticsTab() {
  const supabase = createClient();
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<LogisticsItem | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("logistics_items")
      .select("id, name, category, quantity, min_quantity, condition, location, notes, created_at")
      .order("category")
      .order("name");
    if (error) {
      toast.error("Impossible de charger l'inventaire.");
    }
    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        setUserRole(data?.role ?? null);
      }
    };
    init();
    fetchItems();
  }, [fetchItems, supabase]);

  const canEdit = userRole && ["admin", "pastor"].includes(userRole);

  const handleDelete = (id: string) => {
    toast("Archiver cet équipement ? Il ne sera plus visible dans la liste.", {
      action: {
        label: "Archiver",
        onClick: async () => {
          const { error } = await supabase
            .from("logistics_items")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", id);
          if (error) {
            toast.error("Erreur lors de l'archivage.");
            return;
          }
          toast.success("Équipement archivé.");
          fetchItems();
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = items.map(i => ({
      Nom: i.name,
      "Catégorie": i.category,
      "Quantité": i.quantity,
      "Qté min.": i.min_quantity,
      "État": CONDITION_LABEL[i.condition] ?? i.condition,
      Emplacement: i.location ?? "",
      Notes: i.notes ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventaire");
    XLSX.writeFile(wb, `inventaire_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const filtered = items.filter(
    i =>
      search === "" ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      (i.location ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by category for display
  const grouped = filtered.reduce<Record<string, LogisticsItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const lowStockCount = items.filter(
    i => i.min_quantity > 0 && i.quantity <= i.min_quantity
  ).length;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <FileDown size={15} />
              Exporter
            </button>
          )}
          <button
            onClick={() => canEdit ? setShowCreate(true) : toast.error("Vous n'avez pas la permission d'ajouter des équipements.")}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {(["bon", "moyen", "mauvais"] as const).map(cond => {
            const count = items.filter(i => i.condition === cond).length;
            return (
              <div key={cond} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{CONDITION_LABEL[cond]}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
              </div>
            );
          })}
          <div className={`rounded-xl border px-4 py-3 ${
            lowStockCount > 0
              ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}>
            <p className={`text-xs ${lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}`}>
              Stock bas
            </p>
            <p className={`text-xl font-bold ${lowStockCount > 0 ? "text-amber-700 dark:text-amber-300" : "text-gray-900 dark:text-gray-100"}`}>
              {lowStockCount}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun équipement trouvé.</p>
          <button
            onClick={() => canEdit ? setShowCreate(true) : toast.error("Vous n'avez pas la permission d'ajouter des équipements.")}
            className="mt-3 text-sm text-cyan-500 hover:underline"
          >
            Ajouter le premier équipement
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                {category} ({categoryItems.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Nom</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Qté</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">État</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Emplacement</th>
                      {canEdit && <th className="w-20 px-4 py-3" />}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItems.map((item, i) => {
                      const isLowStock = item.min_quantity > 0 && item.quantity <= item.min_quantity;
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                            i % 2 !== 0 ? "bg-gray-50/40 dark:bg-gray-800/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                            {item.notes && (
                              <p className="text-xs text-gray-400 font-normal">{item.notes}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-mono ${isLowStock ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>
                              {item.quantity}
                            </span>
                            {isLowStock && (
                              <span className="inline-block ml-1" title={`Stock bas (min. ${item.min_quantity})`}>
                                <AlertTriangle size={12} className="inline text-amber-500" />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_BADGE[item.condition]}`}>
                              {CONDITION_LABEL[item.condition]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {item.location ?? "—"}
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditItem(item)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                                  title="Modifier"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                  title="Archiver"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateItemModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchItems();
          }}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={() => {
            setEditItem(null);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}
