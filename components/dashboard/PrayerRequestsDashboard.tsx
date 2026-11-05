"use client";

import Chip from "@mui/material/Chip";
import { LockOutlined } from "@mui/icons-material";
import RequestInbox from "@/components/dashboard/forms/RequestInbox";

type PrayerRequest = {
  id: string;
  full_name: string;
  email: string | null;
  subject: string;
  message: string;
  confidential: boolean;
  processed: boolean;
  created_at: string;
};

// The public form stores the name in `name`; older rows may use `full_name`
const mapRow = (r: Record<string, unknown>) =>
  ({ ...r, full_name: (r.full_name ?? r.name ?? "") as string, confidential: !!r.confidential }) as unknown as PrayerRequest;

const confidentialChip = (r: PrayerRequest) =>
  r.confidential ? <Chip icon={<LockOutlined />} label="Confidentiel" size="small" color="secondary" variant="outlined" /> : null;

export default function PrayerRequestsDashboard({ onChanged }: { onChanged?: () => void }) {
  return (
    <RequestInbox<PrayerRequest>
      table="prayer_requests"
      select="*"
      mapRow={mapRow}
      primary={r => r.full_name || "Anonyme"}
      secondary={r => r.subject}
      badges={confidentialChip}
      columns={[
        { label: "Nom", render: r => <strong>{r.full_name || "Anonyme"}</strong> },
        { label: "Sujet", render: r => r.subject },
        { label: "Confidentialité", render: confidentialChip, width: 150 },
      ]}
      searchText={r => [r.full_name, r.email, r.subject, r.message].join(" ")}
      extraFilter={{
        label: "Confidentialité",
        options: [
          { value: "confidential", label: "Confidentielles" },
          { value: "public", label: "Non confidentielles" },
        ],
        match: (r, v) => (v === "confidential" ? r.confidential : !r.confidential),
      }}
      details={r => [
        { label: "Sujet", value: r.subject },
        { label: "Email", value: r.email },
      ]}
      longText={r => ({ label: "Message", value: r.message })}
      contact={r => ({ email: r.email })}
      onChanged={onChanged}
    />
  );
}
