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
import GroupRequestsDashboard from "@/components/dashboard/GroupRequestsDashboard";
import AttendanceDashboard from "@/components/dashboard/AttendanceDashboard";

type Tab =
  | "attendance"
  | "prayer"
  | "volunteer"
  | "pastoral"
  | "group"
  | "request";

export default function FormulairesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pastoral");

  const tabs = [
    { key: "attendance", label: "Assiduité", icon: CalendarCheck },
    { key: "prayer", label: "Demande de prière", icon: HandHeart },
    { key: "volunteer", label: "Devenir Bénévole", icon: HeartHandshake },
    { key: "pastoral", label: "Entretiens Pastoraux", icon: ClipboardList },
    { key: "group", label: "Rejoindre une Commission", icon: Users },
    { key: "request", label: "Soumettre une Demande", icon: FileText }
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Formulaires</h1>
        <p className="text-gray-600 text-sm">
          Consultation et traitement des demandes
        </p>
      </div>

      <div className="flex flex-wrap gap-3 border-b pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {activeTab === "pastoral" && <PastoralCounsellingList />}
        {activeTab === "group" && <GroupRequestsDashboard />}
        {activeTab === "attendance" && <AttendanceDashboard />}

        {activeTab !== "pastoral" &&
          activeTab !== "group" &&
          activeTab !== "attendance" && (
            <div className="text-center py-20 text-gray-500">
              Cette section sera activée prochainement
            </div>
          )}
      </div>
    </div>
  );
}
