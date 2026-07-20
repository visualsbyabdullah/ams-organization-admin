import type {
  ScheduleAssignment,
  ScheduleAssignmentStatus,
  ShiftTemplate,
} from "@/types/schedule";

export const SHIFT_TEMPLATES: ShiftTemplate[] =
  [
    {
      id: "shift-standard",
      name: "General Shift",
      code: "GEN",
      category: "standard",
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
      workingMinutes: 480,
      status: "active",
    },
    {
      id: "shift-morning",
      name: "Morning Shift",
      code: "MOR",
      category: "morning",
      startTime: "07:00",
      endTime: "16:00",
      breakMinutes: 60,
      workingMinutes: 480,
      status: "active",
    },
    {
      id: "shift-evening",
      name: "Evening Shift",
      code: "EVE",
      category: "evening",
      startTime: "14:00",
      endTime: "23:00",
      breakMinutes: 60,
      workingMinutes: 480,
      status: "active",
    },
    {
      id: "shift-night",
      name: "Night Shift",
      code: "NGT",
      category: "night",
      startTime: "22:00",
      endTime: "07:00",
      breakMinutes: 60,
      workingMinutes: 480,
      status: "active",
    },
    {
      id: "shift-flexible",
      name: "Flexible Shift",
      code: "FLX",
      category: "flexible",
      startTime: "10:00",
      endTime: "18:00",
      breakMinutes: 60,
      workingMinutes: 420,
      status: "active",
    },
  ];

function createAssignments(
  employeeId: string,
  branchId: string,
  shiftId: string,
  dates: string[],
  conflictDates: string[] = [],
): ScheduleAssignment[] {
  return dates.map((date) => {
    const status: ScheduleAssignmentStatus =
      conflictDates.includes(date)
        ? "conflict"
        : "confirmed";

    return {
      id: `${employeeId}-${date}`,
      employeeId,
      branchId,
      date,
      shiftId,
      status,
      note:
        status === "conflict"
          ? "This shift conflicts with an existing attendance or leave record."
          : "",
    };
  });
}

const MONDAY_TO_FRIDAY = [
  "2026-07-13",
  "2026-07-14",
  "2026-07-15",
  "2026-07-16",
  "2026-07-17",
];

const MONDAY_TO_SATURDAY = [
  ...MONDAY_TO_FRIDAY,
  "2026-07-18",
];

export const SCHEDULE_ASSIGNMENTS: ScheduleAssignment[] =
  [
    ...createAssignments(
      "emp-001",
      "islamabad",
      "shift-standard",
      MONDAY_TO_FRIDAY,
    ),

    ...createAssignments(
      "emp-002",
      "lahore",
      "shift-morning",
      MONDAY_TO_SATURDAY,
    ),

    ...createAssignments(
      "emp-003",
      "islamabad",
      "shift-flexible",
      MONDAY_TO_FRIDAY,
      ["2026-07-16"],
    ),

    ...createAssignments(
      "emp-004",
      "karachi",
      "shift-morning",
      MONDAY_TO_SATURDAY,
    ),

    ...createAssignments(
      "emp-005",
      "lahore",
      "shift-evening",
      MONDAY_TO_FRIDAY,
    ),

    ...createAssignments(
      "emp-006",
      "islamabad",
      "shift-standard",
      [
        "2026-07-13",
        "2026-07-14",
        "2026-07-15",
      ],
      ["2026-07-14"],
    ),
  ];
