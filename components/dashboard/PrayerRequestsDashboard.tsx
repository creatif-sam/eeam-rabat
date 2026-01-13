"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, CheckCircle, Lock } from "lucide-react";

type PrayerRequest = {
  id: string;
  full_name: string;
  email: string | null;
  subject: string;
  message: string;
  confidential: boolean;
  processed: boolean;
  created_at: string;
};

export default function PrayerRequestsDashboard() {
  const supabase = createClient();

  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [selected, setSelected] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confidential" | "public">(
    "all"
  );

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);

    let query = supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "confidential") {
      query = query.eq("confidential", true);
    }

    if (filter === "public") {
      query = query.eq("confidential", false);
    }

    const { data } = await query;
    setRequests(data || []);
    setLoading(false);
  };

  const markProcessed = async (id: string) => {
    await supabase
      .from("prayer_requests")
      .update({ processed: true })
      .eq("id", id);

    loadRequests();
  };

  useEffect(() => {
    loadRequests();
  }, [filter]);

  if (loading) {
    return <p className="text-gray-500">Chargement des demandes</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Demandes de prière
          </h2>
          <p className="text-sm text-gray-500">
            Gestion et suivi des sujets de prière
          </p>
        </div>

        <select
          value={filter}
          onChange={e =>
            setFilter(e.target.value as "all" | "confidential" | "public")
          }
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Toutes</option>
          <option value="confidential">Confidentielles</option>
          <option value="public">Non confidentielles</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Sujet</th>
              <th className="px-4 py-3 text-center">Confidentiel</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map(req => (
              <tr
                key={req.id}
                className={`border-t ${
                  req.processed ? "bg-green-50" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {req.full_name}
                </td>
                <td className="px-4 py-3">
                  {req.subject}
                </td>
                <td className="px-4 py-3 text-center">
                  {req.confidential && <Lock size={14} className="inline" />}
                </td>
                <td className="px-4 py-3">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelected(req)}
                      className="p-2 border rounded-lg hover:bg-gray-100"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>

                    {!req.processed && (
                      <button
                        onClick={() => markProcessed(req.id)}
                        className="p-2 border rounded-lg hover:bg-green-50"
                        title="Marquer comme traité"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">
                Sujet de prière
              </h3>
              <p className="text-sm text-gray-500">
                {selected.subject}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <p>
                <strong>Nom :</strong> {selected.full_name}
              </p>

              {selected.email && (
                <p>
                  <strong>Email :</strong> {selected.email}
                </p>
              )}

              <p className="whitespace-pre-line">
                {selected.message}
              </p>
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
