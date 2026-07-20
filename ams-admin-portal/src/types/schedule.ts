export type ShiftCategory =
  | "standard"
  | "morning"
  | "evening"
  | "night"
  | "flexible";

export type ShiftStatus =
  | "active"
  | "inactive";

export type ScheduleAssignmentStatus =
  | "scheduled"
  | "confirmed"
  | "conflict";

export type ShiftTemplate = {
  id: string;
  name: string;
  code: string;
  category: ShiftCategory;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workingMinutes: number;
  status: ShiftStatus;
};

export type ScheduleAssignment = {
  id: string;
  employeeId: string;
  branchId: string;
  date: string;
  shiftId: string;
  status: ScheduleAssignmentStatus;
  note: string;
};

export type ScheduleWeekDay = {
  date: string;
  label: string;
  shortLabel: string;
};
