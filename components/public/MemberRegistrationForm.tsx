"use client";

import { Save } from "lucide-react";

export default function MemberRegistrationForm() {
  return (
    <form className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input className="input" placeholder="Prénom" />
        <input className="input" placeholder="Nom" />
      </div>

      <input className="input" type="email" placeholder="Email" />
      <input className="input" type="tel" placeholder="Téléphone" />
      <input className="input" placeholder="Adresse" />
      <input className="input" type="date" />

      <textarea
        rows={3}
        className="input"
        placeholder="Comment avez vous connu l'église"
      />

      <button className="primary-btn w-full">
        <Save size={18} />
        Soumettre l'inscription
      </button>
    </form>
  );
}
