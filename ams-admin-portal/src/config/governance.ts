import type {
  DeletionMode,
  GovernanceModule,
  GovernanceRole,
  GovernanceSection,
} from "@/types/governance";

export const GOVERNANCE_RETENTION_DAYS = 90;

export const GOVERNANCE_SECTIONS: {
  id: GovernanceSection;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "requests", label: "Deletion Requests" },
  { id: "recovery", label: "Recovery Center" },
  { id: "notifications", label: "Notifications" },
  { id: "policy", label: "Policy" },
];

export const GOVERNANCE_ROLE_CONFIG: Record<
  GovernanceRole,
  { label: string }
> = {
  line_manager: { label: "Line Manager" },
  hr_admin: { label: "HR Admin" },
  branch_admin: { label: "Branch Admin" },
  organization_admin: { label: "Organization Admin" },
  organization_head: { label: "Organization Head" },
};

export const GOVERNANCE_MODULE_CONFIG: Record<
  GovernanceModule,
  {
    label: string;
    mode: DeletionMode;
    description: string;
  }
> = {
  people: {
    label: "People",
    mode: "recoverable",
    description: "Employee records are hidden after approval and recoverable for 90 days.",
  },
  attendance: {
    label: "Attendance",
    mode: "recoverable",
    description: "Operational attendance records remain recoverable.",
  },
  leave: {
    label: "Leave",
    mode: "recoverable",
    description: "Leave records and approval history remain recoverable.",
  },
  documents: {
    label: "Documents",
    mode: "recoverable",
    description: "Documents remain recoverable during retention.",
  },
  training: {
    label: "Training",
    mode: "recoverable",
    description: "Training assignments and completion records remain recoverable.",
  },
  support: {
    label: "Support",
    mode: "recoverable",
    description: "Support records remain recoverable.",
  },
  branches: {
    label: "Branches",
    mode: "archive_only",
    description: "Branches are archived to preserve organization history.",
  },
  policies: {
    label: "Policies",
    mode: "recoverable",
    description: "Policies remain recoverable for 90 days.",
  },
  reports: {
    label: "Reports",
    mode: "recoverable",
    description: "Report definitions and schedules remain recoverable.",
  },
  settings: {
    label: "Settings",
    mode: "recoverable",
    description: "Settings profiles and branch overrides remain recoverable.",
  },
  performance: {
    label: "Performance",
    mode: "recoverable",
    description: "Performance plans and review drafts remain recoverable.",
  },
  payroll: {
    label: "Payroll",
    mode: "void_or_reverse",
    description: "Payroll transactions cannot be hard-deleted; use void or reversal.",
  },
  loans: {
    label: "Loans",
    mode: "void_or_reverse",
    description: "Loan transactions cannot be hard-deleted; use reversal or closure.",
  },
  invoices: {
    label: "Invoices",
    mode: "void_or_reverse",
    description: "Issued invoices cannot be hard-deleted; use void or credit.",
  },
};

export const GOVERNANCE_REQUEST_STATUS = {
  pending: { label: "Pending", badgeVariant: "warning" as const },
  approved: { label: "Approved", badgeVariant: "success" as const },
  rejected: { label: "Rejected", badgeVariant: "neutral" as const },
};

export const GOVERNANCE_RECOVERY_STATUS = {
  recoverable: { label: "Recoverable", badgeVariant: "success" as const },
  expiring: { label: "Expiring soon", badgeVariant: "warning" as const },
  expired: {
    label: "Expired — awaiting permanent deletion",
    badgeVariant: "danger" as const,
  },
};

export const GOVERNANCE_COPY = {
  eyebrow: "Organization Governance",
  title: "Governance & Recovery",
  description:
    "Review deletion requests, restore hidden records and manually confirm permanent deletion after 90 days.",
  createRequest: "Create deletion request",
  permanentPhrase: "PERMANENTLY DELETE",
  headEmail: "organization-head@ams.example",
  adminEmail: "organization-admin@ams.example",
};
