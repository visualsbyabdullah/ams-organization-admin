import type {
  AttendanceException,
} from "@/types/attendance-exception";

export const ATTENDANCE_EXCEPTIONS: AttendanceException[] =
  [
    {
      id: "exception-001",
      employeeId: "emp-002",
      branchId: "lahore",
      date: "2026-07-16",
      type: "late_arrival",
      status: "under_review",
      severity: "medium",
      source: "employee",
      detectedAt: "2026-07-16 09:19",
      impactMinutes: 19,
      reason:
        "Check-in was recorded after the configured grace period.",
      employeeNote:
        "Traffic was blocked due to road construction. I informed my manager before shift start.",
      adminNote: "",
      reviewer: "Ayesha Khan",
    },
    {
      id: "exception-002",
      employeeId: "emp-004",
      branchId: "karachi",
      date: "2026-07-16",
      type: "missing_checkout",
      status: "open",
      severity: "high",
      source: "system",
      detectedAt: "2026-07-16 18:10",
      impactMinutes: 0,
      reason:
        "Employee checked in at 07:52 but no checkout was recorded.",
      employeeNote: "",
      adminNote: "",
    },
    {
      id: "exception-003",
      employeeId: "emp-006",
      branchId: "islamabad",
      date: "2026-07-16",
      type: "absence",
      status: "open",
      severity: "high",
      source: "system",
      detectedAt: "2026-07-16 11:00",
      impactMinutes: 480,
      reason:
        "No attendance, leave or remote-working record was found.",
      employeeNote: "",
      adminNote: "",
    },
    {
      id: "exception-004",
      employeeId: "emp-003",
      branchId: "islamabad",
      date: "2026-07-16",
      type: "schedule_conflict",
      status: "approved",
      severity: "medium",
      source: "manager",
      detectedAt: "2026-07-15 16:42",
      impactMinutes: 480,
      reason:
        "An active shift was assigned during approved annual leave.",
      employeeNote:
        "Annual leave was approved before the schedule was published.",
      adminNote:
        "Shift removed and leave record retained.",
      reviewer: "Maaz",
    },
    {
      id: "exception-005",
      employeeId: "emp-001",
      branchId: "islamabad",
      date: "2026-07-15",
      type: "overtime",
      status: "resolved",
      severity: "low",
      source: "system",
      detectedAt: "2026-07-15 18:35",
      impactMinutes: 35,
      reason:
        "Recorded working time exceeded the scheduled shift.",
      employeeNote:
        "Stayed late to complete month-end HR reports.",
      adminNote:
        "Overtime approved by the department manager.",
      reviewer: "Maaz",
      resolvedAt: "2026-07-16",
    },
    {
      id: "exception-006",
      employeeId: "emp-005",
      branchId: "lahore",
      date: "2026-07-14",
      type: "location_mismatch",
      status: "rejected",
      severity: "medium",
      source: "system",
      detectedAt: "2026-07-14 08:58",
      impactMinutes: 0,
      reason:
        "Mobile check-in was submitted outside the permitted workplace radius.",
      employeeNote:
        "I checked in from the client site after approval from my manager.",
      adminNote:
        "No client-site assignment was found for the selected date.",
      reviewer: "Ayesha Khan",
    },
    {
      id: "exception-007",
      employeeId: "emp-004",
      branchId: "karachi",
      date: "2026-07-14",
      type: "late_arrival",
      status: "resolved",
      severity: "medium",
      source: "manager",
      detectedAt: "2026-07-14 08:21",
      impactMinutes: 21,
      reason:
        "Employee arrived after the scheduled shift start.",
      employeeNote:
        "Transport issue reported to the branch manager.",
      adminNote:
        "Exception accepted as a one-time transport delay.",
      reviewer: "Maaz",
      resolvedAt: "2026-07-14",
    },
    {
      id: "exception-008",
      employeeId: "emp-001",
      branchId: "islamabad",
      date: "2026-07-13",
      type: "early_departure",
      status: "approved",
      severity: "low",
      source: "employee",
      detectedAt: "2026-07-13 16:45",
      impactMinutes: 75,
      reason:
        "Employee checked out before the scheduled shift end.",
      employeeNote:
        "Left early for an approved medical appointment.",
      adminNote:
        "Manager approval confirmed.",
      reviewer: "Maaz",
    },
  ];
