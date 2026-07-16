export type EmployeeStatus =
  | "active"
  | "on_leave"
  | "probation"
  | "inactive";

export type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  branchId: string;
  branchName: string;
  status: EmployeeStatus;
  joinDate: string;
};
