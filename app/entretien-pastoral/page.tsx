import { Suspense } from "react";
import PastoralPage from "./PastoralPage";

export const metadata = {
  title: "Entretien Pastoral – EEAM Rabat",
  description: "Réservez un entretien avec nos pasteurs. Mercredi et vendredi à partir de 16h. Samedi de 10h à 16h."
};

export default function EntretienPastoralRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <PastoralPage />
    </Suspense>
  );
}
