"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Users, Eye } from "lucide-react";

type Request = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  motivation: string;
  created_at: string;
  processed: boolean;
  group: { name: string };
};

export default function GroupRequestsDashboard() {
  const supabase = createClient();
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Request | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("group_join_requests")
      .select(
        `
        id,
        full_name,
        phone,
        email,
        motivation,
        created_at,
        processed,
        groupes_commissions(name)
        `
      )
      .order("created_at", { ascending: false });

    // Transform the data to match the expected type
    const transformedData = (data || []).map(item => ({
      ...item,
      group: item.groupes_commissions && item.groupes_commissions.length > 0 ? { name: item.groupes_commissions[0].name } : { name: '' }
    }));

    const statMap: Record<string, number> = {};
    transformedData?.forEach(r => {
      statMap[r.group.name] = (statMap[r.group.name] || 0) + 1;
    });

    setRequests(transformedData);
    setStats(statMap);
    setLoading(false);
  };

  const updateStatus = async (id: string) => {
    await supabase
      .from("group_join_requests")
      .update({ processed: true })
      .eq("id", id);

    loadData();
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des demandes</p>;
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([group, count]) => (
          <div
            key={group}
            className="border rounded-xl p-4 bg-gray-50 flex items-center gap-3"
          >
            <Users className="text-cyan-600" />
            <div>
              <p className="text-sm text-gray-500">{group}</p>
              <p className="text-xl font-bold text-gray-800">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map(req => (
              <tr
                key={req.id}
                className={`border-t text-sm ${
                  req.processed ? "bg-green-50" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">{req.full_name}</td>
                <td className="px-4 py-3">{req.phone}</td>
                <td className="px-4 py-3">{req.group.name}</td>
                <td className="px-4 py-3">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelected(req)}
                      className="p-2 rounded-lg border hover:bg-gray-100"
                      title="Voir la demande"
                    >
                      <Eye size={16} />
                    </button>

                    {!req.processed && (
                      <>
                        <button
                          onClick={() => updateStatus(req.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700"
                        >
                          <CheckCircle size={14} />
                          Approuver
                        </button>
                        <button
                          onClick={() => updateStatus(req.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
                        >
                          <XCircle size={14} />
                          Rejeter
                        </button>
                      </>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Détails de la demande
            </h3>

            <p><strong>Nom</strong> {selected.full_name}</p>
            <p><strong>Téléphone</strong> {selected.phone}</p>
            {selected.email && (
              <p><strong>Email</strong> {selected.email}</p>
            )}
            <p><strong>Commission</strong> {selected.group.name}</p>
            <p>
              <strong>Date</strong>{" "}
              {new Date(selected.created_at).toLocaleString()}
            </p>
            <p><strong>Motivation</strong></p>
            <p className="text-gray-700 text-sm">
              {selected.motivation}
            </p>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border"
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
