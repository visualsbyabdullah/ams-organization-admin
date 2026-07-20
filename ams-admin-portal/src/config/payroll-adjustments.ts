import type {
  PayrollAdjustmentDirection,
  PayrollAdjustmentFrequency,
  PayrollAdjustmentStatus,
  PayrollAdjustmentType,
} from "@/types/payroll-adjustment";

export const PAYROLL_ADJUSTMENT_TYPE_CONFIG: Record<
  PayrollAdjustmentType,
  {
    label: string;
    direction: PayrollAdjustmentDirection;
    badgeVariant:
      | "info"
      | "success"
      | "warning"
      | "danger"
      | "neutral";
  }
> = {
  bonus: {
    label: "Bonus",
    direction: "earning",
    badgeVariant: "success",
  },
  overtime: {
    label: "Overtime",
    direction: "earning",
    badgeVariant: "info",
  },
  reimbursement: {
    label: "Reimbursement",
    direction: "earning",
    badgeVariant: "info",
  },
  allowance: {
    label: "Additional allowance",
    direction: "earning",
    badgeVariant: "success",
  },
  arrears: {
    label: "Salary arrears",
    direction: "earning",
    badgeVariant: "warning",
  },
  deduction: {
    label: "Manual deduction",
    direction: "deduction",
    badgeVariant: "danger",
  },
  loan_recovery: {
    label: "Loan recovery",
    direction: "deduction",
    badgeVariant: "warning",
  },
  penalty: {
    label: "Penalty",
    direction: "deduction",
    badgeVariant: "danger",
  },
};

export const PAYROLL_ADJUSTMENT_STATUS_CONFIG: Record<
  PayrollAdjustmentStatus,
  {
    label: string;
    badgeVariant:
      | "neutral"
      | "warning"
      | "success"
      | "danger"
      | "info";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  pending_approval: {
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
  applied: {
    label: "Applied to payroll",
    badgeVariant: "info",
  },
};

export const PAYROLL_ADJUSTMENT_DIRECTION_CONFIG: Record<
  PayrollAdjustmentDirection,
  {
    label: string;
    badgeVariant:
      | "success"
      | "danger";
  }
> = {
  earning: {
    label: "Earning",
    badgeVariant: "success",
  },
  deduction: {
    label: "Deduction",
    badgeVariant: "danger",
  },
};

export const PAYROLL_ADJUSTMENT_FREQUENCY_CONFIG: Record<
  PayrollAdjustmentFrequency,
  {
    label: string;
  }
> = {
  one_time: {
    label: "One-time",
  },
  recurring: {
    label: "Recurring",
  },
};

export const PAYROLL_ADJUSTMENT_PERIOD_OPTIONS = [
  {
    value: "all",
    label: "All payroll periods",
  },
  {
    value: "2026-07",
    label: "July 2026",
  },
  {
    value: "2026-08",
    label: "August 2026",
  },
] as const;

export const PAYROLL_ADJUSTMENTS_COPY = {
  eyebrow: "Payroll",
  title: "Payroll adjustments",
  description:
    "Manage bonuses, reimbursements, overtime, arrears and employee deductions before payroll processing.",
  createAction: "Add adjustment",
  exportAction: "Export adjustments",
  tableTitle: "Adjustment register",
  tableDescription:
    "Review payroll adjustments within the selected branch and processing period.",
  attentionTitle: "Approval queue",
  attentionDescription:
    "Adjustments waiting for finance or administrator approval.",
  searchPlaceholder:
    "Search employee, ID, department, adjustment or reason",
  allTypes: "All adjustment types",
  allStatuses: "All statuses",
  allDirections: "Earnings and deductions",
  emptyTitle: "No payroll adjustments found",
  emptyDescription:
    "Change the selected filters or create a new payroll adjustment.",
} as const;
