export function exportCSV(
  rows: Record<string, any>[],
  period: string
) {
  if (!rows.length) return;

  const header = Object.keys(rows[0]).join(",");
  const body = rows.map(r =>
    Object.values(r)
      .map(v => `"${v ?? ""}"`)
      .join(",")
  );

  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${period}.csv`;
  link.click();
}
