"use client";

import { Plus, Loader2, Calendar, Users, Trash2 } from "lucide-react";
import type { Attendee, PresenceRecord } from "./bapteme.types";
import { inputCls, monthKey, monthLabel } from "./bapteme.types";

export type AttendeeFormData = {
  full_name: string;
  phone: string;
  email: string;
};

type Props = {
  attendees: Attendee[];
  presenceRecords: PresenceRecord[];
  sessionDates: string[];
  monthGroups: string[];
  loadingAttendees: boolean;
  showAddAttendee: boolean;
  attendeeForm: AttendeeFormData;
  onToggleAddForm: () => void;
  onFormChange: (form: AttendeeFormData) => void;
  onAddAttendee: () => void;
  onRemoveAttendee: (id: string) => void;
  onUpsertPresence: (attendeeId: string, date: string, present: boolean) => void;
};

function getPresence(
  records: PresenceRecord[],
  attendeeId: string,
  sessionDate: string
): boolean {
  return (
    records.find(r => r.attendee_id === attendeeId && r.session_date === sessionDate)
      ?.present ?? false
  );
}

function countTotalPresent(
  records: PresenceRecord[],
  sessionDates: string[],
  attendeeId: string
): number {
  return sessionDates.reduce(
    (acc, d) => (getPresence(records, attendeeId, d) ? acc + 1 : acc),
    0
  );
}

export default function AttendancePanel({
  attendees,
  presenceRecords,
  sessionDates,
  monthGroups,
  loadingAttendees,
  showAddAttendee,
  attendeeForm,
  onToggleAddForm,
  onFormChange,
  onAddAttendee,
  onRemoveAttendee,
  onUpsertPresence,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Feuille de présence
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Présent&nbsp;:&nbsp;
            <strong className="text-blue-600 dark:text-blue-400">P</strong>
            &nbsp;&nbsp;Absent&nbsp;:&nbsp;
            <strong className="text-red-500">A</strong>
            &nbsp;&nbsp;Cliquez une cellule pour basculer
          </p>
        </div>
        <button
          onClick={onToggleAddForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus size={13} /> Ajouter participant
        </button>
      </div>

      {/* Inline add-attendee form */}
      {showAddAttendee && (
        <div className="px-5 py-4 bg-cyan-50 dark:bg-cyan-900/10 border-b border-cyan-100 dark:border-cyan-800/40 space-y-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            Nouveau participant
          </p>
          <input
            value={attendeeForm.full_name}
            onChange={e => onFormChange({ ...attendeeForm, full_name: e.target.value })}
            placeholder="Nom complet *"
            className={inputCls}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={attendeeForm.phone}
              onChange={e => onFormChange({ ...attendeeForm, phone: e.target.value })}
              placeholder="Téléphone"
              className={inputCls}
            />
            <input
              value={attendeeForm.email}
              onChange={e => onFormChange({ ...attendeeForm, email: e.target.value })}
              placeholder="Email"
              className={inputCls}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onToggleAddForm}
              className="px-4 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onAddAttendee}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Content area */}
      {loadingAttendees ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-cyan-500" size={28} />
        </div>
      ) : attendees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
          <Users size={36} className="text-gray-300 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Aucun participant enregistré
          </p>
          <p className="text-xs text-gray-400">
            Ajoutez des participants pour commencer la saisie des présences
          </p>
        </div>
      ) : sessionDates.length === 0 ? (
        <div className="flex items-start gap-3 p-5 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-800/30">
          <Calendar size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Définissez une date de début et une date de fin pour afficher la matrice de
            présences.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse"
            style={{
              minWidth: Math.max(600, 180 + sessionDates.length * 44 + 56 + 56 + 44),
            }}
          >
            <thead>
              <tr className="bg-gray-800 dark:bg-gray-950 text-white">
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-xs font-semibold sticky left-0 bg-gray-800 dark:bg-gray-950 z-10 w-40 border-r border-gray-700"
                >
                  Participant
                </th>
                {monthGroups.map(m => {
                  const datesInMonth = sessionDates.filter(d => monthKey(d) === m);
                  return (
                    <th
                      key={m}
                      colSpan={datesInMonth.length}
                      className="text-center text-xs font-bold py-2 px-1 border-l border-gray-700 capitalize whitespace-nowrap"
                    >
                      {monthLabel(m)}
                    </th>
                  );
                })}
                <th
                  className="text-center text-xs font-semibold py-2 px-2 border-l border-gray-600 bg-blue-900 whitespace-nowrap"
                  rowSpan={2}
                >
                  Total P
                </th>
                <th
                  className="text-center text-xs font-semibold py-2 px-2 border-l border-gray-600 bg-red-900 whitespace-nowrap"
                  rowSpan={2}
                >
                  Total A
                </th>
                <th
                  className="text-center text-xs font-semibold py-2 px-2 border-l border-gray-600"
                  rowSpan={2}
                >
                  &nbsp;
                </th>
              </tr>
              <tr className="bg-gray-700 dark:bg-gray-900 text-gray-200">
                {sessionDates.map((date, idx) => {
                  const d = new Date(date);
                  const isFirstOfMonth =
                    idx === 0 || monthKey(date) !== monthKey(sessionDates[idx - 1]);
                  return (
                    <th
                      key={date}
                      className={`text-center text-[10px] font-semibold py-2 px-1 whitespace-nowrap ${
                        isFirstOfMonth ? "border-l border-gray-600" : ""
                      }`}
                    >
                      {d.getDate()}
                      <br />
                      <span className="text-gray-400 font-normal">
                        {d
                          .toLocaleDateString("fr-FR", { weekday: "short" })
                          .slice(0, 2)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {attendees.map((a, rowIdx) => {
                const totalP = countTotalPresent(presenceRecords, sessionDates, a.id);
                const totalA = sessionDates.length - totalP;
                return (
                  <tr
                    key={a.id}
                    className={`border-b border-gray-100 dark:border-gray-800 ${
                      rowIdx % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50/60 dark:bg-gray-800/40"
                    }`}
                  >
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 sticky left-0 bg-inherit border-r border-gray-100 dark:border-gray-800 z-10 max-w-[160px] truncate">
                      {a.full_name}
                    </td>
                    {sessionDates.map((date, idx) => {
                      const present = getPresence(presenceRecords, a.id, date);
                      const isFirstOfMonth =
                        idx === 0 || monthKey(date) !== monthKey(sessionDates[idx - 1]);
                      return (
                        <td
                          key={`${a.id}-${date}`}
                          className={`text-center py-2 ${
                            isFirstOfMonth
                              ? "border-l border-gray-100 dark:border-gray-800"
                              : ""
                          }`}
                        >
                          <button
                            onClick={() => onUpsertPresence(a.id, date, !present)}
                            title={present ? "Marquer absent" : "Marquer présent"}
                            className={`w-7 h-7 rounded-md text-xs font-bold transition-all hover:scale-110 ${
                              present
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
                            }`}
                          >
                            {present ? "P" : "A"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center py-2 px-2 text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/10 border-l border-gray-100 dark:border-gray-800">
                      {totalP}
                    </td>
                    <td className="text-center py-2 px-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-900/10 border-l border-gray-100 dark:border-gray-800">
                      {totalA}
                    </td>
                    <td className="text-center py-2 px-2 border-l border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => onRemoveAttendee(a.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mx-auto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
