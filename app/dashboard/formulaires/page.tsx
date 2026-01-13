"use client";

import { useState } from "react";
import {
  ClipboardList,
  HeartHandshake,
  Users,
  HandHeart,
  FileText,
  CalendarCheck
} from "lucide-react";

import PastoralCounsellingList from "@/components/dashboard/PastoralCounsellingList";

type Tab =
  | "volunteer"
  | "group"
  | "prayer"
  | "request"
  | "pastoral"
  | "attendance";

export default function FormulairesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pastoral");

  const tabs = [
    { key: "volunteer", label: "Devenir Bénévole", icon: HeartHandshake },
    { key: "group", label: "Rejoindre une Commission", icon: Users },
    { key: "prayer", label: "Demande de prière", icon: HandHeart },
    { key: "request", label: "Soumettre une Demande", icon: FileText },
    { key: "pastoral", label: "Entretiens Pastoraux", icon: ClipboardList },
    { key: "attendance", label: "Assiduité", icon: CalendarCheck }
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Formulaires</h1>
        <p className="text-gray-600 text-sm">
          Consultation des demandes et rendez vous
        </p>
      </div>

      <div className="flex flex-wrap gap-3 border-b pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isDisabled = tab.key !== "pastoral";

          return (
            <button
              key={tab.key}
              onClick={() => !isDisabled && setActiveTab(tab.key)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-600 text-white"
                  : isDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {isDisabled && (
                <span className="ml-1 text-xs">(Bientôt)</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {activeTab === "pastoral" && <PastoralCounsellingList />}

        {activeTab !== "pastoral" && (
          <div className="text-center py-20 text-gray-500">
            Cette section sera activée prochainement
          </div>
        )}
      </div>
    </div>
  );
}
