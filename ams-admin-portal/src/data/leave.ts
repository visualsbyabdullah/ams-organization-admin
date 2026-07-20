import type {
  LeaveBalance,
  LeaveRequest,
  LeaveTrendPoint,
  LeaveType,
} from "@/types/leave";

const DEFAULT_ALLOWANCE: Record<
  LeaveType,
  number
> = {
  annual: 20,
  casual: 10,
  sick: 10,
  unpaid: 30,
  maternity: 90,
  paternity: 10,
};

function createBalance(
  employeeId: string,
  used: Partial<
    Record<LeaveType, number>
  >,
): LeaveBalance {
  return {
    employeeId,
    year: 2026,
    allowance: {
      ...DEFAULT_ALLOWANCE,
    },
    used: {
      annual: 0,
      casual: 0,
      sick: 0,
      unpaid: 0,
      maternity: 0,
      paternity: 0,
      ...used,
    },
  };
}

export const LEAVE_BALANCES: LeaveBalance[] =
  [
    createBalance("emp-001", {
      annual: 5,
      casual: 2,
      sick: 1,
    }),
    createBalance("emp-002", {
      annual: 8,
      casual: 3,
      sick: 2,
    }),
    createBalance("emp-003", {
      annual: 12,
      casual: 1,
      sick: 0,
    }),
    createBalance("emp-004", {
      annual: 4,
      casual: 4,
      sick: 1,
    }),
    createBalance("emp-005", {
      annual: 6,
      casual: 2,
      sick: 3,
    }),
    createBalance("emp-006", {
      annual: 9,
      casual: 5,
      sick: 2,
    }),
  ];

export const LEAVE_REQUESTS: LeaveRequest[] =
  [
    {
      id: "leave-001",
      employeeId: "emp-002",
      branchId: "lahore",
      type: "casual",
      startDate: "2026-07-21",
      endDate: "2026-07-22",
      totalDays: 2,
      reason:
        "Personal family commitment.",
      status: "pending",
      requestedAt: "2026-07-15",
      managerNote: "",
    },
    {
      id: "leave-002",
      employeeId: "emp-003",
      branchId: "islamabad",
      type: "annual",
      startDate: "2026-07-16",
      endDate: "2026-07-18",
      totalDays: 3,
      reason:
        "Annual family vacation.",
      status: "approved",
      requestedAt: "2026-07-05",
      reviewedBy: "Maaz",
      reviewedAt: "2026-07-06",
      managerNote:
        "Coverage arranged with the payroll team.",
    },
    {
      id: "leave-003",
      employeeId: "emp-006",
      branchId: "islamabad",
      type: "sick",
      startDate: "2026-07-16",
      endDate: "2026-07-16",
      totalDays: 1,
      reason:
        "Medical rest advised.",
      status: "pending",
      requestedAt: "2026-07-16",
      managerNote: "",
    },
    {
      id: "leave-004",
      employeeId: "emp-005",
      branchId: "lahore",
      type: "annual",
      startDate: "2026-07-19",
      endDate: "2026-07-23",
      totalDays: 5,
      reason:
        "Travel outside the city.",
      status: "approved",
      requestedAt: "2026-07-10",
      reviewedBy: "Ayesha Khan",
      reviewedAt: "2026-07-11",
      managerNote:
        "Approved after confirming team coverage.",
    },
    {
      id: "leave-005",
      employeeId: "emp-004",
      branchId: "karachi",
      type: "casual",
      startDate: "2026-07-14",
      endDate: "2026-07-14",
      totalDays: 1,
      reason:
        "Urgent personal matter.",
      status: "approved",
      requestedAt: "2026-07-13",
      reviewedBy: "Maaz",
      reviewedAt: "2026-07-13",
      managerNote: "",
    },
    {
      id: "leave-006",
      employeeId: "emp-001",
      branchId: "islamabad",
      type: "annual",
      startDate: "2026-08-03",
      endDate: "2026-08-07",
      totalDays: 5,
      reason:
        "Planned annual leave.",
      status: "pending",
      requestedAt: "2026-07-14",
      managerNote: "",
    },
    {
      id: "leave-007",
      employeeId: "emp-002",
      branchId: "lahore",
      type: "sick",
      startDate: "2026-07-08",
      endDate: "2026-07-09",
      totalDays: 2,
      reason:
        "Seasonal illness.",
      status: "rejected",
      requestedAt: "2026-07-10",
      reviewedBy: "Ayesha Khan",
      reviewedAt: "2026-07-11",
      managerNote:
        "Request was submitted after the correction window.",
    },
    {
      id: "leave-008",
      employeeId: "emp-004",
      branchId: "karachi",
      type: "unpaid",
      startDate: "2026-08-10",
      endDate: "2026-08-12",
      totalDays: 3,
      reason:
        "Extended personal commitment.",
      status: "cancelled",
      requestedAt: "2026-07-12",
      managerNote: "",
    },
  ];

export const LEAVE_TRENDS: Record<
  string,
  LeaveTrendPoint[]
> = {
  all: [
    {
      month: "Jan",
      approved: 18,
      pending: 3,
      rejected: 2,
    },
    {
      month: "Feb",
      approved: 21,
      pending: 4,
      rejected: 1,
    },
    {
      month: "Mar",
      approved: 24,
      pending: 5,
      rejected: 3,
    },
    {
      month: "Apr",
      approved: 20,
      pending: 2,
      rejected: 2,
    },
    {
      month: "May",
      approved: 28,
      pending: 6,
      rejected: 2,
    },
    {
      month: "Jun",
      approved: 31,
      pending: 5,
      rejected: 4,
    },
    {
      month: "Jul",
      approved: 19,
      pending: 7,
      rejected: 2,
    },
  ],
  islamabad: [
    {
      month: "Jan",
      approved: 8,
      pending: 1,
      rejected: 1,
    },
    {
      month: "Feb",
      approved: 9,
      pending: 2,
      rejected: 0,
    },
    {
      month: "Mar",
      approved: 10,
      pending: 2,
      rejected: 1,
    },
    {
      month: "Apr",
      approved: 8,
      pending: 1,
      rejected: 1,
    },
    {
      month: "May",
      approved: 12,
      pending: 3,
      rejected: 1,
    },
    {
      month: "Jun",
      approved: 14,
      pending: 2,
      rejected: 2,
    },
    {
      month: "Jul",
      approved: 8,
      pending: 4,
      rejected: 1,
    },
  ],
  lahore: [
    {
      month: "Jan",
      approved: 6,
      pending: 1,
      rejected: 1,
    },
    {
      month: "Feb",
      approved: 7,
      pending: 1,
      rejected: 1,
    },
    {
      month: "Mar",
      approved: 8,
      pending: 2,
      rejected: 1,
    },
    {
      month: "Apr",
      approved: 7,
      pending: 1,
      rejected: 1,
    },
    {
      month: "May",
      approved: 9,
      pending: 2,
      rejected: 1,
    },
    {
      month: "Jun",
      approved: 10,
      pending: 2,
      rejected: 1,
    },
    {
      month: "Jul",
      approved: 7,
      pending: 2,
      rejected: 1,
    },
  ],
  karachi: [
    {
      month: "Jan",
      approved: 4,
      pending: 1,
      rejected: 0,
    },
    {
      month: "Feb",
      approved: 5,
      pending: 1,
      rejected: 0,
    },
    {
      month: "Mar",
      approved: 6,
      pending: 1,
      rejected: 1,
    },
    {
      month: "Apr",
      approved: 5,
      pending: 0,
      rejected: 0,
    },
    {
      month: "May",
      approved: 7,
      pending: 1,
      rejected: 0,
    },
    {
      month: "Jun",
      approved: 7,
      pending: 1,
      rejected: 1,
    },
    {
      month: "Jul",
      approved: 4,
      pending: 1,
      rejected: 0,
    },
  ],
};
