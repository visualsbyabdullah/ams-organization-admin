export type DepartmentStatus =
  | "active"
  | "inactive";

export type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  headEmployeeId?: string;
  branchCounts: Record<string, number>;
  status: DepartmentStatus;
};

export type DesignationLevel =
  | "leadership"
  | "management"
  | "professional"
  | "entry";

export type Designation = {
  id: string;
  title: string;
  departmentId: string;
  level: DesignationLevel;
  employeeCount: number;
};

export type BranchStructureSummary = {
  branchId: string;
  departmentCount: number;
  employeeCount: number;
  managerCount: number;
};
