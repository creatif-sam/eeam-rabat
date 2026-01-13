"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Activity,
  Filter,
  ChevronDown,
  PieChart,
  BarChart3,
  LineChart as LineChartIcon
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
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

export default function ReportsTab() {
  const supabase = createClient();

  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [membershipGrowth, setMembershipGrowth] = useState<any[]>([]);
  const [groupDistribution, setGroupDistribution] = useState<any[]>([]);
  const [ministryParticipation, setMinistryParticipation] = useState<any[]>([]);
  const [kpiCards, setKpiCards] = useState<any[]>([]);

  const COLORS = ["#06b6d4", "#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b"];

  useEffect(() => {
    loadAll();
  }, [selectedPeriod]);

  const loadAll = async () => {
    await Promise.all([
      loadAttendance(),
      loadFinance(),
      loadMembers(),
      loadGroups(),
      loadMinistries()
    ]);
  };

  const loadAttendance = async () => {
    const { data } = await supabase
      .from("attendance_records")
      .select("attendance_date, culte_total");

    const grouped: Record<string, number> = {};

    data?.forEach(row => {
      const month = new Date(row.attendance_date).toLocaleDateString("fr-FR", {
        month: "short"
      });
      grouped[month] = (grouped[month] || 0) + row.culte_total;
    });

    const result = Object.entries(grouped).map(([month, attendance]) => ({
      month,
      attendance,
      target: attendance + 10
    }));

    setAttendanceData(result);
  };

  const loadFinance = async () => {
    const { data } = await supabase
      .from("finance_records")
      .select("record_date, amount, type");

    const grouped: Record<string, any> = {};

    data?.forEach(row => {
      const month = new Date(row.record_date).toLocaleDateString("fr-FR", {
        month: "short"
      });

      if (!grouped[month]) {
        grouped[month] = { month, revenus: 0, depenses: 0 };
      }

      if (row.type === "income") grouped[month].revenus += row.amount;
      if (row.type === "expense") grouped[month].depenses += row.amount;
    });

    setFinanceData(Object.values(grouped));
  };

  const loadMembers = async () => {
    const { data } = await supabase.from("members").select("created_at");

    const grouped: Record<string, number> = {};

    data?.forEach(m => {
      const month = new Date(m.created_at).toLocaleDateString("fr-FR", {
        month: "short"
      });
      grouped[month] = (grouped[month] || 0) + 1;
    });

    let total = 0;
    const result = Object.entries(grouped).map(([month, nouveaux]) => {
      total += nouveaux;
      return { month, membres: total, nouveaux };
    });

    setMembershipGrowth(result);
  };

  const loadGroups = async () => {
    const { data } = await supabase
      .from("group_join_requests")
      .select("groupes_commissions(name)")
      .eq("processed", true);

    const grouped: Record<string, number> = {};

    data?.forEach(r => {
      if (r.groupes_commissions && r.groupes_commissions.length > 0) {
        const groupName = r.groupes_commissions[0].name;
        grouped[groupName] = (grouped[groupName] || 0) + 1;
      }
    });

    setGroupDistribution(
      Object.entries(grouped).map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i % COLORS.length]
      }))
    );
  };

  const loadMinistries = async () => {
    const { data } = await supabase
      .from("volunteer_requests")
      .select("ministry")
      .eq("processed", true);

    const grouped: Record<string, number> = {};

    data?.forEach(v => {
      grouped[v.ministry] = (grouped[v.ministry] || 0) + 1;
    });

    setMinistryParticipation(
      Object.entries(grouped).map(([ministry, participants]) => ({
        ministry,
        participants
      }))
    );
  };

  useEffect(() => {
    setKpiCards([
      {
        title: "Croissance Membres",
        value: membershipGrowth.length
          ? `+${membershipGrowth.at(-1).nouveaux}`
          : "0",
        change: "+",
        isPositive: true,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        bgColor: "from-blue-50 to-indigo-50"
      },
      {
        title: "Assiduité Moyenne",
        value: attendanceData.length
          ? `${Math.round(
              attendanceData.reduce((a, b) => a + b.attendance, 0) /
                attendanceData.length
            )}`
          : "0",
        change: "+",
        isPositive: true,
        icon: Activity,
        color: "from-green-500 to-emerald-600",
        bgColor: "from-green-50 to-emerald-50"
      },
      {
        title: "Revenus",
        value: financeData.length
          ? `${Math.round(
              financeData.reduce((a, b) => a + b.revenus, 0) / 1000
            )}K`
          : "0",
        change: "+",
        isPositive: true,
        icon: DollarSign,
        color: "from-purple-500 to-purple-600",
        bgColor: "from-purple-50 to-violet-50"
      },
      {
        title: "Événements",
        value: attendanceData.length,
        change: "+",
        isPositive: true,
        icon: Calendar,
        color: "from-rose-500 to-pink-600",
        bgColor: "from-rose-50 to-pink-50"
      }
    ]);
  }, [attendanceData, financeData, membershipGrowth]);

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Rapports et Analytics
        </h1>
        <p className="text-gray-600">
          Vue d’ensemble des statistiques et performances
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className={`bg-gradient-to-br ${kpi.bgColor} rounded-2xl p-6`}
            >
              <div className="flex justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <div className="text-green-600 text-sm font-medium">
                  <TrendingUp size={14} />
                </div>
              </div>
              <p className="text-sm text-gray-600">{kpi.title}</p>
              <p className="text-3xl font-bold">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <LineChartIcon className="text-cyan-600" />
            Assiduité
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area dataKey="attendance" stroke="#06b6d4" fill="#06b6d4" />
              <Line dataKey="target" stroke="#f59e0b" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="text-cyan-600" />
            Revenus et Dépenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenus" fill="#10b981" />
              <Bar dataKey="depenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MINISTRIES */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Participation aux ministères</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ministryParticipation} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="ministry" type="category" />
            <Tooltip />
            <Bar dataKey="participants" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
