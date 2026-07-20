export type AttendanceExceptionType =
  | "late_arrival"
  | "early_departure"
  | "missing_checkin"
  | "missing_checkout"
  | "absence"
  | "schedule_conflict"
  | "overtime"
  | "location_mismatch";

export type AttendanceExceptionStatus =
  | "open"
  | "under_review"
  | "approved"
  | "rejected"
  | "resolved";

export type AttendanceExceptionSeverity =
  | "low"
  | "medium"
  | "high";

export type AttendanceExceptionSource =
  | "system"
  | "employee"
  | "manager"
  | "admin";

export type AttendanceException = {
  id: string;
  employeeId: string;
  branchId: string;
  date: string;
  type: AttendanceExceptionType;
  status: AttendanceExceptionStatus;
  severity: AttendanceExceptionSeverity;
  source: AttendanceExceptionSource;
  detectedAt: string;
  impactMinutes: number;
  reason: string;
  employeeNote: string;
  adminNote: string;
  reviewer?: string;
  resolvedAt?: string;
};
