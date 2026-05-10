"use client";

import { Droplet, Plus, BookOpen, Clock, Archive } from "lucide-react";
import type { ParcoursType, SectionTab } from "./bapteme.types";

type Props = {
  parcoursTab: ParcoursType;
  sectionTab: SectionTab;
  onParcoursChange: (v: ParcoursType) => void;
  onSectionChange: (v: SectionTab) => void;
  onNewClick: () => void;
};

export default function BaptemeHeader({
  parcoursTab,
  sectionTab,
  onParcoursChange,
  onSectionChange,
  onNewClick,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Suivi Baptême
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Gestion des parcours et présences
          </p>
        </div>
        <button
          onClick={onNewClick}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nouveau</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Parcours type toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => onParcoursChange("bapteme")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              parcoursTab === "bapteme"
                ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Droplet size={13} /> Baptême
          </button>
          <button
            onClick={() => onParcoursChange("affermissement")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              parcoursTab === "affermissement"
                ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <BookOpen size={13} /> Affermissement
          </button>
        </div>

        {/* Section state toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => onSectionChange("active")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              sectionTab === "active"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Clock size={13} /> En cours
          </button>
          <button
            onClick={() => onSectionChange("archive")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              sectionTab === "archive"
                ? "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Archive size={13} /> Archive
          </button>
        </div>
      </div>
    </div>
  );
}
