export type AttendanceStatus =
  "present" | "late" | "absent" | "on_leave" | "remote" | "missing_checkout";

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  branchId: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  workedMinutes: number;
  note: string;
};

export type AttendanceSummary = {
  scheduled: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  missingCheckout: number;
};

export type AttendanceTrendPoint = {
  day: string;
  present: number;
  late: number;
  absent: number;
};

export type DepartmentAttendancePoint = {
  name: string;
  present: number;
  late: number;
  absent: number;
};
