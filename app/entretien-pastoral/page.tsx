import { Suspense } from "react";
import PastoralPage from "./PastoralPage";
import BrandedLoader from "@/components/BrandedLoader";

export const metadata = {
  title: "Entretien Pastoral – EEAM Rabat",
  description: "Réservez un entretien avec nos pasteurs. Mercredi, vendredi et samedi de 16h30 à 19h00."
};

export default function EntretienPastoralRoute() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <PastoralPage />
    </Suspense>
  );
}
