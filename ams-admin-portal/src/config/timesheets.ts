import type { TimesheetStatus } from "@/types/timesheet";

export const TIMESHEET_STATUS_CONFIG: Record<
  TimesheetStatus,
  {
    label: string;
    badgeVariant: "neutral" | "warning" | "success" | "danger" | "info";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  submitted: {
    label: "Pending approval",
    badgeVariant: "warning",
  },
  approved: {
    label: "Approved",
    badgeVariant: "success",
  },
  rejected: {
    label: "Rejected",
    badgeVariant: "danger",
  },
  locked: {
    label: "Locked",
    badgeVariant: "info",
  },
};

export const TIMESHEET_DAY_STATUS_CONFIG = {
  worked: {
    label: "Worked",
    badgeVariant: "success",
  },
  leave: {
    label: "Leave",
    badgeVariant: "info",
  },
  weekend: {
    label: "Weekend",
    badgeVariant: "neutral",
  },
  missing: {
    label: "Missing entry",
    badgeVariant: "danger",
  },
} as const;

export const TIMESHEET_PERIOD_OPTIONS = [
  {
    value: "2026-07-13_2026-07-19",
    label: "13 Jul – 19 Jul 2026",
    start: "2026-07-13",
    end: "2026-07-19",
  },
  {
    value: "2026-07-06_2026-07-12",
    label: "06 Jul – 12 Jul 2026",
    start: "2026-07-06",
    end: "2026-07-12",
  },
  {
    value: "2026-06-29_2026-07-05",
    label: "29 Jun – 05 Jul 2026",
    start: "2026-06-29",
    end: "2026-07-05",
  },
] as const;

export const TIMESHEET_COPY = {
  eyebrow: "Time & Attendance",
  title: "Employee timesheets",
  description:
    "Review weekly working hours, overtime, breaks and missing time entries before payroll.",
  export: "Export timesheets",
  searchPlaceholder: "Search employee, ID, department or designation",
  allStatuses: "All statuses",
  chartTitle: "Recorded working hours",
  chartDescription: "Regular and overtime hours across the selected period.",
  statusTitle: "Timesheet status",
  statusDescription: "Approval state of employee timesheets in the current scope.",
  tableTitle: "Weekly timesheets",
  noResults: "No timesheets found",
} as const;
