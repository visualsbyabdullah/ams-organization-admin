export type StatutoryEmployeeStatus =
  | "compliant"
  | "pending_review"
  | "exempt"
  | "blocked";

export type StatutoryFilingStatus =
  | "draft"
  | "ready"
  | "submitted"
  | "accepted"
  | "overdue";

export type StatutoryFilingCategory =
  | "income_tax"
  | "social_security"
  | "retirement"
  | "health"
  | "other";

export type EmployeeStatutoryRecord = {
  id: string;
  employeeId: string;
  branchId: string;
  period: string;
  taxableIncome: number;
  incomeTax: number;
  employeeSocialSecurity: number;
  employerSocialSecurity: number;
  employeeRetirement: number;
  employerRetirement: number;
  otherEmployeeDeductions: number;
  otherEmployerContributions: number;
  registrationNumber: string;
  status: StatutoryEmployeeStatus;
  note: string;
};

export type StatutoryFiling = {
  id: string;
  branchId: string;
  branchName: string;
  period: string;
  category: StatutoryFilingCategory;
  amount: number;
  dueDate: string;
  status: StatutoryFilingStatus;
  referenceNumber: string;
  createdAt: string;
  createdBy: string;
  submittedAt?: string;
  acceptedAt?: string;
  note: string;
};

export type StatutoryContributionPoint = {
  branch: string;
  employeeContribution: number;
  employerContribution: number;
};
