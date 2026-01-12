"use client";

import React, { useEffect, useState } from "react";
import { Save, Lock } from "lucide-react";

type AttendanceData = {
  date: string;
  culte: string;
  hommes: string;
  femmes: string;
  enfants: string;
  nouveaux: string;
  notes: string;
};

const ACCESS_PASSWORD = "EEAM2026";

export default function AttendanceForm() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  const handleUnlock = () => {
    if (password === ACCESS_PASSWORD) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  /* Password gate */
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Lock className="text-white" size={26} />
        </div>

        <h2 className="text-xl font-bold text-gray-800">
          Accès sécurisé
        </h2>

        <p className="text-sm text-gray-600 text-center max-w-sm">
          Cette section est réservée aux responsables autorisés.
          Veuillez saisir le mot de passe pour continuer.
        </p>

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleUnlock}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl shadow font-medium"
        >
          Déverrouiller
        </button>
      </div>
    );
  }

  /* Actual form */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="text"
          value={attendance.date}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          ["culte", "Culte Général"],
          ["hommes", "Hommes"],
          ["femmes", "Femmes"],
          ["enfants", "Enfants"]
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
            <input
              type="number"
              min="0"
              value={attendance[key as keyof AttendanceData]}
              onChange={e =>
                handleChange(
                  key as keyof AttendanceData,
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>
        ))}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouveaux visiteurs
          </label>
          <input
            type="number"
            min="0"
            value={attendance.nouveaux}
            onChange={e =>
              handleChange("nouveaux", e.target.value)
            }
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
          onChange={e =>
            handleChange("notes", e.target.value)
          }
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
