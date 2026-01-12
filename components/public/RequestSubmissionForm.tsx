"use client";

import { Save } from "lucide-react";

export default function RequestSubmissionForm() {
  return (
    <form className="space-y-4">
      <input className="input" placeholder="Nom complet" />
      <input className="input" type="email" placeholder="Email" />

      <select className="input">
        <option value="">Type de demande</option>
        <option value="prayer">Prière</option>
        <option value="baptism">Baptême</option>
        <option value="counseling">Conseil spirituel</option>
        <option value="service">Service</option>
        <option value="other">Autre</option>
      </select>

      <textarea
        rows={5}
        className="input"
        placeholder="Détails de la demande"
      />

      <button className="primary-btn w-full">
        <Save size={18} />
        Envoyer la demande
      </button>
    </form>
  );
}
