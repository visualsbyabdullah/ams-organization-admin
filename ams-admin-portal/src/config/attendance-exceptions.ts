import type {
  AttendanceExceptionSeverity,
  AttendanceExceptionSource,
  AttendanceExceptionStatus,
  AttendanceExceptionType,
} from "@/types/attendance-exception";

export const ATTENDANCE_EXCEPTION_TYPE_CONFIG: Record<
  AttendanceExceptionType,
  {
    label: string;
    description: string;
    badgeVariant: "neutral" | "info" | "warning" | "danger";
  }
> = {
  late_arrival: {
    label: "Late arrival",
    description: "Employee checked in after the permitted grace period.",
    badgeVariant: "warning",
  },
  early_departure: {
    label: "Early departure",
    description: "Employee checked out before the scheduled shift end.",
    badgeVariant: "warning",
  },
  missing_checkin: {
    label: "Missing check-in",
    description: "No employee check-in was recorded for the scheduled shift.",
    badgeVariant: "danger",
  },
  missing_checkout: {
    label: "Missing checkout",
    description: "Employee checked in but no checkout was recorded.",
    badgeVariant: "danger",
  },
  absence: {
    label: "Unexplained absence",
    description: "No attendance or approved leave record was found.",
    badgeVariant: "danger",
  },
  schedule_conflict: {
    label: "Schedule conflict",
    description: "The assigned shift conflicts with leave or another schedule.",
    badgeVariant: "info",
  },
  overtime: {
    label: "Overtime review",
    description: "Recorded overtime exceeds the configured threshold.",
    badgeVariant: "warning",
  },
  location_mismatch: {
    label: "Location mismatch",
    description: "The attendance location does not match the assigned workplace.",
    badgeVariant: "neutral",
  },
};

export const ATTENDANCE_EXCEPTION_STATUS_CONFIG: Record<
  AttendanceExceptionStatus,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "success" | "danger";
  }
> = {
  open: {
    label: "Open",
    badgeVariant: "danger",
  },
  under_review: {
    label: "Under review",
    badgeVariant: "warning",
  },
  approved: {
    label: "Correction approved",
    badgeVariant: "success",
  },
  rejected: {
    label: "Rejected",
    badgeVariant: "danger",
  },
  resolved: {
    label: "Resolved",
    badgeVariant: "neutral",
  },
};

export const ATTENDANCE_EXCEPTION_SEVERITY_CONFIG: Record<
  AttendanceExceptionSeverity,
  {
    label: string;
    badgeVariant: "neutral" | "warning" | "danger";
  }
> = {
  low: {
    label: "Low",
    badgeVariant: "neutral",
  },
  medium: {
    label: "Medium",
    badgeVariant: "warning",
  },
  high: {
    label: "High",
    badgeVariant: "danger",
  },
};

export const ATTENDANCE_EXCEPTION_SOURCE_CONFIG: Record<
  AttendanceExceptionSource,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning";
  }
> = {
  system: {
    label: "System detected",
    badgeVariant: "info",
  },
  employee: {
    label: "Employee request",
    badgeVariant: "warning",
  },
  manager: {
    label: "Manager reported",
    badgeVariant: "neutral",
  },
  admin: {
    label: "Admin created",
    badgeVariant: "neutral",
  },
};

export const ATTENDANCE_EXCEPTIONS_COPY = {
  eyebrow: "Time & Attendance",
  title: "Attendance exceptions",
  description:
    "Review attendance anomalies, correction requests and unresolved workforce records.",
  createAction: "Create exception",
  searchPlaceholder: "Search employee, ID, department or exception",
  allTypes: "All exception types",
  allStatuses: "All statuses",
  allSeverities: "All severities",
  tableTitle: "Exception queue",
  tableDescription: "Attendance records requiring administrator or manager action.",
} as const;
