export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected" | "locked";

export type TimesheetDayStatus = "worked" | "leave" | "weekend" | "missing";

export type TimesheetDay = {
  date: string;
  regularMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number;
  leaveMinutes: number;
  status: TimesheetDayStatus;
};

export type Timesheet = {
  id: string;
  employeeId: string;
  branchId: string;
  periodStart: string;
  periodEnd: string;
  status: TimesheetStatus;
  days: TimesheetDay[];
  submittedAt?: string;
  approvedBy?: string;
  note: string;
};

export type TimesheetChartPoint = {
  day: string;
  regularHours: number;
  overtimeHours: number;
};
