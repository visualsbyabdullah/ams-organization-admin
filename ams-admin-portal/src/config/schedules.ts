import type {
  ScheduleAssignmentStatus,
  ShiftCategory,
  ShiftStatus,
} from "@/types/schedule";

export const SHIFT_CATEGORY_CONFIG: Record<
  ShiftCategory,
  {
    label: string;
    badgeVariant:
      | "neutral"
      | "info"
      | "success"
      | "warning"
      | "danger";
  }
> = {
  standard: {
    label: "Standard",
    badgeVariant: "info",
  },
  morning: {
    label: "Morning",
    badgeVariant: "success",
  },
  evening: {
    label: "Evening",
    badgeVariant: "warning",
  },
  night: {
    label: "Night",
    badgeVariant: "danger",
  },
  flexible: {
    label: "Flexible",
    badgeVariant: "neutral",
  },
};

export const SHIFT_STATUS_CONFIG: Record<
  ShiftStatus,
  {
    label: string;
    badgeVariant:
      | "success"
      | "neutral";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  inactive: {
    label: "Inactive",
    badgeVariant: "neutral",
  },
};

export const SCHEDULE_STATUS_CONFIG: Record<
  ScheduleAssignmentStatus,
  {
    label: string;
    badgeVariant:
      | "info"
      | "success"
      | "danger";
  }
> = {
  scheduled: {
    label: "Scheduled",
    badgeVariant: "info",
  },
  confirmed: {
    label: "Confirmed",
    badgeVariant: "success",
  },
  conflict: {
    label: "Conflict",
    badgeVariant: "danger",
  },
};

export const SCHEDULE_WEEK_DAYS = [
  {
    date: "2026-07-13",
    label: "Monday",
    shortLabel: "Mon 13",
  },
  {
    date: "2026-07-14",
    label: "Tuesday",
    shortLabel: "Tue 14",
  },
  {
    date: "2026-07-15",
    label: "Wednesday",
    shortLabel: "Wed 15",
  },
  {
    date: "2026-07-16",
    label: "Thursday",
    shortLabel: "Thu 16",
  },
  {
    date: "2026-07-17",
    label: "Friday",
    shortLabel: "Fri 17",
  },
  {
    date: "2026-07-18",
    label: "Saturday",
    shortLabel: "Sat 18",
  },
  {
    date: "2026-07-19",
    label: "Sunday",
    shortLabel: "Sun 19",
  },
] as const;

export const SCHEDULE_COPY = {
  eyebrow: "Time & Attendance",
  title: "Work schedules",
  description:
    "Manage employee shifts, weekly rosters and schedule conflicts across organization branches.",
  assignSchedule: "Assign schedule",
  createShift: "Create shift",
  weekLabel: "13 Jul – 19 Jul 2026",
  searchPlaceholder:
    "Search employee, ID, department or designation",
  allStatuses: "All schedule statuses",
  rosterTitle: "Weekly employee roster",
  rosterDescription:
    "Review employee shift assignments for the selected branch and week.",
  shiftsTitle: "Shift templates",
  shiftsDescription:
    "Reusable working schedules available to the organization.",
} as const;
