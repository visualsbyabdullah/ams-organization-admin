import {
  ArrowRightLeft,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CircleUserRound,
  UserRoundCog,
} from "lucide-react";

import type { EmployeeChangeStatus, EmployeeChangeType } from "@/types/employee-change";

export const EMPLOYEE_CHANGE_TYPE_CONFIG: Record<
  EmployeeChangeType,
  {
    label: string;
    icon: typeof BriefcaseBusiness;
  }
> = {
  promotion: {
    label: "Promotion",
    icon: BriefcaseBusiness,
  },
  branch_transfer: {
    label: "Branch transfer",
    icon: ArrowRightLeft,
  },
  department_change: {
    label: "Department change",
    icon: Building2,
  },
  designation_change: {
    label: "Designation change",
    icon: CircleUserRound,
  },
  manager_change: {
    label: "Reporting manager",
    icon: UserRoundCog,
  },
  status_change: {
    label: "Employment status",
    icon: CircleUserRound,
  },
  salary_adjustment: {
    label: "Salary adjustment",
    icon: BadgeDollarSign,
  },
};

export const EMPLOYEE_CHANGE_STATUS_CONFIG: Record<
  EmployeeChangeStatus,
  {
    label: string;
    badgeVariant: "neutral" | "success" | "warning" | "danger" | "info";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  pending: {
    label: "Pending approval",
    badgeVariant: "warning",
  },
  approved: {
    label: "Approved",
    badgeVariant: "info",
  },
  rejected: {
    label: "Rejected",
    badgeVariant: "danger",
  },
  scheduled: {
    label: "Scheduled",
    badgeVariant: "info",
  },
  completed: {
    label: "Completed",
    badgeVariant: "success",
  },
};

export const APPROVAL_STATUS_CONFIG = {
  completed: {
    label: "Completed",
    badgeVariant: "success",
  },
  pending: {
    label: "Pending",
    badgeVariant: "warning",
  },
  rejected: {
    label: "Rejected",
    badgeVariant: "danger",
  },
} as const;

export const EMPLOYEE_CHANGES_COPY = {
  eyebrow: "People",
  title: "Employee changes",
  description: "Manage transfers, promotions, reporting changes and employment updates.",
  createAction: "New change request",
  searchPlaceholder: "Search employee, change type or requester",
  allTypes: "All change types",
  allStatuses: "All statuses",
} as const;
