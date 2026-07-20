import type {
  AttendancePolicyScope,
  AttendancePolicyStatus,
} from "@/types/attendance-policy";

export const ATTENDANCE_POLICY_STATUS_CONFIG: Record<
  AttendancePolicyStatus,
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

export const ATTENDANCE_POLICY_SCOPE_CONFIG: Record<
  AttendancePolicyScope,
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

export const ATTENDANCE_POLICY_BRANCH_OPTIONS = [
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

export const ATTENDANCE_POLICY_COPY = {
  eyebrow: "Time & Attendance",
  title: "Attendance policies",
  description:
    "Configure organization attendance rules, correction windows and branch-specific workforce requirements.",
  createAction: "Create policy",
  searchPlaceholder:
    "Search policy name, description or branch",
  allStatuses: "All policy statuses",
  allScopes: "All policy scopes",
  policiesTitle: "Organization policies",
  policiesDescription:
    "Attendance policies currently configured for the selected organization scope.",
  emptyTitle: "No policies found",
  emptyDescription:
    "Change the filters or create a new attendance policy.",
} as const;

export function getPolicyEmployeeCount(
  scope: AttendancePolicyScope,
  branchIds: string[],
) {
  if (scope === "all_branches") {
    return ATTENDANCE_POLICY_BRANCH_OPTIONS.reduce(
      (total, branch) =>
        total + branch.employeeCount,
      0,
    );
  }

  return ATTENDANCE_POLICY_BRANCH_OPTIONS
    .filter((branch) =>
      branchIds.includes(branch.id),
    )
    .reduce(
      (total, branch) =>
        total + branch.employeeCount,
      0,
    );
}
