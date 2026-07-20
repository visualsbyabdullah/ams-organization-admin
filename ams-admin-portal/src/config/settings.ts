import type {
  IntegrationStatus,
  IntegrationType,
  SettingsCategory,
  SettingsFieldDefinition,
  SettingsSection,
  SettingsStatus,
} from "@/types/settings";

export const SETTINGS_SECTIONS: {
  id: SettingsSection;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "organization", label: "Organization" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "audit", label: "Audit Log" },
];

export const SETTINGS_STATUS_CONFIG: Record<
  SettingsStatus,
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

export const SETTINGS_SCOPE_CONFIG = {
  organization: {
    label: "Organization",
    badgeVariant: "info" as const,
  },
  branch: {
    label: "Branch",
    badgeVariant: "neutral" as const,
  },
};

export const INTEGRATION_TYPE_CONFIG: Record<
  IntegrationType,
  {
    label: string;
    badgeVariant: "info" | "success" | "warning" | "neutral";
  }
> = {
  email: {
    label: "Email",
    badgeVariant: "info",
  },
  attendance: {
    label: "Attendance",
    badgeVariant: "warning",
  },
  payroll: {
    label: "Payroll",
    badgeVariant: "success",
  },
  storage: {
    label: "Storage",
    badgeVariant: "neutral",
  },
  calendar: {
    label: "Calendar",
    badgeVariant: "info",
  },
};

export const INTEGRATION_STATUS_CONFIG: Record<
  IntegrationStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  connected: {
    label: "Connected",
    badgeVariant: "success",
  },
  attention: {
    label: "Needs attention",
    badgeVariant: "warning",
  },
  disconnected: {
    label: "Disconnected",
    badgeVariant: "neutral",
  },
};

const yesNoOptions = [
  { value: "true", label: "Enabled" },
  { value: "false", label: "Disabled" },
];

export const SETTINGS_FIELD_CONFIG: Record<SettingsCategory, SettingsFieldDefinition[]> =
  {
    organization: [
      {
        key: "legalName",
        label: "Legal organization name",
        type: "text",
      },
      {
        key: "employeeIdPrefix",
        label: "Employee ID prefix",
        type: "text",
      },
      {
        key: "timezone",
        label: "Timezone",
        type: "select",
        options: [
          {
            value: "Asia/Karachi",
            label: "Pakistan Standard Time",
          },
        ],
      },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: [
          {
            value: "PKR",
            label: "Pakistani Rupee (PKR)",
          },
        ],
      },
      {
        key: "dateFormat",
        label: "Date format",
        type: "select",
        options: [
          {
            value: "DD MMM YYYY",
            label: "DD MMM YYYY",
          },
          {
            value: "DD/MM/YYYY",
            label: "DD/MM/YYYY",
          },
          {
            value: "YYYY-MM-DD",
            label: "YYYY-MM-DD",
          },
        ],
      },
      {
        key: "weekStartsOn",
        label: "Week starts on",
        type: "select",
        options: [
          {
            value: "monday",
            label: "Monday",
          },
          {
            value: "sunday",
            label: "Sunday",
          },
        ],
      },
      {
        key: "workweekHours",
        label: "Standard workweek hours",
        type: "number",
        minimum: 1,
      },
      {
        key: "probationDays",
        label: "Default probation days",
        type: "number",
        minimum: 0,
      },
      {
        key: "allowBranchOverrides",
        label: "Allow branch overrides",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "documentBranding",
        label: "Organization branding on documents",
        type: "switch",
        options: yesNoOptions,
      },
    ],
    security: [
      {
        key: "sessionTimeoutMinutes",
        label: "Session timeout minutes",
        type: "number",
        minimum: 1,
      },
      {
        key: "maximumLoginAttempts",
        label: "Maximum login attempts",
        type: "number",
        minimum: 1,
      },
      {
        key: "passwordMinimumLength",
        label: "Minimum password length",
        type: "number",
        minimum: 8,
      },
      {
        key: "mfaForAdmins",
        label: "Require MFA for administrators",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "passwordUppercase",
        label: "Require uppercase character",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "passwordNumber",
        label: "Require numeric character",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "passwordSymbol",
        label: "Require symbol character",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "payrollExportApproval",
        label: "Require payroll export approval",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "employeeExportApproval",
        label: "Require employee export approval",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "auditRetentionDays",
        label: "Audit retention days",
        type: "number",
        minimum: 1,
      },
    ],
    notifications: [
      {
        key: "emailEnabled",
        label: "Email notifications",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "inAppEnabled",
        label: "In-app notifications",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "dailyDigest",
        label: "Daily digest",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "digestTime",
        label: "Digest time",
        type: "time",
      },
      {
        key: "attendanceExceptions",
        label: "Attendance exceptions",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "leaveRequests",
        label: "Leave requests",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "payrollEvents",
        label: "Payroll events",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "loanEvents",
        label: "Loan events",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "documentExpiry",
        label: "Document expiry",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "trainingDue",
        label: "Training due",
        type: "switch",
        options: yesNoOptions,
      },
      {
        key: "supportSla",
        label: "Support SLA",
        type: "switch",
        options: yesNoOptions,
      },
    ],
  };

export const SETTINGS_COPY = {
  eyebrow: "Platform Administration",
  title: "Settings",
  description:
    "Manage organization defaults, branch overrides, security, notifications and integrations.",
  addProfile: "Add profile",
  addIntegration: "Add integration",
  edit: "Edit",
  activate: "Activate",
  archive: "Archive",
  connect: "Connect",
  disconnect: "Disconnect",
  test: "Test connection",
  cancel: "Cancel",
  save: "Save changes",
  create: "Create",
  searchPlaceholder: "Search profile, branch, provider or actor",
  emptyTitle: "No settings records found",
  emptyDescription: "Change the filters or add a new settings record.",
};

export const SETTINGS_SECTION_COPY: Record<
  SettingsSection,
  {
    title: string;
    description: string;
  }
> = {
  overview: {
    title: "Settings overview",
    description: "Review effective platform settings and recent administrative activity.",
  },
  organization: {
    title: "Organization settings",
    description: "Configure identity, date, workweek and branch override defaults.",
  },
  security: {
    title: "Security settings",
    description: "Manage sessions, passwords, MFA, approvals and audit retention.",
  },
  notifications: {
    title: "Notification settings",
    description: "Configure channels, digests and operational event alerts.",
  },
  integrations: {
    title: "Integrations",
    description: "Manage email, attendance, payroll, storage and calendar connections.",
  },
  audit: {
    title: "Settings audit log",
    description: "Review immutable administrative settings activity.",
  },
};
