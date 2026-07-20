export type AttendancePolicyStatus =
  | "active"
  | "draft"
  | "archived";

export type AttendancePolicyScope =
  | "all_branches"
  | "selected_branches";

export type AttendancePolicyRules = {
  gracePeriodMinutes: number;
  lateAfterMinutes: number;
  absenceAfterMinutes: number;
  minimumHalfDayMinutes: number;
  standardDailyMinutes: number;
  overtimeAfterMinutes: number;
  correctionWindowDays: number;
  requireLocation: boolean;
  allowRemoteAttendance: boolean;
  autoApproveOvertime: boolean;
};

export type AttendancePolicy = {
  id: string;
  name: string;
  description: string;
  status: AttendancePolicyStatus;
  scope: AttendancePolicyScope;
  branchIds: string[];
  applicableEmployees: number;
  rules: AttendancePolicyRules;
  updatedAt: string;
  updatedBy: string;
};
