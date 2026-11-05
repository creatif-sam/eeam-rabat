"use client";

import Chip from "@mui/material/Chip";
import RequestInbox from "@/components/dashboard/forms/RequestInbox";

type GroupRequest = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  motivation: string;
  created_at: string;
  processed: boolean;
  group_name: string;
};

// Supabase returns the related commission as an object (many-to-one);
// handle an array too in case the relationship is declared the other way.
const mapRow = (r: Record<string, unknown>): GroupRequest => {
  const rel = r.groupes_commissions as { name?: string } | { name?: string }[] | null;
  const group_name = (Array.isArray(rel) ? rel[0]?.name : rel?.name) ?? "Commission inconnue";
  return { ...(r as unknown as GroupRequest), group_name };
};

export default function GroupRequestsDashboard({ onChanged }: { onChanged?: () => void }) {
  return (
    <RequestInbox<GroupRequest>
      table="group_join_requests"
      select="id, full_name, phone, email, motivation, created_at, processed, groupes_commissions(name)"
      mapRow={mapRow}
      primary={r => r.full_name}
      secondary={r => `${r.group_name} · ${r.phone}`}
      columns={[
        { label: "Nom", render: r => <strong>{r.full_name}</strong> },
        { label: "Téléphone", render: r => r.phone },
        { label: "Commission", render: r => <Chip label={r.group_name} size="small" color="primary" variant="outlined" /> },
      ]}
      searchText={r => [r.full_name, r.phone, r.email, r.group_name, r.motivation].join(" ")}
      extraFilter={{
        label: "Commission",
        options: [],
        fromRows: rows => rows.map(r => r.group_name),
        match: (r, v) => r.group_name === v,
      }}
      details={r => [
        { label: "Commission", value: r.group_name },
        { label: "Téléphone", value: r.phone },
        { label: "Email", value: r.email },
      ]}
      longText={r => ({ label: "Motivation", value: r.motivation })}
      contact={r => ({ phone: r.phone, email: r.email })}
      exportSheet={{
        fileName: "demandes_commissions",
        sheetName: "Rejoindre commission",
        row: r => ({
          Nom: r.full_name,
          Téléphone: r.phone,
          Email: r.email || "",
          Commission: r.group_name,
          Motivation: r.motivation,
          Traité: r.processed ? "Oui" : "Non",
          Date: new Date(r.created_at).toLocaleDateString("fr-FR"),
        }),
      }}
      onChanged={onChanged}
    />
  );
}
