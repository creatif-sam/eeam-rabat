"use client";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import RequestInbox from "@/components/dashboard/forms/RequestInbox";

type VolunteerRequest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  ministry: string;
  skills: string | null;
  availability: string[];
  processed: boolean;
  created_at: string;
};

const fullName = (v: VolunteerRequest) => `${v.first_name ?? ""} ${v.last_name ?? ""}`.trim();
const mapRow = (r: Record<string, unknown>) =>
  ({ ...r, availability: Array.isArray(r.availability) ? r.availability : [] }) as VolunteerRequest;

const availabilityChips = (v: VolunteerRequest) =>
  v.availability.length ? (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap", mt: 0.5 }}>
      {v.availability.map(a => <Chip key={a} label={a} size="small" variant="outlined" />)}
    </Stack>
  ) : null;

export default function VolunteerRequestsDashboard({ onChanged }: { onChanged?: () => void }) {
  return (
    <RequestInbox<VolunteerRequest>
      table="volunteer_requests"
      select="id, first_name, last_name, email, phone, ministry, skills, availability, processed, created_at"
      mapRow={mapRow}
      primary={fullName}
      secondary={v => `${v.ministry} · ${v.phone}`}
      columns={[
        { label: "Nom", render: v => <strong>{fullName(v)}</strong> },
        { label: "Téléphone", render: v => v.phone },
        { label: "Ministère", render: v => <Chip label={v.ministry} size="small" /> },
      ]}
      searchText={v => [fullName(v), v.phone, v.email, v.ministry, v.skills, ...v.availability].join(" ")}
      extraFilter={{
        label: "Ministère",
        options: [],
        fromRows: rows => rows.map(r => r.ministry),
        match: (r, val) => r.ministry === val,
      }}
      details={v => [
        { label: "Téléphone", value: v.phone },
        { label: "Email", value: v.email },
        { label: "Ministère souhaité", value: v.ministry },
        { label: "Disponibilités", value: availabilityChips(v) },
      ]}
      longText={v => ({ label: "Compétences", value: v.skills })}
      contact={v => ({ phone: v.phone, email: v.email })}
      exportSheet={{
        fileName: "benevolat",
        sheetName: "Bénévolat",
        row: v => ({
          Prénom: v.first_name,
          Nom: v.last_name,
          Téléphone: v.phone,
          Email: v.email || "",
          Ministère: v.ministry,
          Disponibilités: v.availability.join(", "),
          Compétences: v.skills || "",
          Traité: v.processed ? "Oui" : "Non",
          Date: new Date(v.created_at).toLocaleDateString("fr-FR"),
        }),
      }}
      onChanged={onChanged}
    />
  );
}
