import type {
  LeaveType,
} from "@/types/leave";

export type LeavePolicyStatus =
  | "active"
  | "draft"
  | "archived";

export type LeavePolicyScope =
  | "all_branches"
  | "selected_branches";

export type LeaveAccrualMethod =
  | "annual"
  | "monthly"
  | "manual";

export type LeaveApprovalMode =
  | "manager"
  | "hr"
  | "manager_and_hr"
  | "automatic";

export type LeavePolicy = {
  id: string;
  name: string;
  description: string;
  leaveType: LeaveType;
  status: LeavePolicyStatus;
  scope: LeavePolicyScope;
  branchIds: string[];
  annualAllowance: number;
  accrualMethod: LeaveAccrualMethod;
  maximumConsecutiveDays: number;
  minimumNoticeDays: number;
  carryForwardEnabled: boolean;
  carryForwardLimit: number;
  attachmentRequiredAfterDays: number;
  allowNegativeBalance: boolean;
  approvalMode: LeaveApprovalMode;
  applicableEmployees: number;
  updatedAt: string;
  updatedBy: string;
};
