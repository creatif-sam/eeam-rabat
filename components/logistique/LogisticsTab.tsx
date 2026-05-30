"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Package, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import CreateItemModal from "./CreateItemModal";

type LogisticsItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("logistics_items")
      .select("id, name, category, quantity, condition, location, notes, created_at")
      .order("category")
      .order("name");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet équipement ?")) return;
    const { error } = await supabase.from("logistics_items").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
      return;
    }
    toast.success("Équipement supprimé.");
    fetchItems();
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
        {canEdit && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Ajouter un équipement
          </button>
        )}
      </div>

      {/* Stats bar */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {(["bon", "moyen", "mauvais"] as const).map(cond => {
            const count = items.filter(i => i.condition === cond).length;
            return (
              <div key={cond} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{CONDITION_LABEL[cond]}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun équipement trouvé.</p>
          {canEdit && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-cyan-500 hover:underline"
            >
              Ajouter le premier équipement
            </button>
          )}
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Nom
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Qté
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        État
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Emplacement
                      </th>
                      {canEdit && <th className="w-10 px-4 py-3" />}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItems.map((item, i) => (
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
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_BADGE[item.condition]}`}
                          >
                            {CONDITION_LABEL[item.condition]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {item.location ?? "—"}
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
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
    </div>
  );
}
