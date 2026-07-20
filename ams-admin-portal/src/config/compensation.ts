import type {
  CompensationChangeReason,
  CompensationStatus,
  PayFrequency,
} from "@/types/compensation";

export const COMPENSATION_STATUS_CONFIG: Record<
  CompensationStatus,
  {
    label: string;
    badgeVariant:
      | "success"
      | "warning"
      | "neutral";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  pending_review: {
    label: "Pending review",
    badgeVariant: "warning",
  },
  archived: {
    label: "Archived",
    badgeVariant: "neutral",
  },
};

export const PAY_FREQUENCY_CONFIG: Record<
  PayFrequency,
  {
    label: string;
    badgeVariant:
      | "info"
      | "neutral";
  }
> = {
  monthly: {
    label: "Monthly",
    badgeVariant: "info",
  },
  hourly: {
    label: "Hourly",
    badgeVariant: "neutral",
  },
};

export const COMPENSATION_CHANGE_REASON_CONFIG: Record<
  CompensationChangeReason,
  {
    label: string;
  }
> = {
  annual_review: {
    label: "Annual review",
  },
  promotion: {
    label: "Promotion",
  },
  market_adjustment: {
    label: "Market adjustment",
  },
  role_change: {
    label: "Role change",
  },
  correction: {
    label: "Payroll correction",
  },
  new_hire: {
    label: "New hire package",
  },
};

export const COMPENSATION_COPY = {
  eyebrow: "Payroll",
  title: "Employee compensation",
  description:
    "Manage employee salary structures, allowances, pay reviews and compensation history.",
  exportAction: "Export compensation",
  addAction: "Add compensation",
  chartTitle: "Department compensation",
  chartDescription:
    "Average base salary and total fixed compensation by department.",
  attentionTitle: "Upcoming reviews",
  attentionDescription:
    "Compensation records requiring review within the next ninety days.",
  tableTitle: "Compensation directory",
  tableDescription:
    "Current employee salary and allowance structures within the selected organization scope.",
  searchPlaceholder:
    "Search employee, ID, department or designation",
  allStatuses: "All statuses",
  allFrequencies: "All pay frequencies",
  emptyTitle: "No compensation records found",
  emptyDescription:
    "Change the filters or add an employee compensation record.",
} as const;

export const COMPENSATION_REFERENCE_DATE =
  "2026-07-16";
