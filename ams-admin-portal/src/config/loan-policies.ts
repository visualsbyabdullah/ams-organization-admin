import type {
  LoanApprovalMode,
  LoanInterestMode,
  LoanPolicyScope,
  LoanPolicyStatus,
} from "@/types/loan-policy";

export const LOAN_POLICY_STATUS_CONFIG: Record<
  LoanPolicyStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  draft: {
    label: "Draft",
    badgeVariant: "warning",
  },
  archived: {
    label: "Archived",
    badgeVariant: "neutral",
  },
};

export const LOAN_POLICY_SCOPE_CONFIG: Record<
  LoanPolicyScope,
  {
    label: string;
    badgeVariant: "info" | "neutral";
  }
> = {
  organization: {
    label: "Organization default",
    badgeVariant: "info",
  },
  branch: {
    label: "Branch override",
    badgeVariant: "neutral",
  },
};

export const LOAN_INTEREST_MODE_CONFIG: Record<
  LoanInterestMode,
  {
    label: string;
    description: string;
  }
> = {
  interest_free: {
    label: "Interest-free",
    description: "Employee repays only the approved principal amount.",
  },
  flat_rate: {
    label: "Flat-rate interest",
    description: "Interest is calculated on the original approved amount.",
  },
  reducing_balance: {
    label: "Reducing balance",
    description: "Interest is calculated on the remaining outstanding balance.",
  },
};

export const LOAN_APPROVAL_MODE_CONFIG: Record<
  LoanApprovalMode,
  {
    label: string;
    description: string;
    stages: number;
  }
> = {
  manager_finance_admin: {
    label: "Manager, finance and admin",
    description: "Manager recommendation followed by finance and administrator approval.",
    stages: 3,
  },
  finance_admin: {
    label: "Finance and admin",
    description: "Finance reviews the request before final administrator approval.",
    stages: 2,
  },
  admin_only: {
    label: "Administrator only",
    description: "Organization administrator provides the final decision.",
    stages: 1,
  },
};

export const LOAN_POLICIES_COPY = {
  eyebrow: "Employee Finance",
  title: "Loan policies",
  description:
    "Configure employee loan eligibility, limits, repayment rules and branch-level approval workflows.",
  createAction: "Add policy",
  registerTitle: "Loan policy register",
  registerDescription:
    "Organization defaults and branch-specific employee loan policies.",
  effectiveTitle: "Effective loan policy",
  effectiveDescription: "Rules currently applied within the selected organization scope.",
  searchPlaceholder: "Search policy, branch, loan type or approval workflow",
  allStatuses: "All policy statuses",
  allScopes: "Organization and branch",
  emptyTitle: "No loan policies found",
  emptyDescription: "Change the filters or create a new employee loan policy.",
} as const;
