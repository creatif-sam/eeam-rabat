"use client";

import {
  Droplet,
  User,
  MapPin,
  Hash,
  Archive,
  Edit,
  X,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import type { Baptism, Attendee } from "./bapteme.types";
import { fmtDate, isArchived } from "./bapteme.types";

type Props = {
  selected: Baptism;
  sessionDates: string[];
  attendees: Attendee[];
  onEdit: () => void;
  onClose: () => void;
};

export default function SessionDetailHeader({
  selected,
  sessionDates,
  attendees,
  onEdit,
  onClose,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Profile row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
          <Droplet size={30} className="text-cyan-600 dark:text-cyan-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {selected.full_name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {selected.parcours_type === "bapteme"
              ? "Parcours Baptême"
              : "Parcours Affermissement"}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {selected.conseiller && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <User size={11} /> {selected.conseiller}
              </span>
            )}
            {(selected.ceremony_location || selected.address) && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={11} /> {selected.ceremony_location || selected.address}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Hash size={11} /> {selected.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isArchived(selected) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Archive size={11} /> Archivé
            </span>
          )}
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Edit size={13} /> Modifier
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Info chips row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
        {[
          { label: "Date de début", val: fmtDate(selected.date_debut), icon: Calendar },
          { label: "Date de fin", val: fmtDate(selected.date_fin), icon: Calendar },
          { label: "Nb. séances", val: sessionDates.length, icon: BarChart3 },
          { label: "Participants", val: attendees.length, icon: Users },
        ].map(({ label, val, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center py-3 px-2 text-center">
            <Icon size={13} className="text-gray-400 mb-1" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
