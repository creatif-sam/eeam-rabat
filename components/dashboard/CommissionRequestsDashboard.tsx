"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, CheckCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

type CommissionRequest = {
  id: string;
  full_name: string;
  email: string;
  request_type: string;
  details: string;
  processed: boolean;
  created_at: string;
};

export default function CommissionRequestsDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<CommissionRequest[]>([]);
  const [view, setView] = useState<CommissionRequest | null>(null);
  const [filter, setFilter] = useState("all");
  // Pending requests are what admins act on day-to-day; showing everything
  // by default means this query grows unbounded as the church's history grows.
  const [showProcessed, setShowProcessed] = useState(false);

  useEffect(() => {
    load();
  }, [filter, showProcessed]);

  const load = async () => {
    let query = supabase
      .from("commission_requests")
      .select("id, full_name, email, request_type, details, processed, created_at")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("request_type", filter);
    }
    if (!showProcessed) {
      query = query.eq("processed", false);
    }

    const { data } = await query;
    setData(data || []);
  };

  const markProcessed = async (id: string) => {
    await supabase
      .from("commission_requests")
      .update({ processed: true })
      .eq("id", id);

    load();
  };

  const exportExcel = () => {
    const rows = data.map(r => ({
      Nom: r.full_name,
      Email: r.email,
      Type: r.request_type,
      Traité: r.processed ? "Oui" : "Non",
      Date: new Date(r.created_at).toLocaleDateString(),
      Détails: r.details
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Demandes Commissions");
    XLSX.writeFile(wb, "demandes_commissions.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-sm outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="all">Toutes les demandes</option>
            <option value="Prière">Prière</option>
            <option value="Budget">Budget</option>
            <option value="Conseil spirituel">Conseil spirituel</option>
            <option value="Service">Service</option>
            <option value="Autre">Autre</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showProcessed}
              onChange={e => setShowProcessed(e.target.checked)}
            />
            Inclure les demandes traitées
          </label>
        </div>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm"
        >
          <Download size={16} />
          Exporter Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left text-gray-700 dark:text-gray-300">Responsable</th>
              <th className="p-3 text-gray-700 dark:text-gray-300">Type</th>
              <th className="p-3 text-gray-700 dark:text-gray-300">Email</th>
              <th className="p-3 text-gray-700 dark:text-gray-300">Date</th>
              <th className="p-3 text-right text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map(r => (
              <tr
                key={r.id}
                className={`border-t border-gray-100 dark:border-gray-800 transition-colors ${r.processed ? "bg-green-50 dark:bg-green-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
              >
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{r.full_name}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{r.request_type}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{r.email}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => setView(r)}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye size={14} />
                  </button>

                  {!r.processed && (
                    <button
                      onClick={() => markProcessed(r.id)}
                      className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-md hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  Aucune demande
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {view && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 max-w-lg w-full space-y-3 shadow-2xl">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Détails de la demande
            </h3>

            <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Responsable :</strong> {view.full_name}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Email :</strong> {view.email}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Type :</strong> {view.request_type}</p>
            <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
              {view.details}
            </p>

            <button
              onClick={() => setView(null)}
              className="mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
