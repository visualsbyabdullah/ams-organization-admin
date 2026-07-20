export type ReportCategory =
  | "people"
  | "attendance"
  | "leave"
  | "payroll"
  | "loans"
  | "performance"
  | "training"
  | "documents"
  | "support";

export type ReportFormat = "csv" | "xlsx" | "pdf";
export type ReportScope = "organization" | "branch";
export type ReportDefinitionStatus = "active" | "draft" | "archived";
export type ReportScheduleFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type ReportScheduleStatus = "active" | "paused" | "ended";
export type ReportExportStatus = "queued" | "processing" | "completed" | "failed";
export type ReportSettingsStatus = "active" | "draft" | "archived";

export type ReportDefinition = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ReportCategory;
  status: ReportDefinitionStatus;
  scope: ReportScope;
  branchId?: string;
  branchName?: string;
  defaultFormat: ReportFormat;
  availableFormats: ReportFormat[];
  includedFields: string[];
  defaultFilters: string[];
  recordEstimate: number;
  lastGeneratedAt?: string;
  updatedAt: string;
  updatedBy: string;
};

export type ReportSchedule = {
  id: string;
  reportId: string;
  name: string;
  scope: ReportScope;
  branchId?: string;
  branchName?: string;
  status: ReportScheduleStatus;
  frequency: ReportScheduleFrequency;
  runAt: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  format: ReportFormat;
  recipients: string[];
  includeEmptyReport: boolean;
  nextRunAt: string;
  lastRunAt?: string;
  updatedAt: string;
  updatedBy: string;
};

export type ReportExport = {
  id: string;
  reportId: string;
  branchId: string;
  requestedBy: string;
  format: ReportFormat;
  status: ReportExportStatus;
  createdAt: string;
  completedAt?: string;
  recordCount: number;
  fileSizeKb?: number;
  errorMessage?: string;
};

export type ReportSettings = {
  id: string;
  name: string;
  scope: ReportScope;
  branchId?: string;
  branchName?: string;
  status: ReportSettingsStatus;
  defaultFormat: ReportFormat;
  retentionDays: number;
  maximumRowsPerExport: number;
  allowEmployeeDataExport: boolean;
  allowPayrollDataExport: boolean;
  requireReasonForPayrollExport: boolean;
  scheduledReportsEnabled: boolean;
  externalRecipientsAllowed: boolean;
  notifyOnCompletion: boolean;
  includeOrganizationBranding: boolean;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type ReportGenerationTrendPoint = {
  month: string;
  generated: number;
  scheduled: number;
};
