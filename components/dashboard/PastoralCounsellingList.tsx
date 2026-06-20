"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, CheckCircle, Search, FileDown, X } from "lucide-react";
import { toast } from "sonner";

type Counselling = {
  id: string;
  counselling_date: string;
  counselling_time: string;
  full_name: string;
  phone: string;
  email: string | null;
  reason: string;
  confirmed?: boolean;
  pastors: { name: string } | null;
};

async function sendConfirmationWhatsApp(item: Counselling) {
  await fetch("/api/send-whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: item.phone,
      full_name: item.full_name,
      counselling_date: item.counselling_date,
      counselling_time: item.counselling_time,
      pastor_name: item.pastors?.name ?? null,
    }),
  });
}

async function sendConfirmationEmail(item: Counselling) {
  if (!item.email) return;
  // Escape user-supplied values to prevent XSS in email HTML
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#0e7490;margin-bottom:8px">✅ Entretien pastoral confirmé</h2>
      <p style="color:#374151;margin-bottom:16px">Bonjour <strong>${esc(item.full_name)}</strong>,</p>
      <p style="color:#374151">Votre entretien pastoral a été <strong>confirmé</strong>.</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:4px 0;color:#374151"><strong>Date :</strong> ${new Date(item.counselling_date).toLocaleDateString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
        <p style="margin:4px 0;color:#374151"><strong>Heure :</strong> ${esc(item.counselling_time)}</p>
        ${item.pastors ? `<p style="margin:4px 0;color:#374151"><strong>Pasteur :</strong> ${esc(item.pastors.name)}</p>` : ""}
      </div>
      <p style="color:#6b7280;font-size:13px">En cas de besoin, n’hésitez pas à nous contacter.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:24px">Église EEAM — Rabat</p>
    </div>`;
  await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: item.email,
      subject: "Confirmation de votre entretien pastoral — EEAM Rabat",
      html,
    }),
  });
}

export default function PastoralCounsellingList() {
  const supabase = createClient();
  const [data, setData] = useState<Counselling[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Counselling | null>(null);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    loadCounselling();
  }, []);

  const loadCounselling = async () => {
    // Try with `confirmed` column first; fall back to base fields if column missing
    const baseFields = `
      id,
      counselling_date,
      counselling_time,
      full_name,
      phone,
      email,
      reason,
      pastors(name)
    `;

    let rawData: Record<string, unknown>[] | null = null;

    const withConfirmed = await supabase
      .from("pastoral_counselling")
      .select(`confirmed, ${baseFields}`)
      .order("counselling_date", { ascending: false })
      .order("counselling_time", { ascending: false });

    if (!withConfirmed.error) {
      rawData = withConfirmed.data as Record<string, unknown>[];
    } else {
      const fallback = await supabase
        .from("pastoral_counselling")
        .select(baseFields)
        .order("counselling_date", { ascending: false })
        .order("counselling_time", { ascending: false });
      rawData = (fallback.data ?? []) as Record<string, unknown>[];
    }

    const transformedData: Counselling[] = (rawData ?? []).map(item => {
      const p = item.pastors as { name: string }[] | { name: string } | null;
      const pastor = Array.isArray(p) ? (p.length > 0 ? { name: p[0].name } : null) : p ?? null;
      return {
        id: item.id as string,
        counselling_date: item.counselling_date as string,
        counselling_time: item.counselling_time as string,
        full_name: item.full_name as string,
        phone: item.phone as string,
        email: item.email as string | null,
        reason: item.reason as string,
        confirmed: item.confirmed as boolean | undefined,
        pastors: pastor,
      };
    });

    setData(transformedData);
    setLoading(false);
  };

  const handleConfirm = async (item: Counselling) => {
    await supabase
      .from("pastoral_counselling")
      .update({ confirmed: true })
      .eq("id", item.id);
    await Promise.all([
      sendConfirmationEmail(item),
      sendConfirmationWhatsApp(item),
    ]);
    const channels: string[] = [];
    if (item.email) channels.push(`email (${item.email})`);
    if (item.phone) channels.push(`WhatsApp (${item.phone})`);
    toast.success(
      channels.length > 0
        ? `Entretien confirmé — confirmation envoyée par ${channels.join(" et ")}`
        : "Entretien confirmé"
    );
    loadCounselling();
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const nameMatch = item.full_name.toLowerCase().includes(search.toLowerCase());
      const monthMatch = filterMonth ? item.counselling_date.slice(0, 7) === filterMonth : true;
      const dateMatch = filterDate ? item.counselling_date === filterDate : true;
      return nameMatch && monthMatch && dateMatch;
    });
  }, [data, search, filterMonth, filterDate]);

  const exportDayPDF = (date: string, items: Counselling[]) => {
    const fmtDate = new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const rows = items.map((item, i) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 12px">${i + 1}</td>
        <td style="padding:8px 12px">${item.counselling_time}</td>
        <td style="padding:8px 12px;font-weight:600">${item.full_name}</td>
        <td style="padding:8px 12px">${item.phone ?? "—"}</td>
        <td style="padding:8px 12px">${item.email ?? "—"}</td>
        <td style="padding:8px 12px">${item.pastors?.name ?? "Indifférent"}</td>
        <td style="padding:8px 12px">${item.reason}</td>
        <td style="padding:8px 12px;color:${item.confirmed ? "#16a34a" : "#dc2626"}">${item.confirmed ? "✓ Confirmé" : "En attente"}</td>
      </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Entretiens pastoraux — ${fmtDate}</title>
      <style>body{font-family:sans-serif;padding:32px;color:#111}h1{color:#0e7490;font-size:20px;margin-bottom:4px}p.sub{color:#6b7280;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:13px}thead{background:#f0f9ff}th{padding:10px 12px;text-align:left;color:#0e7490;font-weight:600;border-bottom:2px solid #bae6fd}tr:nth-child(even){background:#f9fafb}footer{margin-top:32px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}</style>
      </head><body>
      <h1>Entretiens pastoraux</h1>
      <p class="sub">${fmtDate} — ${items.length} entretien${items.length > 1 ? "s" : ""}</p>
      <table><thead><tr><th>N°</th><th>Heure</th><th>Nom</th><th>Téléphone</th><th>Email</th><th>Pasteur</th><th>Motif</th><th>Statut</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <footer>Généré le ${new Date().toLocaleDateString("fr-FR")} — Église EEAM Rabat</footer>
      </body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const groupedByDate = filteredData.reduce<Record<string, Counselling[]>>(
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

  const hasActiveFilter = search || filterMonth || filterDate;

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
        {/* Search by name */}
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un nom…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filter by month */}
        <input
          type="month"
          value={filterMonth}
          onChange={e => { setFilterMonth(e.target.value); setFilterDate(""); }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          title="Filtrer par mois"
        />

        {/* Filter by date */}
        <input
          type="date"
          value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setFilterMonth(""); }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          title="Filtrer par date"
        />

        {/* Clear filters */}
        {hasActiveFilter && (
          <button
            onClick={() => { setSearch(""); setFilterMonth(""); setFilterDate(""); }}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={13} /> Effacer
          </button>
        )}
      </div>

      {!Object.keys(groupedByDate).length && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun résultat pour ces filtres.</p>
      )}
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </h3>
            <button
              onClick={() => exportDayPDF(date, items)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
              title="Exporter PDF de la journée"
            >
              <FileDown size={13} /> PDF
            </button>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{item.full_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.phone}</p>
                    {item.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(item)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">Heure:</span> {item.counselling_time}</p>
                  {item.pastors && (
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Pasteur:</span> {item.pastors.name}</p>
                  )}
                </div>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item.reason}</p>
                </div>
                <div className="mt-3">
                  {item.confirmed ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium w-full justify-center">
                      <CheckCircle size={13} /> Confirmé
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConfirm(item)}
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 active:bg-green-800 transition-colors"
                    >
                      <CheckCircle size={14} />
                      Confirmer l'entretien
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
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
                    className="border-t border-gray-100 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {item.counselling_time}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {item.full_name}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {item.phone}
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {item.email || "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      {item.pastors?.name || "Indifférent"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelected(item)}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>

                        {item.confirmed ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                            <CheckCircle size={13} /> Confirmé
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirm(item)}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                          >
                            <CheckCircle size={14} />
                            Confirmer
                          </button>
                        )}
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Détails de l'entretien
            </h3>

            <div className="space-y-3 text-sm">
              <p className="text-gray-800 dark:text-gray-200"><strong>Nom:</strong> {selected.full_name}</p>
              <p className="text-gray-800 dark:text-gray-200"><strong>Téléphone:</strong> {selected.phone}</p>
              {selected.email && (
                <p className="text-gray-800 dark:text-gray-200"><strong>Email:</strong> {selected.email}</p>
              )}
              <p className="text-gray-800 dark:text-gray-200"><strong>Date:</strong> {selected.counselling_date}</p>
              <p className="text-gray-800 dark:text-gray-200"><strong>Heure:</strong> {selected.counselling_time}</p>
              <p className="text-gray-800 dark:text-gray-200"><strong>Pasteur:</strong> {selected.pastors?.name || "Indifférent"}</p>
              <div>
                <p className="font-semibold mb-1 text-gray-800 dark:text-white">Motif:</p>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{selected.reason}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto"
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
