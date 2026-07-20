import type {
  LeaveAccrualMethod,
  LeaveApprovalMode,
  LeavePolicyScope,
  LeavePolicyStatus,
} from "@/types/leave-policy";

export const LEAVE_POLICY_STATUS_CONFIG: Record<
  LeavePolicyStatus,
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
  draft: {
    label: "Draft",
    badgeVariant: "warning",
  },
  archived: {
    label: "Archived",
    badgeVariant: "neutral",
  },
};

export const LEAVE_POLICY_SCOPE_CONFIG: Record<
  LeavePolicyScope,
  {
    label: string;
    badgeVariant:
      | "info"
      | "neutral";
  }
> = {
  all_branches: {
    label: "All branches",
    badgeVariant: "info",
  },
  selected_branches: {
    label: "Selected branches",
    badgeVariant: "neutral",
  },
};

export const LEAVE_POLICY_ACCRUAL_CONFIG: Record<
  LeaveAccrualMethod,
  {
    label: string;
    description: string;
  }
> = {
  annual: {
    label: "Annual allocation",
    description:
      "Full allowance is granted at the start of the leave year.",
  },
  monthly: {
    label: "Monthly accrual",
    description:
      "Employees earn leave gradually every month.",
  },
  manual: {
    label: "Manual allocation",
    description:
      "Leave balance is added manually by an administrator.",
  },
};

export const LEAVE_POLICY_APPROVAL_CONFIG: Record<
  LeaveApprovalMode,
  {
    label: string;
    description: string;
  }
> = {
  manager: {
    label: "Manager approval",
    description:
      "Only the employee's reporting manager reviews the request.",
  },
  hr: {
    label: "HR approval",
    description:
      "Leave requests are reviewed directly by HR.",
  },
  manager_and_hr: {
    label: "Manager and HR",
    description:
      "Both manager and HR approval are required.",
  },
  automatic: {
    label: "Automatic approval",
    description:
      "Eligible requests are approved without manual review.",
  },
};

export const LEAVE_POLICY_BRANCH_OPTIONS = [
  {
    id: "islamabad",
    label: "Islamabad Branch",
    employeeCount: 107,
  },
  {
    id: "lahore",
    label: "Lahore Branch",
    employeeCount: 82,
  },
  {
    id: "karachi",
    label: "Karachi Branch",
    employeeCount: 63,
  },
] as const;

export const LEAVE_POLICIES_COPY = {
  eyebrow: "Leave Management",
  title: "Leave policies",
  description:
    "Configure employee leave entitlements, accrual rules, approvals and branch-level eligibility.",
  createAction: "Create policy",
  policiesTitle: "Organization leave policies",
  policiesDescription:
    "Reusable leave rules currently configured for the selected organization scope.",
  searchPlaceholder:
    "Search policy name, leave type or branch",
  allTypes: "All leave types",
  allStatuses: "All policy statuses",
  emptyTitle: "No leave policies found",
  emptyDescription:
    "Change the filters or create a new leave policy.",
} as const;

export function getLeavePolicyEmployeeCount(
  scope: LeavePolicyScope,
  branchIds: string[],
) {
  if (scope === "all_branches") {
    return LEAVE_POLICY_BRANCH_OPTIONS.reduce(
      (total, branch) =>
        total + branch.employeeCount,
      0,
    );
  }

  return LEAVE_POLICY_BRANCH_OPTIONS
    .filter((branch) =>
      branchIds.includes(branch.id),
    )
    .reduce(
      (total, branch) =>
        total + branch.employeeCount,
      0,
    );
}
