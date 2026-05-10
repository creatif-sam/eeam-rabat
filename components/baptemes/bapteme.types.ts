export type ParcoursType = "bapteme" | "affermissement";
export type SectionTab = "active" | "archive";

export type Baptism = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  address: string | null;
  statut: string;
  parcours_type: ParcoursType;
  date_demande: string;
  date_debut: string | null;
  date_fin: string | null;
  archived_at: string | null;
  date_bapteme: string | null;
  ceremony_location: string | null;
  conseiller: string | null;
  temoignage: string | null;
  creator_id: string;
  creator_email: string;
};

export type Attendee = {
  id: string;
  baptism_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  created_at: string;
};

export type PresenceRecord = {
  id: string;
  baptism_id: string;
  attendee_id: string;
  session_date: string;
  present: boolean;
};

export const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors";

export function fmtDate(date?: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR");
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  return value.split("T")[0];
}

export function monthKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

export function buildSessionDates(start?: string | null, end?: string | null): string[] {
  if (!start || !end) return [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  )
    return [];
  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 7);
  }
  return dates;
}

export function isArchived(row: Baptism): boolean {
  if (row.archived_at) return true;
  if (!row.date_fin) return false;
  const threshold = new Date(row.date_fin);
  threshold.setDate(threshold.getDate() + 7);
  return new Date() > threshold;
}
