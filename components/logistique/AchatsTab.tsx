"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ShoppingCart, Receipt, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import CreatePurchaseModal from "./CreatePurchaseModal";

type Purchase = {
  id: string;
  item_name: string;
  amount: number | null;
  currency: string;
  bought_by: string;
  purchase_date: string;
  category: string;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
};

export default function AchatsTab() {
  const supabase = createClient();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("purchases")
      .select(
        "id, item_name, amount, currency, bought_by, purchase_date, category, receipt_url, notes, created_at"
      )
      .order("purchase_date", { ascending: false });
    setPurchases(data || []);
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
    fetchPurchases();
  }, [fetchPurchases, supabase]);

  const canEdit = userRole && ["admin", "pastor", "treasurer"].includes(userRole);

  const handleDelete = async (id: string, receiptUrl: string | null) => {
    if (!confirm("Supprimer cet achat ?")) return;
    if (receiptUrl) {
      await supabase.storage.from("receipts").remove([receiptUrl]);
    }
    const { error } = await supabase.from("purchases").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
      return;
    }
    toast.success("Achat supprimé.");
    fetchPurchases();
  };

  const openReceipt = async (path: string) => {
    const { data } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 120);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Impossible d'ouvrir le reçu.");
    }
  };

  const filtered = purchases.filter(
    p =>
      search === "" ||
      p.item_name.toLowerCase().includes(search.toLowerCase()) ||
      p.bought_by.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((sum, p) => sum + (p.amount ?? 0), 0);

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
            Ajouter un achat
          </button>
        )}
      </div>

      {/* Running total */}
      {!loading && filtered.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {filtered.length} achat{filtered.length > 1 ? "s" : ""}
            {search ? " (filtrés)" : ""}
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Total : {total.toFixed(2)} MAD
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun achat enregistré.</p>
          {canEdit && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-cyan-500 hover:underline"
            >
              Enregistrer le premier achat
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Article
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Acheté par
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Montant
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Catégorie
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Reçu
                </th>
                {canEdit && <th className="w-10 px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                    i % 2 !== 0 ? "bg-gray-50/40 dark:bg-gray-800/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {p.item_name}
                    {p.notes && (
                      <p className="text-xs text-gray-400 font-normal">{p.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.bought_by}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                    {p.amount != null
                      ? `${p.amount.toFixed(2)} ${p.currency}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(p.purchase_date + "T00:00:00").toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category}</td>
                  <td className="px-4 py-3 text-center">
                    {p.receipt_url ? (
                      <button
                        onClick={() => openReceipt(p.receipt_url!)}
                        className="inline-flex items-center gap-1 text-cyan-500 hover:text-cyan-700 text-xs font-medium"
                        title="Voir le reçu"
                      >
                        <Receipt size={14} />
                        Voir
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id, p.receipt_url)}
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
      )}

      {showCreate && (
        <CreatePurchaseModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchPurchases();
          }}
        />
      )}
    </div>
  );
}
