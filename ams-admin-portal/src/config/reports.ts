import type {
  ReportCategory,
  ReportDefinitionStatus,
  ReportExportStatus,
  ReportFormat,
  ReportScheduleFrequency,
  ReportScheduleStatus,
  ReportScope,
  ReportSettingsStatus,
} from "@/types/report";

export const REPORT_TABS = [
  { label: "Overview", href: "/reports" },
  { label: "Report Library", href: "/reports/library" },
  { label: "Scheduled", href: "/reports/scheduled" },
  { label: "Exports", href: "/reports/exports" },
  { label: "Settings", href: "/reports/settings" },
] as const;

export const REPORT_CATEGORY_CONFIG: Record<
  ReportCategory,
  { label: string; badgeVariant: "neutral" | "info" | "warning" | "danger" | "success" }
> = {
  people: { label: "People", badgeVariant: "info" },
  attendance: { label: "Attendance", badgeVariant: "warning" },
  leave: { label: "Leave", badgeVariant: "success" },
  payroll: { label: "Payroll", badgeVariant: "danger" },
  loans: { label: "Loans", badgeVariant: "warning" },
  performance: { label: "Performance", badgeVariant: "info" },
  training: { label: "Training", badgeVariant: "success" },
  documents: { label: "Documents", badgeVariant: "neutral" },
  support: { label: "Support", badgeVariant: "info" },
};

export const REPORT_FORMAT_CONFIG: Record<
  ReportFormat,
  { label: string; extension: string; badgeVariant: "neutral" | "info" | "danger" }
> = {
  csv: { label: "CSV", extension: "csv", badgeVariant: "neutral" },
  xlsx: { label: "Excel", extension: "xlsx", badgeVariant: "info" },
  pdf: { label: "PDF", extension: "pdf", badgeVariant: "danger" },
};

export const REPORT_DEFINITION_STATUS_CONFIG: Record<
  ReportDefinitionStatus,
  { label: string; badgeVariant: "success" | "warning" | "neutral" }
> = {
  active: { label: "Active", badgeVariant: "success" },
  draft: { label: "Draft", badgeVariant: "warning" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const REPORT_SCOPE_CONFIG: Record<
  ReportScope,
  { label: string; badgeVariant: "info" | "neutral" }
> = {
  organization: { label: "Organization", badgeVariant: "info" },
  branch: { label: "Branch", badgeVariant: "neutral" },
};

export const REPORT_SCHEDULE_FREQUENCY_CONFIG: Record<
  ReportScheduleFrequency,
  { label: string }
> = {
  daily: { label: "Daily" },
  weekly: { label: "Weekly" },
  monthly: { label: "Monthly" },
  quarterly: { label: "Quarterly" },
};

export const REPORT_SCHEDULE_STATUS_CONFIG: Record<
  ReportScheduleStatus,
  { label: string; badgeVariant: "success" | "warning" | "neutral" }
> = {
  active: { label: "Active", badgeVariant: "success" },
  paused: { label: "Paused", badgeVariant: "warning" },
  ended: { label: "Ended", badgeVariant: "neutral" },
};

export const REPORT_EXPORT_STATUS_CONFIG: Record<
  ReportExportStatus,
  { label: string; badgeVariant: "neutral" | "info" | "success" | "danger" }
> = {
  queued: { label: "Queued", badgeVariant: "neutral" },
  processing: { label: "Processing", badgeVariant: "info" },
  completed: { label: "Completed", badgeVariant: "success" },
  failed: { label: "Failed", badgeVariant: "danger" },
};

export const REPORT_SETTINGS_STATUS_CONFIG: Record<
  ReportSettingsStatus,
  { label: string; badgeVariant: "success" | "warning" | "neutral" }
> = {
  active: { label: "Active", badgeVariant: "success" },
  draft: { label: "Draft", badgeVariant: "warning" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const REPORT_COPY = {
  overview: {
    eyebrow: "Organization Intelligence",
    title: "Reports",
    description:
      "Generate, schedule and govern operational reports across people, payroll, attendance and workforce modules.",
    generateAction: "Generate report",
    chartTitle: "Report generation",
    chartDescription:
      "Manual and scheduled report activity during the current year.",
    popularTitle: "Popular reports",
    popularDescription:
      "Frequently generated reports in the selected organization scope.",
    recentTitle: "Recent exports",
    recentDescription:
      "Latest completed and in-progress report exports.",
  },
  library: {
    eyebrow: "Organization Intelligence",
    title: "Report library",
    description:
      "Manage reusable report definitions, available formats, included fields and default filters.",
    createAction: "Add report",
    registerTitle: "Report definition register",
    registerDescription:
      "Organization reports and branch-specific report definitions.",
    searchPlaceholder:
      "Search report, code, category, field or filter",
    allCategories: "All report categories",
    allStatuses: "All report statuses",
    allScopes: "Organization and branch",
    emptyTitle: "No reports found",
    emptyDescription:
      "Change the filters or add a report definition.",
  },
  scheduled: {
    eyebrow: "Organization Intelligence",
    title: "Scheduled reports",
    description:
      "Automate recurring report generation and controlled delivery to internal recipients.",
    createAction: "Add schedule",
    registerTitle: "Scheduled report register",
    registerDescription:
      "Active, paused and ended report-delivery schedules.",
    searchPlaceholder:
      "Search schedule, report, branch or recipient",
    allFrequencies: "All frequencies",
    allStatuses: "All schedule statuses",
    emptyTitle: "No scheduled reports found",
    emptyDescription:
      "Change the filters or add a report schedule.",
  },
  exports: {
    eyebrow: "Organization Intelligence",
    title: "Report exports",
    description:
      "Track generated report files, processing status, record counts and retention history.",
    generateAction: "Generate report",
    registerTitle: "Export history",
    registerDescription:
      "Manual and scheduled report files within the selected organization scope.",
    searchPlaceholder:
      "Search report, requester, format or status",
    allFormats: "All formats",
    allStatuses: "All export statuses",
    emptyTitle: "No report exports found",
    emptyDescription:
      "Change the filters or generate a report.",
  },
  settings: {
    eyebrow: "Organization Intelligence",
    title: "Report settings",
    description:
      "Configure export limits, retention, sensitive-data controls and branch-specific reporting policies.",
    createAction: "Add settings",
    registerTitle: "Report settings register",
    registerDescription:
      "Organization defaults and branch-specific reporting controls.",
    effectiveTitle: "Effective report settings",
    effectiveDescription:
      "Rules currently applied within the selected organization scope.",
    searchPlaceholder:
      "Search settings, branch or export policy",
    allStatuses: "All settings statuses",
    allScopes: "Organization and branch",
    emptyTitle: "No report settings found",
    emptyDescription:
      "Change the filters or add report settings.",
  },
} as const;

export const REPORT_SETTINGS_CONTROLS = [
  { key: "allowEmployeeDataExport", label: "Employee data exports" },
  { key: "allowPayrollDataExport", label: "Payroll data exports" },
  { key: "requireReasonForPayrollExport", label: "Payroll export reason" },
  { key: "scheduledReportsEnabled", label: "Scheduled reports" },
  { key: "externalRecipientsAllowed", label: "External recipients" },
  { key: "notifyOnCompletion", label: "Completion notifications" },
  { key: "includeOrganizationBranding", label: "Organization branding" },
] as const;

