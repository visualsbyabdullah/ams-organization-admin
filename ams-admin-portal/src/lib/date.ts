const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(`${value}T00:00:00`));
}
