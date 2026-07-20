import type {
  AttendanceStatus,
} from "@/types/attendance";

export const ATTENDANCE_TABS = [
  {
    label: "Today",
    href: "/attendance",
  },
  {
    label: "Attendance register",
    href: "/attendance/register",
  },
  {
    label: "Timesheets",
    href: "/attendance/timesheets",
  },
  {
    label: "Schedules",
    href: "/attendance/schedules",
  },
  {
    label: "Exceptions",
    href: "/attendance/exceptions",
  },
  {
    label: "Policies",
    href: "/attendance/policies",
  },
] as const;

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    badgeVariant:
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "neutral";
  }
> = {
  present: {
    label: "Present",
    badgeVariant: "success",
  },
  late: {
    label: "Late",
    badgeVariant: "warning",
  },
  absent: {
    label: "Absent",
    badgeVariant: "danger",
  },
  on_leave: {
    label: "On leave",
    badgeVariant: "info",
  },
  remote: {
    label: "Remote",
    badgeVariant: "neutral",
  },
  missing_checkout: {
    label: "Missing checkout",
    badgeVariant: "warning",
  },
};

export const ATTENDANCE_COPY = {
  eyebrow: "Time & Attendance",
  title: "Today’s attendance",
  description:
    "Monitor workforce availability, attendance exceptions and employee working hours.",
  addRecord: "Add attendance record",
  export: "Export",
  searchPlaceholder:
    "Search employee, ID, department or designation",
  allStatuses: "All statuses",
  viewingDate: "Viewing attendance for",
  attendanceTrend: {
    title: "Weekly attendance trend",
    description:
      "Present, late and absent employees during the current week.",
  },
  departmentChart: {
    title: "Department attendance",
    description:
      "Today’s attendance distribution by department.",
  },
  exceptions: {
    title: "Exceptions requiring attention",
    description:
      "Attendance records that may require an administrator review.",
  },
  table: {
    employee: "Employee",
    schedule: "Scheduled shift",
    checkIn: "Check in",
    checkOut: "Check out",
    worked: "Worked",
    status: "Status",
    actions: "Actions",
  },
} as const;
