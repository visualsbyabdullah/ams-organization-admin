import type {
  StatutoryEmployeeStatus,
  StatutoryFilingCategory,
  StatutoryFilingStatus,
} from "@/types/payroll-statutory";

export const STATUTORY_REFERENCE_DATE = "2026-07-16";

export const STATUTORY_REFERENCE_PERIOD = "2026-07";

export const STATUTORY_EMPLOYEE_STATUS_CONFIG: Record<
  StatutoryEmployeeStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral" | "danger";
  }
> = {
  compliant: {
    label: "Compliant",
    badgeVariant: "success",
  },
  pending_review: {
    label: "Pending review",
    badgeVariant: "warning",
  },
  exempt: {
    label: "Exempt",
    badgeVariant: "neutral",
  },
  blocked: {
    label: "Blocked",
    badgeVariant: "danger",
  },
};

export const STATUTORY_FILING_STATUS_CONFIG: Record<
  StatutoryFilingStatus,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "success" | "warning" | "danger";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  ready: {
    label: "Ready to submit",
    badgeVariant: "info",
  },
  submitted: {
    label: "Submitted",
    badgeVariant: "warning",
  },
  accepted: {
    label: "Accepted",
    badgeVariant: "success",
  },
  overdue: {
    label: "Overdue",
    badgeVariant: "danger",
  },
};

export const STATUTORY_FILING_CATEGORY_CONFIG: Record<
  StatutoryFilingCategory,
  {
    label: string;
    badgeVariant: "info" | "success" | "warning" | "neutral";
  }
> = {
  income_tax: {
    label: "Income tax",
    badgeVariant: "info",
  },
  social_security: {
    label: "Social security",
    badgeVariant: "warning",
  },
  retirement: {
    label: "Retirement contribution",
    badgeVariant: "success",
  },
  health: {
    label: "Health contribution",
    badgeVariant: "success",
  },
  other: {
    label: "Other statutory",
    badgeVariant: "neutral",
  },
};

export const STATUTORY_PERIOD_OPTIONS = [
  {
    value: "all",
    label: "All payroll periods",
  },
  {
    value: "2026-07",
    label: "July 2026",
  },
  {
    value: "2026-06",
    label: "June 2026",
  },
] as const;

export const PAYROLL_STATUTORY_COPY = {
  eyebrow: "Payroll",
  title: "Statutory compliance",
  description:
    "Review employee deductions, employer contributions and statutory filing deadlines using organization-configured rules.",
  createAction: "Add filing",
  exportAction: "Export statutory",
  chartTitle: "Contribution by branch",
  chartDescription:
    "Employee deductions and employer statutory contributions for the current payroll period.",
  deadlinesTitle: "Filing deadlines",
  deadlinesDescription:
    "Upcoming and overdue statutory filings requiring payroll action.",
  employeeTitle: "Employee statutory register",
  employeeDescription:
    "Review tax and contribution values calculated for employee payroll records.",
  searchPlaceholder: "Search employee, ID, department or registration number",
  allEmployeeStatuses: "All employee statuses",
  filingsTitle: "Statutory filings",
  filingsDescription: "Track branch-level filing preparation, submission and acceptance.",
  allFilingStatuses: "All filing statuses",
  allCategories: "All filing categories",
} as const;
