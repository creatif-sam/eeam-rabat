"use client";

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";

type AttendanceData = {
  date: string;
  culte: string;
  hommes: string;
  femmes: string;
  enfants: string;
  nouveaux: string;
  notes: string;
};

export default function AttendanceForm() {
  const [attendance, setAttendance] = useState<AttendanceData>({
    date: "",
    culte: "",
    hommes: "",
    femmes: "",
    enfants: "",
    nouveaux: "",
    notes: ""
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setAttendance(prev => ({ ...prev, date: today }));
  }, []);

  const handleChange = (field: keyof AttendanceData, value: string) => {
    setAttendance(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attendance submitted", attendance);

    setAttendance(prev => ({
      ...prev,
      culte: "",
      hommes: "",
      femmes: "",
      enfants: "",
      nouveaux: "",
      notes: ""
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="text"
          value={attendance.date}
          onChange={e => handleChange("date", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Culte Général
          </label>
          <input
            type="number"
            min="0"
            value={attendance.culte}
            onChange={e => handleChange("culte", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
            placeholder="Total"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hommes
          </label>
          <input
            type="number"
            min="0"
            value={attendance.hommes}
            onChange={e => handleChange("hommes", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Femmes
          </label>
          <input
            type="number"
            min="0"
            value={attendance.femmes}
            onChange={e => handleChange("femmes", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enfants
          </label>
          <input
            type="number"
            min="0"
            value={attendance.enfants}
            onChange={e => handleChange("enfants", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouveaux visiteurs
          </label>
          <input
            type="number"
            min="0"
            value={attendance.nouveaux}
            onChange={e => handleChange("nouveaux", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          rows={3}
          value={attendance.notes}
          onChange={e => handleChange("notes", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
          placeholder="Remarques ou observations"
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg flex items-center justify-center gap-2 font-medium"
      >
        <Save size={18} />
        Enregistrer l'assiduité
      </button>
    </form>
  );
}
