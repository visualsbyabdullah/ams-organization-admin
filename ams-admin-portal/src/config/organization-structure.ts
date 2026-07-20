import type { DepartmentStatus, DesignationLevel } from "@/types/organization-structure";

export const DEPARTMENT_STATUS_CONFIG: Record<
  DepartmentStatus,
  {
    label: string;
    badgeVariant: "success" | "neutral";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  inactive: {
    label: "Inactive",
    badgeVariant: "neutral",
  },
};

export const DESIGNATION_LEVEL_CONFIG: Record<
  DesignationLevel,
  {
    label: string;
    badgeVariant: "danger" | "warning" | "info" | "neutral";
  }
> = {
  leadership: {
    label: "Leadership",
    badgeVariant: "danger",
  },
  management: {
    label: "Management",
    badgeVariant: "warning",
  },
  professional: {
    label: "Professional",
    badgeVariant: "info",
  },
  entry: {
    label: "Entry level",
    badgeVariant: "neutral",
  },
};

export const ORGANIZATION_STRUCTURE_COPY = {
  eyebrow: "People",
  title: "Organization structure",
  description:
    "Manage departments, designations, reporting lines and branch workforce distribution.",
  addDepartment: "Add department",
  addDesignation: "Add designation",
  departmentSearch: "Search departments by name or code",
  designationSearch: "Search designations",
} as const;
