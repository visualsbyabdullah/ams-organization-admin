import type { EmployeeLoanType } from "@/types/loan";

export type LoanPolicyStatus = "active" | "draft" | "archived";

export type LoanPolicyScope = "organization" | "branch";

export type LoanInterestMode = "interest_free" | "flat_rate" | "reducing_balance";

export type LoanApprovalMode = "manager_finance_admin" | "finance_admin" | "admin_only";

export type LoanPolicy = {
  id: string;
  name: string;
  scope: LoanPolicyScope;
  branchId?: string;
  branchName?: string;
  status: LoanPolicyStatus;
  enabledLoanTypes: EmployeeLoanType[];
  minimumServiceMonths: number;
  maximumSalaryMultiple: number;
  maximumAmount: number;
  maximumInstallments: number;
  minimumInstallmentAmount: number;
  interestMode: LoanInterestMode;
  annualInterestRate: number;
  allowConcurrentLoans: boolean;
  maximumConcurrentLoans: number;
  requireGuarantorAbove: number;
  automaticPayrollDeduction: boolean;
  emergencyFastTrack: boolean;
  approvalMode: LoanApprovalMode;
  financeReviewRequired: boolean;
  adminApprovalRequired: boolean;
  updatedAt: string;
  updatedBy: string;
  note: string;
};
