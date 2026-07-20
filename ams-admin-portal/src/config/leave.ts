import type {
  LeaveRequestStatus,
  LeaveType,
} from "@/types/leave";

export const LEAVE_REFERENCE_DATE =
  "2026-07-16";

export const LEAVE_TABS = [
  {
    label: "Overview",
    href: "/leave",
  },
  {
    label: "Requests",
    href: "/leave/requests",
  },
  {
    label: "Leave calendar",
    href: "/leave/calendar",
  },
  {
    label: "Policies",
    href: "/leave/policies",
  },
] as const;

export const LEAVE_TYPE_CONFIG: Record<
  LeaveType,
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
  annual: {
    label: "Annual leave",
    badgeVariant: "info",
  },
  casual: {
    label: "Casual leave",
    badgeVariant: "warning",
  },
  sick: {
    label: "Sick leave",
    badgeVariant: "danger",
  },
  unpaid: {
    label: "Unpaid leave",
    badgeVariant: "neutral",
  },
  maternity: {
    label: "Maternity leave",
    badgeVariant: "success",
  },
  paternity: {
    label: "Paternity leave",
    badgeVariant: "success",
  },
};

export const LEAVE_STATUS_CONFIG: Record<
  LeaveRequestStatus,
  {
    label: string;
    badgeVariant:
      | "warning"
      | "success"
      | "danger"
      | "neutral";
  }
> = {
  pending: {
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
  cancelled: {
    label: "Cancelled",
    badgeVariant: "neutral",
  },
};

export const LEAVE_COPY = {
  eyebrow: "Leave Management",
  title: "Leave overview",
  description:
    "Monitor employee leave balances, upcoming absences and approval requests across the organization.",
  createRequest: "New leave request",
  searchPlaceholder:
    "Search employee, ID, department or reason",
  allTypes: "All leave types",
  allStatuses: "All statuses",
  trendTitle: "Leave request trend",
  trendDescription:
    "Approved, pending and rejected leave requests during the current year.",
  upcomingTitle: "Upcoming absences",
  upcomingDescription:
    "Approved leave starting within the next seven days.",
  tableTitle: "Recent leave requests",
  tableDescription:
    "Review and manage leave requests within the selected organization scope.",
} as const;
