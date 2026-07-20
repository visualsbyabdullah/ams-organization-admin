import type {
  Timesheet,
  TimesheetDay,
} from "@/types/timesheet";

function createDay(
  date: string,
  regularMinutes: number,
  overtimeMinutes = 0,
  breakMinutes = 60,
): TimesheetDay {
  return {
    date,
    regularMinutes,
    overtimeMinutes,
    breakMinutes,
    leaveMinutes: 0,
    status: "worked",
  };
}

function createLeaveDay(
  date: string,
): TimesheetDay {
  return {
    date,
    regularMinutes: 0,
    overtimeMinutes: 0,
    breakMinutes: 0,
    leaveMinutes: 480,
    status: "leave",
  };
}

function createWeekendDay(
  date: string,
): TimesheetDay {
  return {
    date,
    regularMinutes: 0,
    overtimeMinutes: 0,
    breakMinutes: 0,
    leaveMinutes: 0,
    status: "weekend",
  };
}

function createMissingDay(
  date: string,
): TimesheetDay {
  return {
    date,
    regularMinutes: 0,
    overtimeMinutes: 0,
    breakMinutes: 0,
    leaveMinutes: 0,
    status: "missing",
  };
}

export const TIMESHEETS: Timesheet[] = [
  {
    id: "timesheet-001",
    employeeId: "emp-001",
    branchId: "islamabad",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    status: "approved",
    submittedAt: "2026-07-19",
    approvedBy: "Maaz",
    note: "",
    days: [
      createDay("2026-07-13", 480),
      createDay("2026-07-14", 480, 20),
      createDay("2026-07-15", 480),
      createDay("2026-07-16", 484),
      createDay("2026-07-17", 480, 30),
      createWeekendDay("2026-07-18"),
      createWeekendDay("2026-07-19"),
    ],
  },
  {
    id: "timesheet-002",
    employeeId: "emp-002",
    branchId: "lahore",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    status: "submitted",
    submittedAt: "2026-07-19",
    note:
      "Traffic delay affected Tuesday check-in.",
    days: [
      createDay("2026-07-13", 470),
      createDay("2026-07-14", 475),
      createDay("2026-07-15", 485, 25),
      createDay("2026-07-16", 467),
      createDay("2026-07-17", 480, 45),
      createWeekendDay("2026-07-18"),
      createWeekendDay("2026-07-19"),
    ],
  },
  {
    id: "timesheet-003",
    employeeId: "emp-003",
    branchId: "islamabad",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    status: "approved",
    submittedAt: "2026-07-19",
    approvedBy: "Ayesha Khan",
    note: "Annual leave recorded.",
    days: [
      createDay("2026-07-13", 480),
      createDay("2026-07-14", 472),
      createDay("2026-07-15", 480),
      createLeaveDay("2026-07-16"),
      createLeaveDay("2026-07-17"),
      createWeekendDay("2026-07-18"),
      createWeekendDay("2026-07-19"),
    ],
  },
  {
    id: "timesheet-004",
    employeeId: "emp-004",
    branchId: "karachi",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    status: "submitted",
    submittedAt: "2026-07-19",
    note:
      "Thursday checkout is missing.",
    days: [
      createDay("2026-07-13", 510, 30),
      createDay("2026-07-14", 480),
      createDay("2026-07-15", 495, 15),
      createMissingDay("2026-07-16"),
      createDay("2026-07-17", 500, 20),
      createWeekendDay("2026-07-18"),
      createWeekendDay("2026-07-19"),
    ],
  },
  {
    id: "timesheet-005",
    employeeId: "emp-005",
    branchId: "lahore",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    status: "draft",
    note: "",
    days: [
      createDay("2026-07-13", 480),
      createDay("2026-07-14", 480),
      createDay("2026-07-15", 480),
      createDay("2026-07-16", 480),
      createMissingDay("2026-07-17"),
      createWeekendDay("2026-07-18"),
      createWeekendDay("2026-07-19"),
    ],
  },
  {
    id: "timesheet-006",
    employeeId: "emp-006",
    branchId: "islamabad",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    status: "rejected",
    submittedAt: "2026-07-18",
    note:
      "Timesheet returned because two attendance entries require correction.",
    days: [
      createDay("2026-07-13", 460),
      createMissingDay("2026-07-14"),
      createDay("2026-07-15", 470),
      createMissingDay("2026-07-16"),
      createDay("2026-07-17", 480),
      createWeekendDay("2026-07-18"),
      createWeekendDay("2026-07-19"),
    ],
  },
];
