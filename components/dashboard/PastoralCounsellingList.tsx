"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, CheckCircle } from "lucide-react";

type Counselling = {
  id: string;
  counselling_date: string;
  counselling_time: string;
  full_name: string;
  phone: string;
  email: string | null;
  reason: string;
  pastors: { name: string } | null;
};

export default function PastoralCounsellingList() {
  const supabase = createClient();
  const [data, setData] = useState<Counselling[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Counselling | null>(null);

  useEffect(() => {
    loadCounselling();
  }, []);

  const loadCounselling = async () => {
    const { data } = await supabase
      .from("pastoral_counselling")
      .select(
        `
        id,
        counselling_date,
        counselling_time,
        full_name,
        phone,
        email,
        reason,
        pastors(name)
        `
      )
      .order("counselling_date", { ascending: true })
      .order("counselling_time", { ascending: true });

    // Transform the data to match the expected type
    const transformedData = (data || []).map(item => ({
      ...item,
      pastors: item.pastors && item.pastors.length > 0 ? { name: item.pastors[0].name } : null
    }));

    setData(transformedData);
    setLoading(false);
  };

  const groupedByDate = data.reduce<Record<string, Counselling[]>>(
    (acc, item) => {
      acc[item.counselling_date] = acc[item.counselling_date] || [];
      acc[item.counselling_date].push(item);
      return acc;
    },
    {}
  );

  if (loading) {
    return <p className="text-gray-500">Chargement des rendez vous</p>;
  }

  if (!data.length) {
    return <p className="text-gray-500">Aucun entretien programmé</p>;
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {date}
          </h3>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-800">{item.full_name}</p>
                    <p className="text-sm text-gray-600">{item.phone}</p>
                    {item.email && (
                      <p className="text-sm text-gray-600">{item.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(item)}
                      className="p-2 rounded-lg border hover:bg-gray-100"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Heure:</span> {item.counselling_time}</p>
                  {item.pastors && (
                    <p><span className="font-medium">Pasteur:</span> {item.pastors.name}</p>
                  )}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3">N°</th>
                  <th className="px-4 py-3">Heure</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Pasteur</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t text-sm hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {item.counselling_time}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.full_name}
                    </td>

                    <td className="px-4 py-3">
                      {item.phone}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {item.email || "—"}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {item.pastors?.name || "Indifférent"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelected(item)}
                          className="p-2 rounded-lg border hover:bg-gray-100"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => alert("Entretien confirmé")}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                        >
                          <CheckCircle size={14} />
                          Confirmer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800">
              Détails de l'entretien
            </h3>

            <div className="space-y-3 text-sm">
              <p><strong>Nom:</strong> {selected.full_name}</p>
              <p><strong>Téléphone:</strong> {selected.phone}</p>
              {selected.email && (
                <p><strong>Email:</strong> {selected.email}</p>
              )}
              <p><strong>Date:</strong> {selected.counselling_date}</p>
              <p><strong>Heure:</strong> {selected.counselling_time}</p>
              <p><strong>Pasteur:</strong> {selected.pastors?.name || "Indifférent"}</p>
              <div>
                <p className="font-semibold mb-1">Motif:</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.reason}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium w-full sm:w-auto"
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
