"use client";

import { useState } from "react";
import { Lock, User, Users, HandHeart, FilePen, UserCheck, ClipboardList } from "lucide-react";
import PrayerRequestForm from "@/components/public/PrayerRequests";

type ServicesGridProps = {
  onMember: () => void;
  onVolunteer: () => void;
  onJoinGroup: () => void;
  onRequest: () => void;
  onPastoral: () => void;
  onAttendance: () => void;
};

const cardClass = "bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all cursor-pointer group";

export default function ServicesGrid({
  onMember,
  onVolunteer,
  onJoinGroup,
  onRequest,
  onPastoral,
  onAttendance
}: ServicesGridProps) {
  const [showPrayerForm, setShowPrayerForm] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
        {/* Inscription Membre */}
        <div onClick={onMember} className={cardClass}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <User className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Inscription Membre
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Rejoignez notre communauté et devenez membre officiel de l'église
          </p>
        </div>

        {/* Devenir Bénévole */}
        <div onClick={onVolunteer} className={cardClass}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <HandHeart className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Devenir Bénévole
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Servez dans un ministère et participez activement à la vie de l'église
          </p>
        </div>

        {/* Rejoindre une Commission */}
        <div onClick={onJoinGroup} className={cardClass}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <Users className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Rejoindre une Commission
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Intégrez une commission ou cellule pour grandir ensemble
          </p>
        </div>

        {/* Demande de prière */}
        <div onClick={() => setShowPrayerForm(true)} className={cardClass}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <HandHeart className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Demande de prière
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Confiez vos sujets de prière à notre équipe d'intercession
          </p>
        </div>

        {/* Soumettre une Demande */}
        <div onClick={onRequest} className={`relative ${cardClass}`}>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs px-2 sm:px-3 py-1 rounded-full">
            <Lock size={12} />
            Réservé
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <FilePen className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Soumettre une Demande
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Réservé aux responsables de commissions et mouvements
          </p>
        </div>

        {/* Entretien Pastoral */}
        <div onClick={onPastoral} className={cardClass}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <UserCheck className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Entretien Pastoral
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Réservez un rendez vous avec nos pasteurs
          </p>
        </div>

        {/* Assiduité */}
        <div onClick={onAttendance} className={`relative ${cardClass}`}>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 sm:px-3 py-1 rounded-full">
            <Lock size={12} />
            Réservé
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <ClipboardList className="text-xl sm:text-2xl text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Saisir l'Assiduité
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Réservé aux responsables de commissions
          </p>
        </div>
      </div>

      {/* Prayer Request Modal */}
      {showPrayerForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-xl relative border border-gray-100 dark:border-gray-800 shadow-2xl">
            <button
              onClick={() => setShowPrayerForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold transition-colors"
            >
              ✕
            </button>
            <PrayerRequestForm />
          </div>
        </div>
      )}
    </>
  );
}