import {
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Star,
  Users,
} from "lucide-react";

import type {
  PermissionAction,
  PortalAccessStatus,
  RoleStatus,
} from "@/types/access-control";

export const PERMISSION_ACTIONS: ReadonlyArray<{
  id: PermissionAction;
  label: string;
}> = [
  {
    id: "view",
    label: "View",
  },
  {
    id: "create",
    label: "Create",
  },
  {
    id: "edit",
    label: "Edit",
  },
  {
    id: "approve",
    label: "Approve",
  },
  {
    id: "delete",
    label: "Delete",
  },
  {
    id: "export",
    label: "Export",
  },
];

export const PERMISSION_MODULES = [
  {
    id: "overview",
    label: "Overview",
    description:
      "Dashboard metrics and organization summaries.",
    icon: LayoutDashboard,
  },
  {
    id: "people",
    label: "People",
    description:
      "Employees, onboarding and organization structure.",
    icon: Users,
  },
  {
    id: "attendance",
    label: "Time & Attendance",
    description:
      "Attendance, schedules, shifts and corrections.",
    icon: CalendarDays,
  },
  {
    id: "leave",
    label: "Leave",
    description:
      "Leave requests, balances and policies.",
    icon: BookOpenCheck,
  },
  {
    id: "payroll",
    label: "Payroll",
    description:
      "Payroll runs, salaries and adjustments.",
    icon: CircleDollarSign,
  },
  {
    id: "invoices",
    label: "Invoices",
    description:
      "Invoice generation, payments and records.",
    icon: ReceiptText,
  },
  {
    id: "performance",
    label: "Performance",
    description:
      "Reviews, goals and employee bonuses.",
    icon: Star,
  },
  {
    id: "training",
    label: "Training",
    description:
      "Training records and job descriptions.",
    icon: GraduationCap,
  },
  {
    id: "documents",
    label: "Documents",
    description:
      "Letters, policies and document templates.",
    icon: FileText,
  },
  {
    id: "support",
    label: "Support",
    description:
      "Employee and organization support tickets.",
    icon: Headphones,
  },
  {
    id: "reports",
    label: "Reports",
    description:
      "Organization reports and data exports.",
    icon: BarChart3,
  },
  {
    id: "branches",
    label: "Branches",
    description:
      "Branch records and organization hierarchy.",
    icon: Building2,
  },
  {
    id: "settings",
    label: "Settings",
    description:
      "Organization configuration and integrations.",
    icon: Settings,
  },
] as const;

export const ROLE_STATUS_CONFIG: Record<
  RoleStatus,
  {
    label: string;
    badgeVariant:
      | "success"
      | "neutral";
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

export const PORTAL_ACCESS_STATUS_CONFIG: Record<
  PortalAccessStatus,
  {
    label: string;
    badgeVariant:
      | "success"
      | "warning"
      | "danger";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  invited: {
    label: "Invitation pending",
    badgeVariant: "warning",
  },
  disabled: {
    label: "Disabled",
    badgeVariant: "danger",
  },
};

export const ACCESS_CONTROL_COPY = {
  eyebrow: "People",
  title: "Roles & access",
  description:
    "Control employee access through reusable roles, module permissions and branch-level restrictions.",
  createRole: "Create custom role",
  searchUsers:
    "Search employee, email or role",
} as const;

export function createEmptyPermissions() {
  return Object.fromEntries(
    PERMISSION_MODULES.map((module) => [
      module.id,
      [],
    ]),
  ) as Record<string, PermissionAction[]>;
}
