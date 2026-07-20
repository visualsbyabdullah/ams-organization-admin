import type {
  PayrollBankFileFormat,
  PayrollPayDateRule,
  PayrollRoundingMode,
  PayrollSchedule,
  PayrollSettingsScope,
  PayrollSettingsStatus,
} from "@/types/payroll-settings";

export const PAYROLL_SETTINGS_STATUS_CONFIG: Record<
  PayrollSettingsStatus,
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

export const PAYROLL_SETTINGS_SCOPE_CONFIG: Record<
  PayrollSettingsScope,
  {
    label: string;
    badgeVariant:
      | "info"
      | "neutral";
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

export const PAYROLL_SCHEDULE_CONFIG: Record<
  PayrollSchedule,
  {
    label: string;
    description: string;
  }
> = {
  monthly: {
    label: "Monthly",
    description:
      "One payroll cycle is processed every calendar month.",
  },
  biweekly: {
    label: "Biweekly",
    description:
      "Payroll is processed once every two weeks.",
  },
  weekly: {
    label: "Weekly",
    description:
      "Payroll is processed every week.",
  },
};

export const PAYROLL_PAY_DATE_RULE_CONFIG: Record<
  PayrollPayDateRule,
  {
    label: string;
    description: string;
  }
> = {
  month_end: {
    label: "Calendar month end",
    description:
      "Employees are paid on the final calendar day of the month.",
  },
  fixed_day: {
    label: "Fixed day",
    description:
      "Employees are paid on the configured day of each payroll period.",
  },
  last_working_day: {
    label: "Last working day",
    description:
      "Employees are paid on the final working day before month end.",
  },
};

export const PAYROLL_ROUNDING_MODE_CONFIG: Record<
  PayrollRoundingMode,
  {
    label: string;
  }
> = {
  none: {
    label: "No rounding",
  },
  nearest_1: {
    label: "Nearest PKR 1",
  },
  nearest_10: {
    label: "Nearest PKR 10",
  },
  nearest_100: {
    label: "Nearest PKR 100",
  },
};

export const PAYROLL_BANK_FILE_FORMAT_CONFIG: Record<
  PayrollBankFileFormat,
  {
    label: string;
  }
> = {
  none: {
    label: "No bank export",
  },
  csv: {
    label: "CSV file",
  },
  xlsx: {
    label: "Excel workbook",
  },
  bank_template: {
    label: "Configured bank template",
  },
};

export const PAYROLL_SETTINGS_COPY = {
  eyebrow: "Payroll",
  title: "Payroll settings",
  description:
    "Configure organization payroll schedules, approvals, automation and branch-level processing rules.",
  createAction: "Add configuration",
  settingsTitle: "Payroll configurations",
  settingsDescription:
    "Organization defaults and branch-specific overrides currently available in payroll.",
  effectiveTitle: "Effective configuration",
  effectiveDescription:
    "Rules currently applied to the selected organization scope.",
  searchPlaceholder:
    "Search configuration, branch or payroll schedule",
  allStatuses: "All statuses",
  allScopes: "Organization and branch",
  emptyTitle: "No payroll configurations found",
  emptyDescription:
    "Change the filters or add a new payroll configuration.",
} as const;
