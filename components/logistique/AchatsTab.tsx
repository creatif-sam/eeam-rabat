"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ShoppingCart, Receipt, Trash2, Search, CheckCircle2, XCircle, FileDown } from "lucide-react";
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
  status: string;
  created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

export default function AchatsTab() {
  const supabase = createClient();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("purchases")
      .select(
        "id, item_name, amount, currency, bought_by, purchase_date, category, receipt_url, notes, status, created_at"
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
  const canApprove = userRole && ["admin", "pastor"].includes(userRole);

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("purchases").update({ status: "approved" }).eq("id", id);
    if (error) { toast.error("Erreur."); return; }
    toast.success("Achat approuvé.");
    fetchPurchases();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("purchases").update({ status: "rejected" }).eq("id", id);
    if (error) { toast.error("Erreur."); return; }
    toast.warning("Achat refusé.");
    fetchPurchases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Archiver cet achat ?")) return;
    const { error } = await supabase
      .from("purchases")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Erreur lors de l'archivage.");
      return;
    }
    toast.success("Achat archivé.");
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

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = filtered.map(p => ({
      Article: p.item_name,
      "Acheté par": p.bought_by,
      Montant: p.amount ?? "",
      Devise: p.currency,
      Date: p.purchase_date,
      "Catégorie": p.category,
      Statut: STATUS_LABEL[p.status] ?? p.status,
      Notes: p.notes ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Achats");
    XLSX.writeFile(wb, `achats_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const filtered = purchases.filter(p => {
    const matchesSearch =
      search === "" ||
      p.item_name.toLowerCase().includes(search.toLowerCase()) ||
      p.bought_by.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = filtered
    .filter(p => p.status !== "rejected")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tous</option>
            <option value="draft">Brouillon</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Refusés</option>
          </select>
        </div>
        <div className="flex gap-2">
          {purchases.length > 0 && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <FileDown size={15} />
              Exporter
            </button>
          )}
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
      </div>

      {/* Running total */}
      {!loading && filtered.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {filtered.length} achat{filtered.length > 1 ? "s" : ""}
            {search || statusFilter !== "all" ? " (filtrés)" : ""}
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Total approuvé : {total.toFixed(2)} MAD
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
                  Statut
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Reçu
                </th>
                {canEdit && <th className="w-28 px-4 py-3" />}
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
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
                      <div className="flex items-center gap-1 justify-end">
                        {canApprove && p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Approuver"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              title="Refuser"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          title="Archiver"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
