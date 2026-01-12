"use client";

import { Save } from "lucide-react";

export default function PastoralMeetingForm() {
  return (
    <form className="space-y-4">
      <input className="input" placeholder="Nom complet" />
      <input className="input" type="tel" placeholder="Téléphone" />
      <input className="input" type="email" placeholder="Email" />

      <select className="input">
        <option value="">Pasteur souhaité</option>
        <option value="camille">Pasteur Camille</option>
        <option value="jessica">Pasteur Jessica</option>
        <option value="albert">Albert</option>
        <option value="any">Indifférent</option>
      </select>

      <input className="input" type="date" />

      <select className="input">
        <option value="">Heure préférée</option>
        <option value="morning">Matin</option>
        <option value="afternoon">Après midi</option>
        <option value="evening">Soir</option>
      </select>

      <textarea
        rows={4}
        className="input"
        placeholder="Motif de l'entretien"
      />

      <button className="primary-btn w-full">
        <Save size={18} />
        Réserver l'entretien
      </button>
    </form>
  );
}
