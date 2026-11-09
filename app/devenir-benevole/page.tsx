import type { Metadata } from "next";
import VolunteerPage from "./VolunteerPage";

export const metadata: Metadata = {
  title: "Devenir bénévole – EEAM Rabat",
  description:
    "Servez dans un ministère de l'Église Évangélique Au Maroc – paroisse de Rabat : louange, accueil, technique, enfants, jeunesse, médias et plus.",
};

export default function DevenirBenevoleRoute() {
  return <VolunteerPage />;
}
