export type EmployeeLoanType =
  | "personal"
  | "salary_advance"
  | "emergency"
  | "medical"
  | "education";

export type EmployeeLoanStatus =
  | "pending_approval"
  | "approved"
  | "repaying"
  | "on_hold"
  | "completed"
  | "rejected";

export type LoanRepaymentMethod =
  | "payroll_deduction"
  | "bank_transfer"
  | "cash";

export type EmployeeLoan = {
  id: string;
  employeeId: string;
  branchId: string;
  type: EmployeeLoanType;
  status: EmployeeLoanStatus;
  requestedAmount: number;
  approvedAmount: number;
  installmentCount: number;
  installmentAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  overdueAmount: number;
  repaymentMethod: LoanRepaymentMethod;
  repaymentStartDate: string;
  nextDueDate: string;
  requestDate: string;
  approvedAt?: string;
  disbursedAt?: string;
  reviewedBy?: string;
  purpose: string;
  note: string;
};

export type LoanRepaymentTrendPoint = {
  month: string;
  scheduled: number;
  collected: number;
  overdue: number;
};
