import type {
  BranchStructureSummary,
  Department,
  Designation,
} from "@/types/organization-structure";

export const DEPARTMENTS: Department[] = [
  {
    id: "dept-hr",
    name: "Human Resources",
    code: "HR",
    description:
      "Employee operations, hiring and workplace policies.",
    headEmployeeId: "emp-001",
    branchCounts: {
      islamabad: 8,
      lahore: 5,
      karachi: 4,
    },
    status: "active",
  },
  {
    id: "dept-finance",
    name: "Finance",
    code: "FIN",
    description:
      "Payroll, financial controls and reporting.",
    headEmployeeId: "emp-003",
    branchCounts: {
      islamabad: 6,
      lahore: 5,
      karachi: 4,
    },
    status: "active",
  },
  {
    id: "dept-sales",
    name: "Sales",
    code: "SLS",
    description:
      "Revenue operations and customer acquisition.",
    headEmployeeId: "emp-002",
    branchCounts: {
      islamabad: 12,
      lahore: 18,
      karachi: 15,
    },
    status: "active",
  },
  {
    id: "dept-operations",
    name: "Operations",
    code: "OPS",
    description:
      "Daily branch operations and service delivery.",
    headEmployeeId: "emp-004",
    branchCounts: {
      islamabad: 20,
      lahore: 16,
      karachi: 14,
    },
    status: "active",
  },
  {
    id: "dept-marketing",
    name: "Marketing",
    code: "MKT",
    description:
      "Brand, communications and campaign management.",
    headEmployeeId: "emp-005",
    branchCounts: {
      islamabad: 8,
      lahore: 7,
      karachi: 6,
    },
    status: "active",
  },
  {
    id: "dept-support",
    name: "Customer Support",
    code: "SUP",
    description:
      "Customer assistance and issue resolution.",
    branchCounts: {
      islamabad: 10,
      lahore: 8,
      karachi: 9,
    },
    status: "active",
  },
  {
    id: "dept-technology",
    name: "Technology",
    code: "TECH",
    description:
      "Product engineering and technical operations.",
    branchCounts: {
      islamabad: 7,
      lahore: 5,
      karachi: 6,
    },
    status: "active",
  },
];

export const DESIGNATIONS: Designation[] = [
  {
    id: "des-hr-manager",
    title: "HR Manager",
    departmentId: "dept-hr",
    level: "management",
    employeeCount: 3,
  },
  {
    id: "des-hr-officer",
    title: "HR Officer",
    departmentId: "dept-hr",
    level: "professional",
    employeeCount: 9,
  },
  {
    id: "des-payroll-officer",
    title: "Payroll Officer",
    departmentId: "dept-finance",
    level: "professional",
    employeeCount: 5,
  },
  {
    id: "des-branch-manager",
    title: "Branch Manager",
    departmentId: "dept-operations",
    level: "management",
    employeeCount: 3,
  },
  {
    id: "des-operations-officer",
    title: "Operations Officer",
    departmentId: "dept-operations",
    level: "professional",
    employeeCount: 19,
  },
  {
    id: "des-sales-executive",
    title: "Sales Executive",
    departmentId: "dept-sales",
    level: "professional",
    employeeCount: 34,
  },
  {
    id: "des-content-executive",
    title: "Content Executive",
    departmentId: "dept-marketing",
    level: "entry",
    employeeCount: 11,
  },
  {
    id: "des-support-executive",
    title: "Support Executive",
    departmentId: "dept-support",
    level: "entry",
    employeeCount: 21,
  },
];

export const BRANCH_STRUCTURE_SUMMARIES: BranchStructureSummary[] =
  [
    {
      branchId: "islamabad",
      departmentCount: 7,
      employeeCount: 71,
      managerCount: 8,
    },
    {
      branchId: "lahore",
      departmentCount: 7,
      employeeCount: 64,
      managerCount: 7,
    },
    {
      branchId: "karachi",
      departmentCount: 7,
      employeeCount: 58,
      managerCount: 7,
    },
  ];

export const UNASSIGNED_EMPLOYEE_COUNTS: Record<
  string,
  number
> = {
  all: 3,
  islamabad: 1,
  lahore: 2,
  karachi: 0,
};
