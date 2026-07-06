"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, CheckCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

type VolunteerRequest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  ministry: string;
  skills: string | null;
  availability: string[];
  processed: boolean;
  created_at: string;
};

export default function VolunteerRequestsDashboard() {
  const supabase = createClient();

  const [data, setData] = useState<VolunteerRequest[]>([]);
  const [view, setView] = useState<VolunteerRequest | null>(null);
  const [groupBy, setGroupBy] = useState<"none" | "ministry" | "availability">(
    "none"
  );
  // Pending requests are what admins act on day-to-day; showing everything
  // by default means this query grows unbounded as the church's history grows.
  const [showProcessed, setShowProcessed] = useState(false);

  useEffect(() => {
    load();
  }, [showProcessed]);

  const load = async () => {
    let query = supabase
      .from("volunteer_requests")
      .select("id, first_name, last_name, email, phone, ministry, skills, availability, processed, created_at")
      .order("created_at", { ascending: false });

    if (!showProcessed) {
      query = query.eq("processed", false);
    }

    const { data } = await query;
    setData(data || []);
  };

  const markProcessed = async (id: string) => {
    await supabase
      .from("volunteer_requests")
      .update({ processed: true })
      .eq("id", id);

    load();
  };

  const exportExcel = () => {
    const rows = data.map(v => ({
      Prénom: v.first_name,
      Nom: v.last_name,
      Téléphone: v.phone,
      Email: v.email || "",
      Ministère: v.ministry,
      Disponibilités: v.availability.join(", "),
      Traité: v.processed ? "Oui" : "Non",
      Date: new Date(v.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bénévolat");

    XLSX.writeFile(workbook, "benevolat.xlsx");
  };

  const groupedData = () => {
    if (groupBy === "none") return { Tous: data };

    const groups: Record<string, VolunteerRequest[]> = {};

    data.forEach(v => {
      if (groupBy === "ministry") {
        groups[v.ministry] = groups[v.ministry] || [];
        groups[v.ministry].push(v);
      }

      if (groupBy === "availability") {
        v.availability.forEach(a => {
          groups[a] = groups[a] || [];
          groups[a].push(v);
        });
      }
    });

    return groups;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={groupBy}
            onChange={e =>
              setGroupBy(e.target.value as "none" | "ministry" | "availability")
            }
            className="border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="none">Sans regroupement</option>
            <option value="ministry">Par ministère</option>
            <option value="availability">Par disponibilité</option>
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

      {/* Grouped tables */}
      {Object.entries(groupedData()).map(([group, rows]) => (
        <div key={group} className="space-y-2">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {group} ({rows.length})
          </h3>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-gray-700 dark:text-gray-300">Nom</th>
                  <th className="p-3 text-gray-700 dark:text-gray-300">Téléphone</th>
                  <th className="p-3 text-gray-700 dark:text-gray-300">Ministère</th>
                  <th className="p-3 text-gray-700 dark:text-gray-300">Date</th>
                  <th className="p-3 text-right text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(v => (
                  <tr
                    key={v.id}
                    className={`border-t border-gray-100 dark:border-gray-700 ${
                      v.processed ? "bg-green-50 dark:bg-green-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <td className="p-3 text-gray-800 dark:text-gray-200">
                      {v.first_name} {v.last_name}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{v.phone}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{v.ministry}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {new Date(v.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setView(v)}
                        className="border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye size={14} />
                      </button>

                      {!v.processed && (
                        <button
                          onClick={() => markProcessed(v.id)}
                          className="border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* View modal */}
      {view && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-md p-6 max-w-md w-full space-y-2 border border-gray-200 dark:border-gray-700 shadow-xl">
            <p className="text-gray-800 dark:text-gray-200"><strong>Nom :</strong> {view.first_name} {view.last_name}</p>
            <p className="text-gray-800 dark:text-gray-200"><strong>Email :</strong> {view.email || "N/A"}</p>
            <p className="text-gray-800 dark:text-gray-200"><strong>Téléphone :</strong> {view.phone}</p>
            <p className="text-gray-800 dark:text-gray-200"><strong>Ministère :</strong> {view.ministry}</p>
            <p className="text-gray-800 dark:text-gray-200"><strong>Disponibilités :</strong> {view.availability.join(", ")}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{view.skills}</p>

            <button
              onClick={() => setView(null)}
              className="mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
