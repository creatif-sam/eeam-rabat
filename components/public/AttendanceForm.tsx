"use client";

import React, { useEffect, useState } from "react";
import { Save, Lock, CalendarDays } from "lucide-react";
import { toast } from "sonner";
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

const inputClass =
  "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:ring-cyan-500 dark:focus:ring-cyan-400";

const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

export default function AttendanceForm() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

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
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const handleChange = (field: keyof AttendanceData, value: string) => {
    setAttendance(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("attendance_records").insert({
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
      toast.error("Une erreur est survenue. Veuillez informer le mentor de l'accueil ou un membre du CP.");
      return;
    }

    toast.success("DonnÃ©es d'assiduitÃ© enregistrÃ©es avec succÃ¨s !");
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Accès sécurisé</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
          Cette section est réservée aux responsables autorisés.
          Veuillez saisir le mot de passe pour continuer.
        </p>
        <div className="w-full max-w-xs space-y-1">
          <label className={labelClass}>Mot de passe</label>
          <input
            type="password"
            placeholder="mot de passe donné par le CP/mentor"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUnlock()}
            className={inputClass}
          />
        </div>
        <button
          onClick={handleUnlock}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl shadow font-medium hover:from-rose-600 hover:to-pink-700 transition"
        >
          Déverrouiller
        </button>
      </div>
    );
  }

  /* Attendance form */
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
        <CalendarDays className="text-cyan-600 dark:text-cyan-400" size={20} />
        <div className="text-sm text-cyan-800 dark:text-cyan-300">
          <p className="font-semibold">Saisie de l&apos;assiduité</p>
          <p>Enregistrement des présences par type de service</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Type de service *</label>
        <select
          required
          value={attendance.service_type_id}
          onChange={e => handleChange("service_type_id", e.target.value)}
          className={inputClass}
        >
          <option value="">Sélectionner le type de service</option>
          {serviceTypes.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Date</label>
        <input
          type="text"
          value={attendance.date}
          readOnly
          className={inputClass + " opacity-70 cursor-not-allowed"}
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
            <label className={labelClass}>{label} *</label>
            <input
              type="number"
              min="0"
              required
              value={attendance[key as keyof AttendanceData]}
              onChange={e => handleChange(key as keyof AttendanceData, e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        ))}

        <div className="md:col-span-2">
          <label className={labelClass}>Nouveaux visiteurs *</label>
          <input
            type="number"
            min="0"
            required
            value={attendance.nouveaux}
            onChange={e => handleChange("nouveaux", e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          rows={3}
          value={attendance.notes}
          onChange={e => handleChange("notes", e.target.value)}
          className={inputClass}
          placeholder="Remarques ou observations (optionnel)"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition shadow-lg flex items-center justify-center gap-2 font-medium disabled:opacity-60"
      >
        <Save size={18} />
        {saving ? "Enregistrement en cours..." : "Envoyer les données"}
      </button>
    </form>
  );
}
