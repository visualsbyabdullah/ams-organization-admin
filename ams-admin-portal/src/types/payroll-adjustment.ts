export type PayrollAdjustmentType =
  | "bonus"
  | "overtime"
  | "reimbursement"
  | "allowance"
  | "arrears"
  | "deduction"
  | "loan_recovery"
  | "penalty";

export type PayrollAdjustmentDirection = "earning" | "deduction";

export type PayrollAdjustmentStatus =
  "draft" | "pending_approval" | "approved" | "rejected" | "applied";

export type PayrollAdjustmentFrequency = "one_time" | "recurring";

export type PayrollAdjustment = {
  id: string;
  employeeId: string;
  branchId: string;
  type: PayrollAdjustmentType;
  direction: PayrollAdjustmentDirection;
  status: PayrollAdjustmentStatus;
  frequency: PayrollAdjustmentFrequency;
  amount: number;
  effectivePeriod: string;
  taxable: boolean;
  reason: string;
  internalNote: string;
  createdAt: string;
  createdBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  appliedAt?: string;
};
