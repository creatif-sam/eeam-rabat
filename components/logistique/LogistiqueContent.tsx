"use client";

import { useState } from "react";
import { Package, ShoppingCart } from "lucide-react";
import LogisticsTab from "./LogisticsTab";
import AchatsTab from "./AchatsTab";

type Tab = "logistique" | "achats";

export default function LogistiqueContent() {
  const [activeTab, setActiveTab] = useState<Tab>("logistique");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Logistique &amp; Achats
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gérez les équipements et les achats de l&apos;église
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab("logistique")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "logistique"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Package size={16} />
          Logistique ✍️
        </button>
        <button
          onClick={() => setActiveTab("achats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "achats"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <ShoppingCart size={16} />
          Achats 🛒
        </button>
      </div>

      {activeTab === "logistique" ? <LogisticsTab /> : <AchatsTab />}
    </div>
  );
}
