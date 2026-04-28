"use client";

import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  Calendar,
  Activity,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  ClipboardList,
  Download,
  FileText
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Period = "all" | "week" | "month" | "quarter" | "year";

const COLORS = ["#06b6d4", "#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"];

function monthKey(dateValue: string | Date) {
  const d = new Date(dateValue);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelFromKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(amount);
}

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function periodLabel(period: Period) {
  if (period === "all") return "Toutes périodes";
  if (period === "week") return "Cette semaine";
  if (period === "month") return "Ce mois";
  if (period === "quarter") return "Ce trimestre";
  return "Cette année";
}

export default function ReportsTab() {
  const supabase = createClient();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [groupDistribution, setGroupDistribution] = useState<any[]>([]);
  const [ministryParticipation, setMinistryParticipation] = useState<any[]>([]);
  const [requestsByMonth, setRequestsByMonth] = useState<any[]>([]);
  const [kpiCards, setKpiCards] = useState<any[]>([]);

  useEffect(() => {
    if (selectedPeriod === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    const now = new Date();
    const end = formatDateInput(now);
    const start = new Date(now);

    if (selectedPeriod === "week") start.setDate(now.getDate() - 6);
    if (selectedPeriod === "month") start.setMonth(now.getMonth() - 1);
    if (selectedPeriod === "quarter") start.setMonth(now.getMonth() - 3);
    if (selectedPeriod === "year") start.setFullYear(now.getFullYear() - 1);

    setStartDate(formatDateInput(start));
    setEndDate(end);
  }, [selectedPeriod]);

  useEffect(() => {
    loadAll();
  }, [startDate, endDate]);

  const inRange = (dateValue: string | Date) => {
    const d = new Date(dateValue);
    if (startDate && d < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  };

  const loadAll = async () => {
    setLoading(true);

    const [
      membersRes,
      baptismsRes,
      eventsRes,
      formationsRes,
      tasksRes,
      transactionsRes,
      groupJoinRes,
      volunteerRes,
      prayerRes,
      counsellingRes,
      commissionRes
    ] = await Promise.all([
      supabase.from("member_registrations").select("id, created_at"),
      supabase.from("baptisms").select("id, date_demande, statut"),
      supabase.from("events").select("id, event_date"),
      supabase.from("formations").select("id, date_debut, statut"),
      supabase.from("tasks").select("id, created_at, status"),
      supabase.from("transactions_financieres").select("date_transaction, montant, type"),
      supabase.from("group_join_requests").select("created_at, processed, groupes_commissions(name)"),
      supabase.from("volunteer_requests").select("created_at, processed, ministry"),
      supabase.from("prayer_requests").select("created_at"),
      supabase.from("pastoral_counselling").select("created_at"),
      supabase.from("commission_requests").select("created_at, processed")
    ]);

    const members = (membersRes.data ?? []).filter((row: any) => inRange(row.created_at));
    const baptisms = (baptismsRes.data ?? []).filter((row: any) => inRange(row.date_demande));
    const events = (eventsRes.data ?? []).filter((row: any) => inRange(row.event_date));
    const formations = (formationsRes.data ?? []).filter((row: any) => inRange(row.date_debut));
    const tasks = (tasksRes.data ?? []).filter((row: any) => inRange(row.created_at));
    const transactions = (transactionsRes.data ?? []).filter((row: any) => inRange(row.date_transaction));
    const groupJoins = (groupJoinRes.data ?? []).filter((row: any) => inRange(row.created_at));
    const volunteers = (volunteerRes.data ?? []).filter((row: any) => inRange(row.created_at));
    const prayers = (prayerRes.data ?? []).filter((row: any) => inRange(row.created_at));
    const counselling = (counsellingRes.data ?? []).filter((row: any) => inRange(row.created_at));
    const commissions = (commissionRes.data ?? []).filter((row: any) => inRange(row.created_at));

    const monthSet = new Set<string>();
    [...members, ...baptisms, ...events, ...formations, ...tasks, ...transactions, ...groupJoins, ...volunteers, ...prayers, ...counselling, ...commissions].forEach((row: any) => {
      const dateValue = row.created_at ?? row.date_demande ?? row.event_date ?? row.date_debut ?? row.date_transaction;
      if (dateValue) monthSet.add(monthKey(dateValue));
    });

    let monthKeys = Array.from(monthSet).sort();
    if (!monthKeys.length) monthKeys = [monthKey(new Date())];

    const timelineMap: Record<string, any> = {};
    monthKeys.forEach(key => {
      timelineMap[key] = {
        month: monthLabelFromKey(key),
        membres: 0,
        baptemes: 0,
        evenements: 0,
        formations: 0,
        taches: 0
      };
    });

    members.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (timelineMap[key]) timelineMap[key].membres += 1;
    });
    baptisms.forEach((row: any) => {
      const key = monthKey(row.date_demande);
      if (timelineMap[key]) timelineMap[key].baptemes += 1;
    });
    events.forEach((row: any) => {
      const key = monthKey(row.event_date);
      if (timelineMap[key]) timelineMap[key].evenements += 1;
    });
    formations.forEach((row: any) => {
      const key = monthKey(row.date_debut);
      if (timelineMap[key]) timelineMap[key].formations += 1;
    });
    tasks.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (timelineMap[key]) timelineMap[key].taches += 1;
    });

    const nextAttendanceData = Object.values(timelineMap);
    setAttendanceData(nextAttendanceData);

    const financeMap: Record<string, any> = {};
    monthKeys.forEach(key => {
      financeMap[key] = { month: monthLabelFromKey(key), revenus: 0, depenses: 0, net: 0 };
    });

    let totalRevenus = 0;
    let totalDepenses = 0;

    transactions.forEach((tx: any) => {
      const key = monthKey(tx.date_transaction);
      if (!financeMap[key]) return;

      const amount = Number(tx.montant ?? 0);
      if (tx.type === "revenu") {
        financeMap[key].revenus += amount;
        totalRevenus += amount;
      } else {
        financeMap[key].depenses += amount;
        totalDepenses += amount;
      }
      financeMap[key].net = financeMap[key].revenus - financeMap[key].depenses;
    });

    const nextFinanceData = Object.values(financeMap);
    setFinanceData(nextFinanceData);

    const groupsMap: Record<string, number> = {};
    groupJoins
      .filter((row: any) => row.processed)
      .forEach((row: any) => {
        const groupRaw = row.groupes_commissions;
        const groupName = Array.isArray(groupRaw) ? groupRaw[0]?.name : groupRaw?.name;
        if (!groupName) return;
        groupsMap[groupName] = (groupsMap[groupName] || 0) + 1;
      });

    const nextGroupDistribution = Object.entries(groupsMap).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length]
    }));
    setGroupDistribution(nextGroupDistribution);

    const ministryMap: Record<string, number> = {};
    volunteers
      .filter((row: any) => row.processed)
      .forEach((row: any) => {
        const label = row.ministry || "Autres";
        ministryMap[label] = (ministryMap[label] || 0) + 1;
      });

    const nextMinistry = Object.entries(ministryMap).map(([ministry, participants]) => ({ ministry, participants }));
    setMinistryParticipation(nextMinistry);

    const reqMap: Record<string, any> = {};
    monthKeys.forEach(key => {
      reqMap[key] = {
        month: monthLabelFromKey(key),
        commissions: 0,
        groupes: 0,
        benevolat: 0,
        prieres: 0,
        counselling: 0
      };
    });

    commissions.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (reqMap[key]) reqMap[key].commissions += 1;
    });
    groupJoins.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (reqMap[key]) reqMap[key].groupes += 1;
    });
    volunteers.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (reqMap[key]) reqMap[key].benevolat += 1;
    });
    prayers.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (reqMap[key]) reqMap[key].prieres += 1;
    });
    counselling.forEach((row: any) => {
      const key = monthKey(row.created_at);
      if (reqMap[key]) reqMap[key].counselling += 1;
    });

    const nextRequests = Object.values(reqMap);
    setRequestsByMonth(nextRequests);

    const totalPendingRequests =
      commissions.filter((r: any) => !r.processed).length +
      groupJoins.filter((r: any) => !r.processed).length +
      volunteers.filter((r: any) => !r.processed).length +
      baptisms.filter((r: any) => r.statut === "en_attente").length;

    const openTasks = tasks.filter((t: any) => t.status !== "done").length;
    const upcomingEvents = events.filter((e: any) => new Date(e.event_date) >= new Date()).length;
    const baptizedCount = baptisms.filter((b: any) => b.statut === "baptise").length;

    setKpiCards([
      { title: "Membres enregistrés", value: members.length, icon: Users, color: "from-blue-500 to-blue-600" },
      { title: "Baptêmes validés", value: baptizedCount, icon: Activity, color: "from-cyan-500 to-sky-600" },
      { title: "Événements à venir", value: upcomingEvents, icon: Calendar, color: "from-emerald-500 to-green-600" },
      { title: "Solde net", value: formatMoney(totalRevenus - totalDepenses), icon: DollarSign, color: "from-purple-500 to-indigo-600" },
      { title: "Tâches ouvertes", value: openTasks, icon: ClipboardList, color: "from-amber-500 to-orange-600" },
      { title: "Requêtes en attente", value: totalPendingRequests, icon: Activity, color: "from-rose-500 to-pink-600" }
    ]);

    setLoading(false);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Rapport Dashboard EEAM", 14, 14);
    doc.setFontSize(10);
    doc.text(`Période: ${periodLabel(selectedPeriod)}${startDate ? ` | ${startDate}` : ""}${endDate ? ` -> ${endDate}` : ""}`, 14, 21);

    autoTable(doc, {
      startY: 28,
      head: [["KPI", "Valeur"]],
      body: kpiCards.map(kpi => [kpi.title, String(kpi.value)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [6, 182, 212] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [["Mois", "Membres", "Baptêmes", "Événements", "Formations", "Tâches"]],
      body: attendanceData.map(row => [row.month, row.membres, row.baptemes, row.evenements, row.formations, row.taches]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [["Mois", "Revenus", "Dépenses", "Net"]],
      body: financeData.map(row => [row.month, formatMoney(row.revenus), formatMoney(row.depenses), formatMoney(row.net)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    const fileName = `rapport-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("Rapport PDF exporté");
  };

  const exportWord = () => {
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Rapport Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1, h2 { color: #0f172a; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Rapport Dashboard EEAM</h1>
        <p><strong>Période:</strong> ${periodLabel(selectedPeriod)} ${startDate ? `| ${startDate}` : ""} ${endDate ? `-> ${endDate}` : ""}</p>

        <h2>KPI</h2>
        <table>
          <tr><th>KPI</th><th>Valeur</th></tr>
          ${kpiCards.map(k => `<tr><td>${k.title}</td><td>${k.value}</td></tr>`).join("")}
        </table>

        <h2>Activité Mensuelle</h2>
        <table>
          <tr><th>Mois</th><th>Membres</th><th>Baptêmes</th><th>Événements</th><th>Formations</th><th>Tâches</th></tr>
          ${attendanceData.map((r: any) => `<tr><td>${r.month}</td><td>${r.membres}</td><td>${r.baptemes}</td><td>${r.evenements}</td><td>${r.formations}</td><td>${r.taches}</td></tr>`).join("")}
        </table>

        <h2>Finances</h2>
        <table>
          <tr><th>Mois</th><th>Revenus</th><th>Dépenses</th><th>Net</th></tr>
          ${financeData.map((r: any) => `<tr><td>${r.month}</td><td>${formatMoney(r.revenus)}</td><td>${formatMoney(r.depenses)}</td><td>${formatMoney(r.net)}</td></tr>`).join("")}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport Word exporté");
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 dark:bg-gray-950 min-h-screen text-gray-700 dark:text-gray-300">
        Chargement des rapports dynamiques...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Rapports et Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Données dynamiques consolidées depuis tous les onglets du dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as Period)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="all">Toutes périodes</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setSelectedPeriod("all"); }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          />

          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setSelectedPeriod("all"); }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          />

          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2"
          >
            <Download size={16} /> PDF
          </button>

          <button
            onClick={exportWord}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Word
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white" size={18} />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <LineChartIcon className="text-cyan-600" size={18} />
            Activité mensuelle (Membres, Baptêmes, Événements)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="membres" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
              <Area type="monotone" dataKey="baptemes" stackId="1" stroke="#06b6d4" fill="#67e8f9" />
              <Line type="monotone" dataKey="evenements" stroke="#8b5cf6" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Membres</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" />Baptêmes</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />Événements</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-cyan-600" size={18} />
            Revenus et Dépenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={v => formatMoney(Number(v ?? 0))} />
              <Legend />
              <Bar dataKey="revenus" fill="#10b981" />
              <Bar dataKey="depenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Revenus</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Dépenses</span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-white">Participation aux ministères</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ministryParticipation} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="ministry" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="participants" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" />Participants validés par ministère</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <PieChartIcon className="text-cyan-600" size={18} />
            Distribution des demandes de groupe
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={groupDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
                {groupDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span>Chaque couleur représente une commission/groupe.</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Flux mensuel des requêtes (formulaires)
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={requestsByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="commissions" stackId="a" fill="#3b82f6" />
            <Bar dataKey="groupes" stackId="a" fill="#06b6d4" />
            <Bar dataKey="benevolat" stackId="a" fill="#10b981" />
            <Bar dataKey="prieres" stackId="a" fill="#f59e0b" />
            <Bar dataKey="counselling" stackId="a" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Commissions</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" />Groupes</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Bénévolat</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Prières</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" />Counselling</span>
        </div>
      </div>
    </div>
  );
}
