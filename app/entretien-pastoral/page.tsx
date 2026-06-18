import { Suspense } from "react";
import PastoralPage from "./PastoralPage";

export const metadata = {
  title: "Entretien Pastoral – EEAM Rabat",
  description: "Réservez un entretien avec nos pasteurs. Mercredi, vendredi et samedi de 16h30 à 19h00."
};

export default function EntretienPastoralRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <PastoralPage />
    </Suspense>
  );
}
