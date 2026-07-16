import type { EmployeeStatus } from "@/types/employee";

export const PEOPLE_TABS = [
  {
    label: "Directory",
    href: "/people",
  },
  {
    label: "Onboarding",
    href: "/people/onboarding",
  },
  {
    label: "Organization Structure",
    href: "/people/structure",
  },
  {
    label: "Employee Changes",
    href: "/people/changes",
  },
  {
    label: "Roles & Access",
    href: "/people/access",
  },
] as const;

export const EMPLOYEE_STATUS_CONFIG: Record<
  EmployeeStatus,
  {
    label: string;
    badgeVariant:
      | "success"
      | "warning"
      | "danger"
      | "info";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  on_leave: {
    label: "On leave",
    badgeVariant: "info",
  },
  probation: {
    label: "Probation",
    badgeVariant: "warning",
  },
  inactive: {
    label: "Inactive",
    badgeVariant: "danger",
  },
};

export const EMPLOYEE_FILTERS = {
  allDepartments: "All departments",
  allStatuses: "All statuses",
} as const;
