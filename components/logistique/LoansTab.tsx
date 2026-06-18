"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Handshake, Trash2, Search, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import CreateLoanModal from "./CreateLoanModal";

type Loan = {
  id: string;
  item_id: string;
  lent_to: string;
  quantity_lent: number;
  lent_at: string;
  expected_return: string | null;
  returned_at: string | null;
  notes: string | null;
  created_at: string;
  logistics_items: { name: string; category: string } | null;
};

export default function LoansTab() {
  const supabase = createClient();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "returned" | "all">("active");

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("loans")
      .select(
        "id, item_id, lent_to, quantity_lent, lent_at, expected_return, returned_at, notes, created_at, logistics_items(name, category)"
      )
      .order("lent_at", { ascending: false });
    const normalized = (data ?? []).map((loan) => ({
      ...loan,
      logistics_items: Array.isArray(loan.logistics_items)
        ? loan.logistics_items[0] ?? null
        : loan.logistics_items,
    }));
    setLoans(normalized as Loan[]);
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
    fetchLoans();
  }, [fetchLoans, supabase]);

  const canEdit = userRole && ["admin", "pastor"].includes(userRole);

  const handleMarkReturned = async (id: string) => {
    const { error } = await supabase
      .from("loans")
      .update({ returned_at: new Date().toISOString().split("T")[0] })
      .eq("id", id);
    if (error) { toast.error("Erreur."); return; }
    toast.success("Équipement marqué comme rendu.");
    fetchLoans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce prêt ?")) return;
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) { toast.error("Erreur lors de la suppression."); return; }
    toast.success("Prêt supprimé.");
    fetchLoans();
  };

  const filtered = loans.filter(l => {
    const matchesSearch =
      search === "" ||
      l.lent_to.toLowerCase().includes(search.toLowerCase()) ||
      (l.logistics_items?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const isActive = !l.returned_at;
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && isActive) ||
      (filter === "returned" && !isActive);
    return matchesSearch && matchesFilter;
  });

  const activeCount = loans.filter(l => !l.returned_at).length;
  const overdueCount = loans.filter(
    l =>
      !l.returned_at &&
      l.expected_return &&
      new Date(l.expected_return + "T00:00:00") < new Date()
  ).length;

  return (
    <div>
      {/* Stats */}
      {!loading && loans.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total prêts</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{loans.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">En cours</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{activeCount}</p>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${
            overdueCount > 0
              ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}>
            <p className={`text-xs ${overdueCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-gray-500 dark:text-gray-400"}`}>
              En retard
            </p>
            <p className={`text-xl font-bold ${overdueCount > 0 ? "text-rose-700 dark:text-rose-300" : "text-gray-900 dark:text-gray-100"}`}>
              {overdueCount}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
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
            value={filter}
            onChange={e => setFilter(e.target.value as "active" | "returned" | "all")}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="active">En cours</option>
            <option value="returned">Rendus</option>
            <option value="all">Tous</option>
          </select>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Nouveau prêt
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Handshake size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun prêt trouvé.</p>
          {canEdit && (
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-cyan-500 hover:underline">
              Enregistrer le premier prêt
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Équipement</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Prêté à</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Qté</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Date prêt</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Retour prévu</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                {canEdit && <th className="w-20 px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan, i) => {
                const isOverdue =
                  !loan.returned_at &&
                  loan.expected_return != null &&
                  new Date(loan.expected_return + "T00:00:00") < new Date();
                return (
                  <tr
                    key={loan.id}
                    className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                      i % 2 !== 0 ? "bg-gray-50/40 dark:bg-gray-800/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {loan.logistics_items?.name ?? "—"}
                      <p className="text-xs text-gray-400 font-normal">{loan.logistics_items?.category}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {loan.lent_to}
                      {loan.notes && (
                        <p className="text-xs text-gray-400">{loan.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-mono">
                      {loan.quantity_lent}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(loan.lent_at + "T00:00:00").toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {loan.expected_return ? (
                        <span className={isOverdue ? "text-rose-600 dark:text-rose-400 font-medium" : ""}>
                          {new Date(loan.expected_return + "T00:00:00").toLocaleDateString("fr-FR")}
                          {isOverdue && " ⚠"}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {loan.returned_at ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Rendu
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {isOverdue ? "En retard" : "En cours"}
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!loan.returned_at && (
                            <button
                              onClick={() => handleMarkReturned(loan.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Marquer comme rendu"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(loan.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            title="Supprimer"
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
      )}

      {showCreate && (
        <CreateLoanModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchLoans();
          }}
        />
      )}
    </div>
  );
}
