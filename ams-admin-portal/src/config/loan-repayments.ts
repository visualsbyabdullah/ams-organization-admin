import type {
  LoanRepaymentSource,
  LoanRepaymentStatus,
} from "@/types/loan-repayment";

export const LOAN_REPAYMENT_REFERENCE_DATE =
  "2026-07-16";

export const LOAN_REPAYMENT_REFERENCE_PERIOD =
  "2026-07";

export const LOAN_REPAYMENT_STATUS_CONFIG: Record<
  LoanRepaymentStatus,
  {
    label: string;
    badgeVariant:
      | "neutral"
      | "info"
      | "warning"
      | "danger"
      | "success";
  }
> = {
  scheduled: {
    label: "Scheduled",
    badgeVariant: "neutral",
  },
  due: {
    label: "Due",
    badgeVariant: "warning",
  },
  partial: {
    label: "Partially paid",
    badgeVariant: "info",
  },
  overdue: {
    label: "Overdue",
    badgeVariant: "danger",
  },
  paid: {
    label: "Paid",
    badgeVariant: "success",
  },
  waived: {
    label: "Waived",
    badgeVariant: "neutral",
  },
  failed: {
    label: "Failed",
    badgeVariant: "danger",
  },
};

export const LOAN_REPAYMENT_SOURCE_CONFIG: Record<
  LoanRepaymentSource,
  {
    label: string;
    badgeVariant:
      | "info"
      | "neutral"
      | "warning"
      | "danger";
  }
> = {
  payroll_deduction: {
    label: "Payroll deduction",
    badgeVariant: "info",
  },
  bank_transfer: {
    label: "Bank transfer",
    badgeVariant: "neutral",
  },
  cash: {
    label: "Cash payment",
    badgeVariant: "warning",
  },
  manual_adjustment: {
    label: "Manual adjustment",
    badgeVariant: "danger",
  },
};

export const LOAN_REPAYMENT_PERIOD_OPTIONS = [
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
  {
    value: "2026-06",
    label: "June 2026",
  },
] as const;

export const LOAN_REPAYMENTS_COPY = {
  eyebrow: "Employee Finance",
  title: "Loan repayments",
  description:
    "Track scheduled installments, payroll deductions, overdue balances and employee loan collections.",
  exportAction: "Export repayments",
  processAction: "Process payroll deductions",
  registerTitle: "Repayment register",
  registerDescription:
    "Review employee loan installments across the selected organization scope.",
  attentionTitle: "Collection queue",
  attentionDescription:
    "Due, overdue and partially paid installments requiring payroll or finance action.",
  searchPlaceholder:
    "Search employee, ID, loan type, reference or repayment note",
  allStatuses: "All repayment statuses",
  allSources: "All payment sources",
  emptyTitle: "No loan repayments found",
  emptyDescription:
    "Change the selected filters or payroll period.",
} as const;
