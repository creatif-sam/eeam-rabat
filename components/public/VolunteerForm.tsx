"use client";

import { Save } from "lucide-react";

export default function VolunteerForm() {
  return (
    <form className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input className="input" placeholder="Prénom" />
        <input className="input" placeholder="Nom" />
      </div>

      <input className="input" type="email" placeholder="Email" />
      <input className="input" type="tel" placeholder="Téléphone" />

      <select className="input">
        <option value="">Ministère d'intérêt</option>
        <option value="louange">Louange et Musique</option>
        <option value="accueil">Accueil</option>
        <option value="technique">Technique</option>
        <option value="enfants">Enfants</option>
        <option value="jeunesse">Jeunesse</option>
        <option value="intercession">Intercession</option>
        <option value="media">Médias</option>
        <option value="logistique">Logistique</option>
      </select>

      <textarea
        rows={3}
        className="input"
        placeholder="Compétences et talents"
      />

      <div className="space-y-2">
        <label className="flex gap-2 text-sm">
          <input type="checkbox" />
          Dimanche
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" />
          Semaine
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" />
          Événements spéciaux
        </label>
      </div>

      <button className="primary-btn w-full">
        <Save size={18} />
        Soumettre ma candidature
      </button>
    </form>
  );
}
