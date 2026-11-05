import type { Metadata } from "next";
import JoinCommissionPage from "./JoinCommissionPage";

export const metadata: Metadata = {
  title: "Rejoindre une commission – EEAM Rabat",
  description:
    "Engagez-vous dans une commission ou une cellule de l'Église Évangélique Au Maroc – paroisse de Rabat.",
};

export default function CommissionsRoute() {
  return <JoinCommissionPage />;
}
