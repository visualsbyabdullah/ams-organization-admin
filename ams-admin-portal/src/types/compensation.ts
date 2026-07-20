export type CompensationStatus =
  | "active"
  | "pending_review"
  | "archived";

export type PayFrequency =
  | "monthly"
  | "hourly";

export type CompensationChangeReason =
  | "annual_review"
  | "promotion"
  | "market_adjustment"
  | "role_change"
  | "correction"
  | "new_hire";

export type CompensationRecord = {
  id: string;
  employeeId: string;
  branchId: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowance: number;
  bonusTargetPercentage: number;
  payFrequency: PayFrequency;
  status: CompensationStatus;
  effectiveDate: string;
  nextReviewDate: string;
  lastChangeReason: CompensationChangeReason;
  previousBaseSalary: number;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type CompensationHistory = {
  id: string;
  compensationId: string;
  employeeId: string;
  previousBaseSalary: number;
  newBaseSalary: number;
  effectiveDate: string;
  reason: CompensationChangeReason;
  approvedBy: string;
  note: string;
};

export type DepartmentCompensationPoint = {
  department: string;
  averageBaseSalary: number;
  averageTotalCompensation: number;
};
