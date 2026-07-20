import type {
  AttendanceCalendarDay,
  AttendanceRegisterRecord,
} from "@/types/attendance-register";

export const ATTENDANCE_REGISTER_RECORDS: AttendanceRegisterRecord[] =
  [
    {
      id: "register-001",
      employeeId: "emp-001",
      branchId: "islamabad",
      date: "2026-07-16",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "08:54",
      checkOut: "17:58",
      status: "present",
      workedMinutes: 544,
      note: "",
      source: "device",
      hasException: false,
    },
    {
      id: "register-002",
      employeeId: "emp-002",
      branchId: "lahore",
      date: "2026-07-16",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "09:19",
      checkOut: "18:06",
      status: "late",
      workedMinutes: 527,
      note: "Traffic delay reported.",
      source: "mobile",
      hasException: true,
    },
    {
      id: "register-003",
      employeeId: "emp-003",
      branchId: "islamabad",
      date: "2026-07-16",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "",
      checkOut: "",
      status: "on_leave",
      workedMinutes: 0,
      note: "Approved annual leave.",
      source: "manual",
      hasException: false,
    },
    {
      id: "register-004",
      employeeId: "emp-004",
      branchId: "karachi",
      date: "2026-07-16",
      scheduledStart: "08:00",
      scheduledEnd: "17:00",
      checkIn: "07:52",
      checkOut: "",
      status: "missing_checkout",
      workedMinutes: 0,
      note: "",
      source: "device",
      hasException: true,
    },
    {
      id: "register-005",
      employeeId: "emp-005",
      branchId: "lahore",
      date: "2026-07-16",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "08:58",
      checkOut: "18:02",
      status: "present",
      workedMinutes: 544,
      note: "",
      source: "device",
      hasException: false,
    },
    {
      id: "register-006",
      employeeId: "emp-006",
      branchId: "islamabad",
      date: "2026-07-16",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "",
      checkOut: "",
      status: "absent",
      workedMinutes: 0,
      note: "No attendance or leave record.",
      source: "manual",
      hasException: true,
    },
    {
      id: "register-007",
      employeeId: "emp-001",
      branchId: "islamabad",
      date: "2026-07-15",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "08:57",
      checkOut: "18:01",
      status: "present",
      workedMinutes: 544,
      note: "",
      source: "device",
      hasException: false,
    },
    {
      id: "register-008",
      employeeId: "emp-002",
      branchId: "lahore",
      date: "2026-07-15",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "08:51",
      checkOut: "17:56",
      status: "present",
      workedMinutes: 545,
      note: "",
      source: "mobile",
      hasException: false,
    },
    {
      id: "register-009",
      employeeId: "emp-003",
      branchId: "islamabad",
      date: "2026-07-15",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "09:12",
      checkOut: "18:04",
      status: "late",
      workedMinutes: 532,
      note: "",
      source: "device",
      hasException: true,
    },
    {
      id: "register-010",
      employeeId: "emp-004",
      branchId: "karachi",
      date: "2026-07-15",
      scheduledStart: "08:00",
      scheduledEnd: "17:00",
      checkIn: "07:48",
      checkOut: "17:03",
      status: "present",
      workedMinutes: 555,
      note: "",
      source: "device",
      hasException: false,
    },
    {
      id: "register-011",
      employeeId: "emp-005",
      branchId: "lahore",
      date: "2026-07-15",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "08:59",
      checkOut: "18:00",
      status: "present",
      workedMinutes: 541,
      note: "",
      source: "device",
      hasException: false,
    },
    {
      id: "register-012",
      employeeId: "emp-006",
      branchId: "islamabad",
      date: "2026-07-15",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "09:02",
      checkOut: "17:54",
      status: "present",
      workedMinutes: 532,
      note: "",
      source: "manual",
      hasException: false,
    },
    {
      id: "register-013",
      employeeId: "emp-001",
      branchId: "islamabad",
      date: "2026-07-14",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "08:55",
      checkOut: "18:05",
      status: "present",
      workedMinutes: 550,
      note: "",
      source: "device",
      hasException: false,
    },
    {
      id: "register-014",
      employeeId: "emp-002",
      branchId: "lahore",
      date: "2026-07-14",
      scheduledStart: "09:00",
      scheduledEnd: "18:00",
      checkIn: "",
      checkOut: "",
      status: "on_leave",
      workedMinutes: 0,
      note: "Approved casual leave.",
      source: "manual",
      hasException: false,
    },
    {
      id: "register-015",
      employeeId: "emp-004",
      branchId: "karachi",
      date: "2026-07-14",
      scheduledStart: "08:00",
      scheduledEnd: "17:00",
      checkIn: "08:21",
      checkOut: "17:08",
      status: "late",
      workedMinutes: 527,
      note: "Late arrival reviewed.",
      source: "device",
      hasException: true,
    },
  ];

const CALENDAR_SCOPE_CONFIG = {
  all: {
    scheduled: 252,
    offset: 1,
  },
  islamabad: {
    scheduled: 107,
    offset: 2,
  },
  lahore: {
    scheduled: 82,
    offset: 3,
  },
  karachi: {
    scheduled: 63,
    offset: 4,
  },
} as const;

export function getAttendanceCalendar(
  branchId: string,
): AttendanceCalendarDay[] {
  const scope =
    CALENDAR_SCOPE_CONFIG[
      branchId as keyof typeof CALENDAR_SCOPE_CONFIG
    ] ?? CALENDAR_SCOPE_CONFIG.all;

  return Array.from(
    {
      length: 16,
    },
    (_, index) => {
      const dayNumber = index + 1;

      const date = new Date(
        2026,
        6,
        dayNumber,
      );

      const isWeekend =
        date.getDay() === 0 ||
        date.getDay() === 6;

      const scheduled = isWeekend
        ? Math.round(
            scope.scheduled * 0.45,
          )
        : scope.scheduled;

      const late =
        (dayNumber * 2 +
          scope.offset) %
        8;

      const absent =
        (dayNumber +
          scope.offset) %
        5;

      const onLeave =
        (dayNumber * 3 +
          scope.offset) %
        10;

      const present = Math.max(
        scheduled -
          late -
          absent -
          onLeave,
        0,
      );

      const attendanceRate =
        scheduled > 0
          ? Math.round(
              ((present + late) /
                scheduled) *
                100,
            )
          : 0;

      return {
        date: `2026-07-${String(
          dayNumber,
        ).padStart(2, "0")}`,
        scheduled,
        present,
        late,
        absent,
        onLeave,
        attendanceRate,
      };
    },
  );
}
