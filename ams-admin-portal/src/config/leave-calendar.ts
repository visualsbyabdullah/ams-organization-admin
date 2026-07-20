import type { LeaveType } from "@/types/leave";

export const LEAVE_CALENDAR_COPY = {
  eyebrow: "Leave Management",
  title: "Leave calendar",
  description:
    "Visualize approved and pending employee absences across branches and working days.",
  createAction: "New leave request",
  calendarTitle: "Organization leave calendar",
  calendarDescription:
    "Select a day to review employees who are absent or awaiting leave approval.",
  selectedDayTitle: "Selected day",
  allLeaveTypes: "All leave types",
  activeRequests: "Approved and pending",
  allStatuses: "All statuses",
  approvedOnly: "Approved only",
  pendingOnly: "Pending only",
} as const;

export const LEAVE_CALENDAR_WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export const LEAVE_CALENDAR_TYPE_TONES: Record<
  LeaveType,
  {
    containerClassName: string;
    dotClassName: string;
  }
> = {
  annual: {
    containerClassName: "bg-info-muted text-info",
    dotClassName: "bg-info",
  },
  casual: {
    containerClassName: "bg-warning-muted text-warning",
    dotClassName: "bg-warning",
  },
  sick: {
    containerClassName: "bg-danger-muted text-danger",
    dotClassName: "bg-danger",
  },
  unpaid: {
    containerClassName: "bg-surface-muted text-text-muted",
    dotClassName: "bg-text-muted",
  },
  maternity: {
    containerClassName: "bg-success-muted text-success",
    dotClassName: "bg-success",
  },
  paternity: {
    containerClassName: "bg-success-muted text-success",
    dotClassName: "bg-success",
  },
};
