export function formatTrainingDuration(hours: number) {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  if (Number.isInteger(hours)) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours.toFixed(1)} hrs`;
}

export function calculateCompletionRate(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function downloadTrainingCsv(
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
) {
  const escapeValue = (value: string | number) => {
    const stringValue = String(value);

    return `"${stringValue.replaceAll('"', '""')}"`;
  };

  const content = [
    headers.map(escapeValue).join(","),
    ...rows.map((row) => row.map(escapeValue).join(",")),
  ].join("\n");

  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
