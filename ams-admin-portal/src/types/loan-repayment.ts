export type LoanRepaymentStatus =
  | "scheduled"
  | "due"
  | "partial"
  | "overdue"
  | "paid"
  | "waived"
  | "failed";

export type LoanRepaymentSource =
  | "payroll_deduction"
  | "bank_transfer"
  | "cash"
  | "manual_adjustment";

export type LoanRepayment = {
  id: string;
  loanId: string;
  employeeId: string;
  branchId: string;
  installmentNumber: number;
  payrollPeriod: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: LoanRepaymentStatus;
  source: LoanRepaymentSource;
  paidDate?: string;
  referenceNumber: string;
  processedBy?: string;
  note: string;
};

export type LoanRepaymentPaymentValues = {
  paidAmount: number;
  paidDate: string;
  source: LoanRepaymentSource;
  referenceNumber: string;
  note: string;
};
