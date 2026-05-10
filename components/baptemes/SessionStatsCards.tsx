"use client";

import { CheckSquare, XSquare, Users, BarChart3 } from "lucide-react";

type Props = {
  totalPresences: number;
  totalAbsences: number;
  attendeesCount: number;
  sessionDatesCount: number;
};

export default function SessionStatsCards({
  totalPresences,
  totalAbsences,
  attendeesCount,
  sessionDatesCount,
}: Props) {
  const cards = [
    {
      label: "Total Présences",
      val: totalPresences,
      icon: CheckSquare,
      bg: "bg-green-50 dark:bg-green-900/20",
      iconCls: "text-green-500",
      valCls: "text-green-700 dark:text-green-400",
    },
    {
      label: "Total Absences",
      val: totalAbsences < 0 ? 0 : totalAbsences,
      icon: XSquare,
      bg: "bg-red-50 dark:bg-red-900/20",
      iconCls: "text-red-500",
      valCls: "text-red-700 dark:text-red-400",
    },
    {
      label: "Participants",
      val: attendeesCount,
      icon: Users,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconCls: "text-blue-500",
      valCls: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "Séances prévues",
      val: sessionDatesCount,
      icon: BarChart3,
      bg: "bg-purple-50 dark:bg-purple-900/20",
      iconCls: "text-purple-500",
      valCls: "text-purple-700 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(({ label, val, icon: Icon, bg, iconCls, valCls }) => (
        <div
          key={label}
          className={`${bg} rounded-2xl border border-white/60 dark:border-gray-800 p-4 flex items-center gap-3`}
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900/50 flex items-center justify-center shrink-0 shadow-sm">
            <Icon size={20} className={iconCls} />
          </div>
          <div className="min-w-0">
            <p className={`text-2xl font-bold ${valCls}`}>{val}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
