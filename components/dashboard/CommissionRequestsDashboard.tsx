"use client";

import Chip from "@mui/material/Chip";
import RequestInbox from "@/components/dashboard/forms/RequestInbox";

type CommissionRequest = {
  id: string;
  full_name: string;
  email: string;
  request_type: string;
  details: string;
  processed: boolean;
  created_at: string;
};

const TYPES = ["Prière", "Budget", "Conseil spirituel", "Service", "Autre"];

export default function CommissionRequestsDashboard({ onChanged }: { onChanged?: () => void }) {
  return (
    <RequestInbox<CommissionRequest>
      table="commission_requests"
      select="id, full_name, email, request_type, details, processed, created_at"
      primary={r => r.full_name}
      secondary={r => r.request_type}
      columns={[
        { label: "Responsable", render: r => <strong>{r.full_name}</strong> },
        { label: "Type", render: r => <Chip label={r.request_type} size="small" /> },
        { label: "Email", render: r => r.email },
      ]}
      searchText={r => [r.full_name, r.email, r.request_type, r.details].join(" ")}
      extraFilter={{
        label: "Type",
        options: TYPES.map(t => ({ value: t, label: t })),
        match: (r, v) => r.request_type === v,
      }}
      details={r => [
        { label: "Type de demande", value: r.request_type },
        { label: "Email", value: r.email },
      ]}
      longText={r => ({ label: "Détails", value: r.details })}
      contact={r => ({ email: r.email })}
      exportSheet={{
        fileName: "demandes_responsables",
        sheetName: "Demandes",
        row: r => ({
          Nom: r.full_name,
          Email: r.email,
          Type: r.request_type,
          Traité: r.processed ? "Oui" : "Non",
          Date: new Date(r.created_at).toLocaleDateString("fr-FR"),
          Détails: r.details,
        }),
      }}
      onChanged={onChanged}
    />
  );
}
