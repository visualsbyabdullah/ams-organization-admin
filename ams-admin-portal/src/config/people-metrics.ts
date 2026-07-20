export type PeopleMetricTone =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral";

export const PEOPLE_METRIC_TONE_STYLES: Record<
  PeopleMetricTone,
  string
> = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  info: "bg-info-muted text-info",
  danger: "bg-danger-muted text-danger",
  neutral: "bg-surface-muted text-text-muted",
};

function includesAny(
  value: string,
  keywords: readonly string[],
) {
  return keywords.some((keyword) =>
    value.includes(keyword),
  );
}

export function getPeopleMetricTone(
  label: string,
): PeopleMetricTone {
  const value = label
    .trim()
    .toLowerCase();

  if (
    includesAny(value, [
      "inactive",
      "overdue",
      "rejected",
      "expired",
      "blocked",
      "restricted",
      "terminated",
      "failed",
    ])
  ) {
    return "danger";
  }

  if (
    includesAny(value, [
      "pending",
      "probation",
      "draft",
      "awaiting",
      "unassigned",
      "expiring",
    ])
  ) {
    return "warning";
  }

  if (
    includesAny(value, [
      "active",
      "completed",
      "assigned",
      "approved",
      "enabled",
      "onboarded",
    ])
  ) {
    return "success";
  }

  return "info";
}

export function getPeopleMetricToneStyle(
  label: string,
) {
  return PEOPLE_METRIC_TONE_STYLES[
    getPeopleMetricTone(label)
  ];
}

export function getEmployeeChangeTypeToneStyle(
  label: string,
) {
  const value = label
    .trim()
    .toLowerCase();

  if (
    includesAny(value, [
      "termination",
      "inactive",
      "employment status",
      "suspension",
    ])
  ) {
    return PEOPLE_METRIC_TONE_STYLES.danger;
  }

  if (
    includesAny(value, [
      "salary",
      "compensation",
      "allowance",
    ])
  ) {
    return PEOPLE_METRIC_TONE_STYLES.warning;
  }

  if (
    includesAny(value, [
      "promotion",
      "confirmation",
    ])
  ) {
    return PEOPLE_METRIC_TONE_STYLES.success;
  }

  return PEOPLE_METRIC_TONE_STYLES.info;
}