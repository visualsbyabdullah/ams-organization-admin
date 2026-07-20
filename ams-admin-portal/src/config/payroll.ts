import type {
  PayrollEmployeeStatus,
  PayrollPaymentMethod,
  PayrollRunStatus,
} from "@/types/payroll";

export const PAYROLL_REFERENCE_PERIOD = "2026-07";

export const PAYROLL_TABS = [
  {
    label: "Overview",
    href: "/payroll",
  },
  {
    label: "Payroll runs",
    href: "/payroll/runs",
  },
  {
    label: "Compensation",
    href: "/payroll/compensation",
  },
  {
    label: "Adjustments",
    href: "/payroll/adjustments",
  },
  {
    label: "Statutory",
    href: "/payroll/statutory",
  },
  {
    label: "Settings",
    href: "/payroll/settings",
  },
] as const;

export const PAYROLL_RUN_STATUS_CONFIG: Record<
  PayrollRunStatus,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "success";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  processing: {
    label: "Processing",
    badgeVariant: "info",
  },
  pending_approval: {
    label: "Pending approval",
    badgeVariant: "warning",
  },
  approved: {
    label: "Approved",
    badgeVariant: "success",
  },
  paid: {
    label: "Paid",
    badgeVariant: "success",
  },
};

export const PAYROLL_EMPLOYEE_STATUS_CONFIG: Record<
  PayrollEmployeeStatus,
  {
    label: string;
    badgeVariant: "neutral" | "warning" | "success" | "danger";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  pending_review: {
    label: "Pending review",
    badgeVariant: "warning",
  },
  approved: {
    label: "Approved",
    badgeVariant: "success",
  },
  paid: {
    label: "Paid",
    badgeVariant: "success",
  },
  on_hold: {
    label: "On hold",
    badgeVariant: "danger",
  },
};

export const PAYROLL_PAYMENT_METHOD_CONFIG: Record<
  PayrollPaymentMethod,
  {
    label: string;
    badgeVariant: "info" | "neutral" | "warning";
  }
> = {
  bank_transfer: {
    label: "Bank transfer",
    badgeVariant: "info",
  },
  cash: {
    label: "Cash",
    badgeVariant: "neutral",
  },
  cheque: {
    label: "Cheque",
    badgeVariant: "warning",
  },
};

export const PAYROLL_COPY = {
  eyebrow: "Payroll",
  title: "Payroll overview",
  description:
    "Monitor payroll costs, employee payments and approval workflows across organization branches.",
  startRun: "Start payroll run",
  export: "Export report",
  currentPeriod: "July 2026 payroll",
  trendTitle: "Payroll cost trend",
  trendDescription: "Gross payroll, deductions and net payments during the current year.",
  breakdownTitle: "Current cost breakdown",
  breakdownDescription:
    "Distribution of payroll cost components for the selected branch.",
  attentionTitle: "Requires attention",
  attentionDescription: "Employee payroll records awaiting review or currently on hold.",
  runsTitle: "Recent payroll runs",
  runsDescription: "Payroll processing history within the selected organization scope.",
  employeeTitle: "Employee payroll preview",
  employeeDescription:
    "Review employee earnings, deductions and payment status for July 2026.",
  searchPlaceholder: "Search employee, ID, department or designation",
  allStatuses: "All payment statuses",
} as const;
