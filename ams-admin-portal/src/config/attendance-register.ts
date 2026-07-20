import type { AttendanceRecordSource } from "@/types/attendance-register";

export const ATTENDANCE_SOURCE_CONFIG: Record<
  AttendanceRecordSource,
  {
    label: string;
    badgeVariant: "neutral" | "success" | "warning" | "info";
  }
> = {
  device: {
    label: "Biometric device",
    badgeVariant: "success",
  },
  mobile: {
    label: "Mobile check-in",
    badgeVariant: "info",
  },
  manual: {
    label: "Manual entry",
    badgeVariant: "warning",
  },
  import: {
    label: "Imported",
    badgeVariant: "neutral",
  },
};

export const ATTENDANCE_REGISTER_COPY = {
  eyebrow: "Time & Attendance",
  title: "Attendance register",
  description:
    "Review historical attendance, working hours and daily exceptions across the organization.",
  addRecord: "Add record",
  export: "Export register",
  calendarTitle: "Monthly attendance",
  calendarDescription: "Select a date to inspect its employee attendance records.",
  selectedDayTitle: "Selected day",
  tableTitle: "Attendance records",
  searchPlaceholder: "Search employee, ID, department or designation",
  allDepartments: "All departments",
  allStatuses: "All statuses",
  noRecordsTitle: "No attendance records found",
  noRecordsDescription:
    "There are no employee records matching the selected date and filters.",
} as const;

export const ATTENDANCE_RATE_LEVELS = [
  {
    minimum: 95,
    label: "95% and above",
    className: "bg-success-muted text-success",
  },
  {
    minimum: 90,
    label: "90% to 94%",
    className: "bg-info-muted text-info",
  },
  {
    minimum: 85,
    label: "85% to 89%",
    className: "bg-warning-muted text-warning",
  },
  {
    minimum: 0,
    label: "Below 85%",
    className: "bg-danger-muted text-danger",
  },
] as const;
