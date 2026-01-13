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

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("volunteer_requests")
      .select("*")
      .order("created_at", { ascending: false });

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
        <div className="flex gap-3">
          <select
            value={groupBy}
            onChange={e =>
              setGroupBy(e.target.value as "none" | "ministry" | "availability")
            }
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="none">Sans regroupement</option>
            <option value="ministry">Par ministère</option>
            <option value="availability">Par disponibilité</option>
          </select>
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
          <h3 className="font-semibold text-gray-800">
            {group} ({rows.length})
          </h3>

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3">Téléphone</th>
                  <th className="p-3">Ministère</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(v => (
                  <tr
                    key={v.id}
                    className={v.processed ? "bg-green-50" : ""}
                  >
                    <td className="p-3">
                      {v.first_name} {v.last_name}
                    </td>
                    <td className="p-3">{v.phone}</td>
                    <td className="p-3">{v.ministry}</td>
                    <td className="p-3">
                      {new Date(v.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setView(v)}
                        className="border px-2 py-1 rounded-md"
                      >
                        <Eye size={14} />
                      </button>

                      {!v.processed && (
                        <button
                          onClick={() => markProcessed(v.id)}
                          className="border px-2 py-1 rounded-md"
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
          <div className="bg-white rounded-md p-6 max-w-md w-full space-y-2">
            <p><strong>Nom :</strong> {view.first_name} {view.last_name}</p>
            <p><strong>Email :</strong> {view.email || "N/A"}</p>
            <p><strong>Téléphone :</strong> {view.phone}</p>
            <p><strong>Ministère :</strong> {view.ministry}</p>
            <p><strong>Disponibilités :</strong> {view.availability.join(", ")}</p>
            <p className="text-sm text-gray-600">{view.skills}</p>

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
