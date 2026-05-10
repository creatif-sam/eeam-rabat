"use client";

import { Droplet, Search, Calendar, ChevronRight } from "lucide-react";
import type { Baptism } from "./bapteme.types";
import { fmtDate, isArchived } from "./bapteme.types";

type ListStats = {
  total: number;
  thisYear: number;
  activeSessions: number;
};

type Props = {
  rows: Baptism[];
  selected: Baptism | null;
  stats: ListStats;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (row: Baptism) => void;
};

export default function SessionList({
  rows,
  selected,
  stats,
  search,
  onSearch,
  onSelect,
}: Props) {
  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white dark:bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col max-h-72 lg:max-h-none">
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Rechercher une session..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-gray-700 dark:text-gray-300 transition-colors"
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
        {[
          { label: "Total", val: stats.total, color: "text-cyan-600 dark:text-cyan-400" },
          { label: "Année", val: stats.thisYear, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Actives", val: stats.activeSessions, color: "text-blue-600 dark:text-blue-400" },
        ].map(s => (
          <div key={s.label} className="py-3 text-center">
            <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Session cards */}
      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
            <Droplet size={32} className="text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-400">Aucune session trouvée</p>
          </div>
        )}
        {rows.map(row => (
          <button
            key={row.id}
            onClick={() => onSelect(row)}
            className={`w-full text-left px-4 py-3.5 border-b border-gray-50 dark:border-gray-800/50 transition-all ${
              selected?.id === row.id
                ? "bg-cyan-50 dark:bg-cyan-900/20 border-l-2 border-l-cyan-500"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selected?.id === row.id
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                <Droplet size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                  {row.full_name}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {row.conseiller || "Sans coordinateur"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar size={9} /> {fmtDate(row.date_debut)}
                  </span>
                  {isArchived(row) && (
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">
                      Archivé
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
