export type EmployeeChangeType =
  | "promotion"
  | "branch_transfer"
  | "department_change"
  | "designation_change"
  | "manager_change"
  | "status_change"
  | "salary_adjustment";

export type EmployeeChangeStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "scheduled"
  | "completed";

export type ApprovalStepStatus =
  | "completed"
  | "pending"
  | "rejected";

export type ApprovalStep = {
  label: string;
  status: ApprovalStepStatus;
  actor?: string;
  date?: string;
};

export type EmployeeChange = {
  id: string;
  employeeId: string;
  branchId: string;
  type: EmployeeChangeType;
  fromValue: string;
  toValue: string;
  effectiveDate: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: EmployeeChangeStatus;
  approvals: ApprovalStep[];
};
