"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, CalendarDays } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

type AttendanceRow = {
  attendance_date: string;
  culte_total: number;
  hommes: number;
  femmes: number;
  enfants: number;
  nouveaux: number;
  service: { name: string };
};

export default function AttendanceDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<AttendanceRow[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("attendance_records")
      .select(`
        attendance_date,
        culte_total,
        hommes,
        femmes,
        enfants,
        nouveaux,
        service:service_types(name)
      `)
      .order("attendance_date", { ascending: true });

    setData(data || []);
  };

  const months = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => set.add(d.attendance_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [data]);

  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;
    return data.filter(d =>
      d.attendance_date.startsWith(selectedMonth)
    );
  }, [data, selectedMonth]);

  const averages = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};

    filteredData.forEach(r => {
      const key = r.service.name;
      if (!map[key]) map[key] = { sum: 0, count: 0 };
      map[key].sum += r.culte_total;
      map[key].count += 1;
    });

    const result: Record<string, number> = {};
    Object.keys(map).forEach(k => {
      result[k] = Math.round(map[k].sum / map[k].count);
    });

    return result;
  }, [filteredData]);

  const chartData = useMemo(() => {
    const grouped: Record<string, any> = {};

    filteredData.forEach(r => {
      const date = r.attendance_date;
      if (!grouped[date]) grouped[date] = { date };
      grouped[date][r.service.name] = r.culte_total;
    });

    return Object.values(grouped);
  }, [filteredData]);

  const exportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Date",
      "Service",
      "Culte",
      "Hommes",
      "Femmes",
      "Enfants",
      "Nouveaux"
    ];

    const rows = filteredData.map(r => [
      r.attendance_date,
      r.service.name,
      r.culte_total,
      r.hommes,
      r.femmes,
      r.enfants,
      r.nouveaux
    ]);

    const csv =
      [headers, ...rows].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assiduite_filtree.csv";
    a.click();
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          Tableau d’assiduité
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Tous les mois</option>
            {months.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm"
          >
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(averages).map(([service, avg]) => (
          <div
            key={service}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl p-5 shadow"
          >
            <p className="text-sm opacity-90">Moyenne</p>
            <p className="text-lg font-semibold">{service}</p>
            <p className="text-3xl font-bold mt-2">{avg}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800">
          <CalendarDays size={18} />
          Évolution de l’assiduité
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(averages).map(service => (
                <Line
                  key={service}
                  type="monotone"
                  dataKey={service}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold text-gray-800">
          Historique détaillé
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-center">Culte</th>
              <th className="px-4 py-3 text-center">Hommes</th>
              <th className="px-4 py-3 text-center">Femmes</th>
              <th className="px-4 py-3 text-center">Enfants</th>
              <th className="px-4 py-3 text-center">Nouveaux</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr
                key={`${row.attendance_date}-${row.service.name}`}
                className="border-t"
              >
                <td className="px-4 py-3 font-medium">
                  {new Date(row.attendance_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {row.service.name}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.culte_total}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.hommes}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.femmes}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.enfants}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.nouveaux}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
