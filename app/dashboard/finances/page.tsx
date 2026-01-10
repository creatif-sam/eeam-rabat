"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  FileText,
  PieChart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CreateTransactionModal from "@/components/finances/CreateTransactionModal";
import EditTransactionModal from "@/components/finances/EditTransactionModal";
import { exportCSV } from "@/lib/finance/exportCsv";

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

export default function FinancesTab() {
  const supabase = createClient();

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");

  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchAll();
  }, [selectedPeriod]);

  const fetchAll = async () => {
    const [{ data: resume }, { data: tx }, { data: budget }] =
      await Promise.all([
        supabase.from("vue_finance_resume").select("*").single(),
        supabase
          .from("transactions_financieres")
          .select("*")
          .order("date_transaction", { ascending: false }),
        supabase.from("vue_depenses_par_categorie").select("*")
      ]);

    setSummary(resume);
    setTransactions(tx || []);
    setBudgets(budget || []);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD"
    }).format(Math.abs(amount));

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.categorie.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!summary) return <p className="p-8">Chargement...</p>;

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion Financière
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble des finances de l'église
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportCSV(filteredTransactions, selectedPeriod)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm"
          >
            <Download size={18} />
            Exporter
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/30"
          >
            <Plus size={18} />
            Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm w-fit">
        {["week", "month", "quarter", "year"].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === period
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<TrendingUp />}
          label="Revenus totaux"
          value={formatCurrency(summary.total_revenus)}
          color="green"
        />
        <SummaryCard
          icon={<TrendingDown />}
          label="Dépenses totales"
          value={formatCurrency(summary.total_depenses)}
          color="rose"
        />
        <SummaryCard
          icon={<DollarSign />}
          label="Solde net"
          value={formatCurrency(summary.solde_net)}
          color="blue"
        />
        <SummaryCard
          icon={<Users />}
          label="Dîmes collectées"
          value={formatCurrency(summary.total_dimes)}
          color="purple"
        />
      </div>

      {/* Budget */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PieChart size={24} className="text-cyan-600" />
          Budget par catégorie
        </h2>

        {budgets.map(b => {
          const percent = Math.round(
            (b.total_depense / b.montant_alloue) * 100
          );

          return (
            <div key={b.categorie} className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{b.categorie}</span>
                <span className="text-gray-500">
                  {formatCurrency(b.total_depense)} /{" "}
                  {formatCurrency(b.montant_alloue)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-full rounded-full ${
                    percent > 90
                      ? "bg-gradient-to-r from-rose-500 to-red-600"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText size={24} className="text-cyan-600" />
            Transactions récentes
          </h2>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {new Date(t.date_transaction).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 font-medium">{t.description}</td>
                <td className="px-4 py-3">{t.categorie}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {t.source || t.vendeur}
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
  const map: any = {
    green: "from-green-50 to-emerald-50 bg-green-500 border-green-100",
    rose: "from-rose-50 to-pink-50 bg-rose-500 border-rose-100",
    blue: "from-blue-50 to-indigo-50 bg-blue-500 border-blue-100",
    purple: "from-purple-50 to-violet-50 bg-purple-500 border-purple-100"
  };

  return (
    <div className={`bg-gradient-to-br ${map[color]} rounded-2xl p-6 border`}>
      <div
        className={`w-12 h-12 ${map[color].split(" ")[2]} rounded-xl flex items-center justify-center mb-4 text-white`}
      >
        {icon}
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
