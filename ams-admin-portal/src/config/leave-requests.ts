export const LEAVE_REQUEST_PERIOD_OPTIONS = [
  {
    value: "all",
    label: "All request dates",
  },
  {
    value: "current",
    label: "Currently on leave",
  },
  {
    value: "upcoming",
    label: "Upcoming leave",
  },
  {
    value: "past",
    label: "Past leave",
  },
] as const;

export const LEAVE_REQUESTS_COPY = {
  eyebrow: "Leave Management",
  title: "Leave requests",
  description:
    "Review employee leave requests, verify balances and manage approval decisions.",
  createAction: "New leave request",
  queueTitle: "Approval queue",
  queueDescription: "Review leave requests within the selected organization scope.",
  searchPlaceholder: "Search employee, ID, department or reason",
  allTypes: "All leave types",
  allStatuses: "All statuses",
  emptyTitle: "No leave requests found",
  emptyDescription: "Change the selected filters or submit a new leave request.",
} as const;
