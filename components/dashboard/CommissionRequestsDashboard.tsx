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

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    let query = supabase
      .from("commission_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("request_type", filter);
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
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="all">Toutes les demandes</option>
          <option value="Prière">Prière</option>
          <option value="Budget">Budget</option>
          <option value="Conseil spirituel">Conseil spirituel</option>
          <option value="Service">Service</option>
          <option value="Autre">Autre</option>
        </select>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm"
        >
          <Download size={16} />
          Exporter Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Responsable</th>
              <th className="p-3">Type</th>
              <th className="p-3">Email</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map(r => (
              <tr
                key={r.id}
                className={r.processed ? "bg-green-50" : ""}
              >
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3">{r.request_type}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => setView(r)}
                    className="border px-2 py-1 rounded-md"
                  >
                    <Eye size={14} />
                  </button>

                  {!r.processed && (
                    <button
                      onClick={() => markProcessed(r.id)}
                      className="border px-2 py-1 rounded-md"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Aucune demande
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {view && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-lg w-full space-y-3">
            <h3 className="font-semibold text-gray-800">
              Détails de la demande
            </h3>

            <p><strong>Responsable :</strong> {view.full_name}</p>
            <p><strong>Email :</strong> {view.email}</p>
            <p><strong>Type :</strong> {view.request_type}</p>
            <p className="text-sm whitespace-pre-line">
              {view.details}
            </p>

            <button
              onClick={() => setView(null)}
              className="mt-4 px-4 py-2 border rounded-md"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
