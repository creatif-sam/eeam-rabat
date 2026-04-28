"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Plus,
  Eye,
  FileText,
  PieChart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CreateTransactionModal from "@/components/finances/CreateTransactionModal";
import EditTransactionModal from "@/components/finances/EditTransactionModal";
import { toast } from "sonner";

type Transaction = {
  id: string;
  date_transaction: string;
  description: string;
  categorie: string;
  montant: number;
  type: "revenu" | "depense";
  source: string | null;
  vendeur: string | null;
};

type Period = "week" | "month" | "quarter" | "year" | "custom";

const REVENUE_CATEGORY_LABELS: Record<string, string> = {
  offrande: "Offrande",
  dime: "Dime",
  gifts: "Gifts",
  special_offering: "Special Offering"
};

export default function FinancesTab() {
  const supabase = createClient();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    const now = new Date();
    if (selectedPeriod === "custom") return;
    const end = now.toISOString().split("T")[0];
    const start = new Date(now);

    if (selectedPeriod === "week") start.setDate(now.getDate() - 6);
    if (selectedPeriod === "month") start.setMonth(now.getMonth() - 1);
    if (selectedPeriod === "quarter") start.setMonth(now.getMonth() - 3);
    if (selectedPeriod === "year") start.setFullYear(now.getFullYear() - 1);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end);
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [{ data: resume, error: resumeError }, { data: tx, error: txError }, { data: budget, error: budgetError }] =
        await Promise.all([
          supabase.from("vue_finance_resume").select("*").single(),
          supabase
            .from("transactions_financieres")
            .select("*")
            .order("date_transaction", { ascending: false }),
          supabase.from("vue_depenses_par_categorie").select("*")
        ]);

      // Handle errors gracefully
      if (resumeError) {
        console.warn("Finance summary view not available:", resumeError.message);
        setSummary({
          total_revenus: 0,
          total_depenses: 0,
          solde_net: 0,
          total_dimes: 0
        });
      } else {
        setSummary(resume);
      }

      if (txError) {
        console.warn("Transactions table not available:", txError.message);
        setTransactions([]);
      } else {
        setTransactions(tx || []);
      }

      if (budgetError) {
        console.warn("Budget view not available:", budgetError.message);
        setBudgets([]);
      } else {
        setBudgets(budget || []);
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
      setSummary({
        total_revenus: 0,
        total_depenses: 0,
        solde_net: 0,
        total_dimes: 0
      });
      setTransactions([]);
      setBudgets([]);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD"
    }).format(Math.abs(amount));

  const dateFilteredTransactions = transactions.filter(t => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(t.date_transaction);
    if (startDate && txDate < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (txDate > end) return false;
    }
    return true;
  });

  const filteredTransactions = dateFilteredTransactions.filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.categorie.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const revenueByType = dateFilteredTransactions
    .filter(tx => tx.type === "revenu")
    .reduce<Record<string, number>>((acc, tx) => {
      const key = tx.categorie;
      acc[key] = (acc[key] || 0) + Number(tx.montant || 0);
      return acc;
    }, {});

  const summaryFromRange = dateFilteredTransactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.montant || 0);
      if (tx.type === "revenu") acc.total_revenus += amount;
      if (tx.type === "depense") acc.total_depenses += amount;
      return acc;
    },
    {
      total_revenus: 0,
      total_depenses: 0,
      solde_net: 0,
      total_dimes: 0
    }
  );
  summaryFromRange.solde_net = summaryFromRange.total_revenus - summaryFromRange.total_depenses;

  const categorySpendFromRange = dateFilteredTransactions
    .filter(tx => tx.type === "depense")
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.categorie] = (acc[tx.categorie] || 0) + Number(tx.montant || 0);
      return acc;
    }, {});

  const budgetRows = Object.entries(categorySpendFromRange).map(([categorie, totalDepense]) => ({
    categorie,
    total_depense: totalDepense,
    montant_alloue: totalDepense,
  }));

  const exportEssentials = async () => {
    if (!dateFilteredTransactions.length) {
      toast.warning("Aucune transaction à exporter sur la période sélectionnée.");
      return;
    }

    const XLSX = await import("xlsx");

    const summaryRows = [
      { Indicateur: "Date début", Valeur: startDate || "N/A" },
      { Indicateur: "Date fin", Valeur: endDate || "N/A" },
      { Indicateur: "Revenus totaux", Valeur: summaryFromRange.total_revenus },
      { Indicateur: "Dépenses totales", Valeur: summaryFromRange.total_depenses },
      { Indicateur: "Solde net", Valeur: summaryFromRange.solde_net },
      { Indicateur: "Offrandes", Valeur: revenueByType.offrande || 0 },
      { Indicateur: "Dimes", Valeur: revenueByType.dime || 0 },
      { Indicateur: "Gifts", Valeur: revenueByType.gifts || 0 },
      { Indicateur: "Special Offering", Valeur: revenueByType.special_offering || 0 }
    ];

    const txRows = dateFilteredTransactions.map(tx => ({
      Date: tx.date_transaction,
      Description: tx.description,
      Categorie: tx.categorie,
      Type: tx.type,
      Montant: Number(tx.montant || 0),
      TypeRevenu: tx.type === "revenu" ? (REVENUE_CATEGORY_LABELS[tx.categorie] || tx.categorie) : "-"
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Resume");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txRows), "Transactions");

    const filename = `finance_essentiels_${startDate || "debut"}_${endDate || "fin"}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success("Export essentiels généré.");
  };

  if (!summary) return (
    <div className="space-y-6 min-h-screen">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des données financières...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Gestion Financière
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Vue d'ensemble des finances de l'église
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={exportEssentials}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
          >
            <Download size={18} />
            Export essentiels
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 text-sm sm:text-base"
          >
            <Plus size={18} />
            Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="sm:hidden">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as Period)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm w-full"
          >
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Année</option>
            <option value="custom">Personnalisée</option>
          </select>
        </div>
        <div className="hidden sm:flex gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm w-fit">
          {(["week", "month", "quarter", "year"] as Period[]).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {period === "week"
                ? "Semaine"
                : period === "month"
                ? "Mois"
                : period === "quarter"
                ? "Trimestre"
                : "Année"}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={startDate}
          onChange={e => {
            setStartDate(e.target.value);
            setSelectedPeriod("custom");
          }}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => {
            setEndDate(e.target.value);
            setSelectedPeriod("custom");
          }}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<TrendingUp />}
          label="Revenus totaux"
          value={formatCurrency(summaryFromRange.total_revenus)}
          color="green"
        />
        <SummaryCard
          icon={<TrendingDown />}
          label="Dépenses totales"
          value={formatCurrency(summaryFromRange.total_depenses)}
          color="rose"
        />
        <SummaryCard
          icon={<DollarSign />}
          label="Solde net"
          value={formatCurrency(summaryFromRange.solde_net)}
          color="blue"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
          Revenus par type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<TrendingUp />}
            label="Offrande"
            value={formatCurrency(revenueByType.offrande || 0)}
            color="green"
          />
          <SummaryCard
            icon={<TrendingUp />}
            label="Dime"
            value={formatCurrency(revenueByType.dime || 0)}
            color="blue"
          />
          <SummaryCard
            icon={<TrendingUp />}
            label="Gifts"
            value={formatCurrency(revenueByType.gifts || 0)}
            color="purple"
          />
          <SummaryCard
            icon={<TrendingUp />}
            label="Special Offering"
            value={formatCurrency(revenueByType.special_offering || 0)}
            color="rose"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
          <PieChart size={20} className="sm:w-6 sm:h-6 text-cyan-600" />
          Budget par catégorie
        </h2>

        <div className="space-y-4 sm:space-y-6">
          {(budgetRows.length ? budgetRows : budgets).map(b => {
            const allocated = Number(b.montant_alloue || 0);
            const spent = Number(b.total_depense || 0);
            const percent = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

            return (
              <div key={b.categorie} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">{b.categorie}</span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(b.total_depense)} /{" "}
                    {formatCurrency(b.montant_alloue)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 sm:h-3">
                  <div
                    className={`h-full rounded-full ${
                      percent > 90
                        ? "bg-gradient-to-r from-rose-500 to-red-600"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {percent}% utilisé
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <FileText size={20} className="sm:w-6 sm:h-6 text-cyan-600" />
            Transactions récentes
          </h2>
          <div className="relative w-full sm:w-auto">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block sm:hidden space-y-4">
          {filteredTransactions.map(t => (
            <div key={t.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{t.description}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(t.date_transaction).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    t.type === "revenu" ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.type === "revenu" ? "+" : "-"}
                    {formatCurrency(t.montant)}
                  </p>
                  <button
                    onClick={() => setEditing(t)}
                    className="mt-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Eye size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                  {t.type === "revenu" ? (REVENUE_CATEGORY_LABELS[t.categorie] || t.categorie) : "Dépense"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{t.type === "revenu" ? "Revenu" : "Dépense"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <td className="px-4 py-3">
                    {new Date(t.date_transaction).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-medium">{t.description}</td>
                  <td className="px-4 py-3">{t.type === "revenu" ? (REVENUE_CATEGORY_LABELS[t.categorie] || t.categorie) : "Dépense"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {t.type === "revenu" ? "Revenu" : "Dépense"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {t.type === "revenu" ? "+" : "-"}
                    {formatCurrency(t.montant)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setEditing(t)}>
                      <Eye size={18} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateTransactionModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchAll}
        />
      )}

      {editing && (
        <EditTransactionModal
          transaction={editing}
          onClose={() => setEditing(null)}
          onUpdated={fetchAll}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const gradients: Record<string, string> = {
    green: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-900/40",
    rose: "from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-100 dark:border-rose-900/40",
    blue: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900/40",
    purple: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-100 dark:border-purple-900/40"
  };
  const iconBg: Record<string, string> = {
    green: "bg-green-500",
    rose: "bg-rose-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500"
  };

  return (
    <div className={`bg-gradient-to-br ${gradients[color]} rounded-2xl p-6 border`}>
      <div className={`w-12 h-12 ${iconBg[color]} rounded-xl flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}
