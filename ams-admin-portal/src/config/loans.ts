import type {
  EmployeeLoanStatus,
  EmployeeLoanType,
  LoanRepaymentMethod,
} from "@/types/loan";

export const LOAN_REFERENCE_DATE = "2026-07-16";

export const LOAN_TABS = [
  {
    label: "Overview",
    href: "/loans",
  },
  {
    label: "Applications",
    href: "/loans/applications",
  },
  {
    label: "Repayments",
    href: "/loans/repayments",
  },
  {
    label: "Policies",
    href: "/loans/policies",
  },
] as const;

export const LOAN_TYPE_CONFIG: Record<
  EmployeeLoanType,
  {
    label: string;
    badgeVariant: "info" | "warning" | "success" | "danger" | "neutral";
  }
> = {
  personal: {
    label: "Personal loan",
    badgeVariant: "info",
  },
  salary_advance: {
    label: "Salary advance",
    badgeVariant: "warning",
  },
  emergency: {
    label: "Emergency loan",
    badgeVariant: "danger",
  },
  medical: {
    label: "Medical loan",
    badgeVariant: "success",
  },
  education: {
    label: "Education loan",
    badgeVariant: "neutral",
  },
};

export const LOAN_STATUS_CONFIG: Record<
  EmployeeLoanStatus,
  {
    label: string;
    badgeVariant: "warning" | "success" | "info" | "danger" | "neutral";
  }
> = {
  pending_approval: {
    label: "Pending approval",
    badgeVariant: "warning",
  },
  approved: {
    label: "Approved",
    badgeVariant: "success",
  },
  repaying: {
    label: "Repaying",
    badgeVariant: "info",
  },
  on_hold: {
    label: "On hold",
    badgeVariant: "warning",
  },
  completed: {
    label: "Completed",
    badgeVariant: "success",
  },
  rejected: {
    label: "Rejected",
    badgeVariant: "danger",
  },
};

export const LOAN_REPAYMENT_METHOD_CONFIG: Record<
  LoanRepaymentMethod,
  {
    label: string;
    badgeVariant: "info" | "neutral" | "warning";
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
};

export const LOANS_COPY = {
  eyebrow: "Employee Finance",
  title: "Employee loans",
  description:
    "Manage employee loan requests, approvals, disbursements and payroll-linked repayments.",
  createAction: "New loan request",
  exportAction: "Export loans",
  chartTitle: "Repayment trend",
  chartDescription:
    "Scheduled, collected and overdue employee-loan repayments during the current year.",
  attentionTitle: "Requires attention",
  attentionDescription:
    "Loan applications awaiting approval and repayments with overdue balances.",
  tableTitle: "Employee loan register",
  tableDescription:
    "Review active and historical employee loans within the selected organization scope.",
  searchPlaceholder: "Search employee, ID, department, loan type or purpose",
  allTypes: "All loan types",
  allStatuses: "All loan statuses",
  emptyTitle: "No employee loans found",
  emptyDescription: "Change the filters or submit a new employee loan request.",
} as const;
