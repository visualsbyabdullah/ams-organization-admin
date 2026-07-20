export type PayrollRunStatus =
  | "draft"
  | "processing"
  | "pending_approval"
  | "approved"
  | "paid";

export type PayrollEmployeeStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "paid"
  | "on_hold";

export type PayrollPaymentMethod =
  | "bank_transfer"
  | "cash"
  | "cheque";

export type PayrollRun = {
  id: string;
  period: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  branchId: string;
  branchName: string;
  status: PayrollRunStatus;
  employeeCount: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
  payDate: string;
  createdAt: string;
  createdBy: string;
  note: string;
};

export type PayrollEmployeeRecord = {
  id: string;
  employeeId: string;
  branchId: string;
  period: string;
  baseSalary: number;
  allowances: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  tax: number;
  netPay: number;
  paymentMethod: PayrollPaymentMethod;
  status: PayrollEmployeeStatus;
  note: string;
};

export type PayrollTrendPoint = {
  month: string;
  gross: number;
  deductions: number;
  net: number;
};

export type PayrollCostPoint = {
  name: string;
  value: number;
  color: string;
};
