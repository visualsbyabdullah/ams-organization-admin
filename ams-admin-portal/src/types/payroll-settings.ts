import type { PayrollPaymentMethod } from "@/types/payroll";

export type PayrollSettingsStatus = "active" | "draft" | "archived";

export type PayrollSettingsScope = "organization" | "branch";

export type PayrollSchedule = "monthly" | "biweekly" | "weekly";

export type PayrollPayDateRule = "month_end" | "fixed_day" | "last_working_day";

export type PayrollRoundingMode = "none" | "nearest_1" | "nearest_10" | "nearest_100";

export type PayrollBankFileFormat = "none" | "csv" | "xlsx" | "bank_template";

export type PayrollSettingsRecord = {
  id: string;
  name: string;
  scope: PayrollSettingsScope;
  branchId?: string;
  branchName?: string;
  status: PayrollSettingsStatus;
  schedule: PayrollSchedule;
  cutoffDay: number;
  payDateRule: PayrollPayDateRule;
  payDay: number;
  defaultPaymentMethod: PayrollPaymentMethod;
  standardWorkingDays: number;
  standardDailyHours: number;
  includeAttendanceOvertime: boolean;
  deductUnpaidLeave: boolean;
  autoGeneratePayslips: boolean;
  emailPayslips: boolean;
  autoLockApprovedRuns: boolean;
  requireFinanceApproval: boolean;
  requireAdminApproval: boolean;
  roundingMode: PayrollRoundingMode;
  bankFileFormat: PayrollBankFileFormat;
  updatedAt: string;
  updatedBy: string;
  note: string;
};
