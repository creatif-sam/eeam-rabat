"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, CalendarDays, Eye, Edit } from "lucide-react";
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

function Detail({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-400 tracking-wide">
        {label}
      </p>
      <p className="mt-1 font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}

export default function AttendanceDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<AttendanceRow[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [viewRow, setViewRow] = useState<AttendanceRow | null>(null);
  const [editRow, setEditRow] = useState<AttendanceRow | null>(null);

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
        service_types(name)
      `)
      .order("attendance_date", { ascending: true });

    // Transform the data to match the expected type
    const transformedData = (data || []).map(item => ({
      ...item,
      service: item.service_types && item.service_types.length > 0 ? { name: item.service_types[0].name } : { name: '' }
    }));

    setData(transformedData);
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
      if (!grouped[r.attendance_date]) {
        grouped[r.attendance_date] = { date: r.attendance_date };
      }
      grouped[r.attendance_date][r.service.name] = r.culte_total;
    });
    return Object.values(grouped);
  }, [filteredData]);

  const exportCSV = () => {
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
    a.download = "assiduite.csv";
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

      {/* Chart */}
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

      {/* Table with actions */}
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
              <th className="px-4 py-3 text-right">Actions</th>
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
                <td className="px-4 py-3">{row.service.name}</td>
                <td className="px-4 py-3 text-center">{row.culte_total}</td>
                <td className="px-4 py-3 text-center">{row.hommes}</td>
                <td className="px-4 py-3 text-center">{row.femmes}</td>
                <td className="px-4 py-3 text-center">{row.enfants}</td>
                <td className="px-4 py-3 text-center">{row.nouveaux}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setViewRow(row)}
                      className="p-2 rounded-lg border hover:bg-gray-100"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => setEditRow(row)}
                      className="p-2 rounded-lg border hover:bg-gray-100"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View modal */}
    {viewRow && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Détails de l’assiduité
        </h3>
        <p className="text-sm text-gray-500">
          Informations du service enregistré
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Date" value={viewRow.attendance_date} />
          <Detail label="Service" value={viewRow.service.name} />
          <Detail label="Culte total" value={viewRow.culte_total} />
          <Detail label="Hommes" value={viewRow.hommes} />
          <Detail label="Femmes" value={viewRow.femmes} />
          <Detail label="Enfants" value={viewRow.enfants} />
          <Detail label="Nouveaux" value={viewRow.nouveaux} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-end">
        <button
          onClick={() => setViewRow(null)}
          className="px-5 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
)}

      {/* Edit modal */}
      {editRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Modifier</h3>

            {(["culte_total","hommes","femmes","enfants","nouveaux"] as const).map(
              field => (
                <input
                  key={field}
                  type="number"
                  value={(editRow as any)[field]}
                  onChange={e =>
                    setEditRow({
                      ...editRow,
                      [field]: Number(e.target.value)
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditRow(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await supabase
                    .from("attendance_records")
                    .update({
                      culte_total: editRow.culte_total,
                      hommes: editRow.hommes,
                      femmes: editRow.femmes,
                      enfants: editRow.enfants,
                      nouveaux: editRow.nouveaux
                    })
                    .eq("attendance_date", editRow.attendance_date);

                  setEditRow(null);
                  loadData();
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
