export type LeaveType =
  | "annual"
  | "casual"
  | "sick"
  | "unpaid"
  | "maternity"
  | "paternity";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  branchId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  managerNote: string;
};

export type LeaveBalance = {
  employeeId: string;
  year: number;
  allowance: Record<
    LeaveType,
    number
  >;
  used: Record<
    LeaveType,
    number
  >;
};

export type LeaveTrendPoint = {
  month: string;
  approved: number;
  pending: number;
  rejected: number;
};
