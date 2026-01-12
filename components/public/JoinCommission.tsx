"use client";

import { Save } from "lucide-react";

export default function JoinGroupForm() {
  return (
    <form className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input className="input" placeholder="Prénom" />
        <input className="input" placeholder="Nom" />
      </div>

      <input className="input" type="email" placeholder="Email" />
      <input className="input" type="tel" placeholder="Téléphone" />

      <select className="input">
        <option value="">Type de groupe</option>
        <option value="jeunes">Jeunes adultes</option>
        <option value="hommes">Hommes</option>
        <option value="femmes">Femmes</option>
        <option value="couples">Couples</option>
        <option value="seniors">Seniors</option>
        <option value="cellule">Cellule de maison</option>
      </select>

      <select className="input">
        <option value="">Commission optionnelle</option>
        <option value="evangelisation">Évangélisation</option>
        <option value="formation">Formation</option>
        <option value="social">Action sociale</option>
        <option value="missions">Missions</option>
        <option value="communication">Communication</option>
      </select>

      <textarea
        rows={3}
        className="input"
        placeholder="Message optionnel"
      />

      <button className="primary-btn w-full">
        <Save size={18} />
        Rejoindre le groupe
      </button>
    </form>
  );
}
