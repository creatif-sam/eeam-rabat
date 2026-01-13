"use client";

import React, { useEffect, useState } from "react";
import { Save, Lock, CalendarDays, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ServiceType = {
  id: string;
  name: string;
};

type AttendanceData = {
  date: string;
  service_type_id: string;
  culte: string;
  hommes: string;
  femmes: string;
  enfants: string;
  nouveaux: string;
  notes: string;
};

const ACCESS_PASSWORD = "EEAM2026";

export default function AttendanceForm() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData>({
    date: "",
    service_type_id: "",
    culte: "",
    hommes: "",
    femmes: "",
    enfants: "",
    nouveaux: "",
    notes: ""
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setAttendance(prev => ({ ...prev, date: today }));
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    const { data } = await supabase
      .from("service_types")
      .select("id,name")
      .eq("active", true)
      .order("name");

    setServiceTypes(data || []);
  };

  const handleUnlock = () => {
    if (password === ACCESS_PASSWORD) {
      setAuthorized(true);
      setAuthError("");
    } else {
      setAuthError("Mot de passe incorrect");
    }
  };

  const handleChange = (
    field: keyof AttendanceData,
    value: string
  ) => {
    setAttendance(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError("");

    const { error } = await supabase
      .from("attendance_records")
      .insert({
        attendance_date: attendance.date,
        service_type_id: attendance.service_type_id,
        culte_total: Number(attendance.culte),
        hommes: Number(attendance.hommes),
        femmes: Number(attendance.femmes),
        enfants: Number(attendance.enfants),
        nouveaux: Number(attendance.nouveaux),
        notes: attendance.notes || null
      });

    setSaving(false);

    if (error) {
      setSubmitError(
        "Une erreur est survenue. Veuillez informer le mentor de l’accueil ou un membre de CP pour faire la mise à jour."
      );
      return;
    }

    setSuccess(true);
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

  /* Access gate */
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 py-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Lock className="text-white" size={28} />
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

        {authError && (
          <p className="text-sm text-red-600">
            {authError}
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

  /* Success popup */
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3 max-w-xl">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h3 className="text-lg font-semibold text-green-800">
          Données envoyées
        </h3>
        <p className="text-sm text-green-700">
          Les données d’assiduité ont été envoyées avec succès.
        </p>

        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-5 py-2 rounded-lg bg-green-600 text-white text-sm"
        >
          Nouvelle saisie
        </button>
      </div>
    );
  }

  /* Attendance form */
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <CalendarDays className="text-cyan-600" size={20} />
        <div className="text-sm text-cyan-800">
          <p className="font-semibold">Saisie de l’assiduité</p>
          <p>Enregistrement des présences par type de service</p>
        </div>
      </div>

      {submitError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de service
        </label>
        <select
          required
          value={attendance.service_type_id}
          onChange={e =>
            handleChange("service_type_id", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Sélectionner le type de service</option>
          {serviceTypes.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

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
              required
              value={attendance[key as keyof AttendanceData]}
              onChange={e =>
                handleChange(
                  key as keyof AttendanceData,
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
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
            required
            value={attendance.nouveaux}
            onChange={e =>
              handleChange("nouveaux", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
          placeholder="Remarques ou observations"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition shadow-lg flex items-center justify-center gap-2 font-medium"
      >
        <Save size={18} />
        {saving ? "Enregistrement en cours..." : "Envoyer les données"}
      </button>
    </form>
  );
}
