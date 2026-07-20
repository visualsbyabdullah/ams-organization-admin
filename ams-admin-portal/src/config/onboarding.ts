import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  EmployeeOnboardingValues,
} from "@/validations/employee-onboarding";

export const EMPLOYEE_DRAFT_STORAGE_KEY =
  "ams-employee-onboarding-draft";

export const ONBOARDING_STEPS = [
  {
    id: "personal",
    label: "Personal details",
    shortLabel: "Personal",
    description:
      "Basic identity and contact information.",
    icon: UserRound,
    fields: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "cnic",
      "dateOfBirth",
    ],
  },
  {
    id: "employment",
    label: "Employment details",
    shortLabel: "Employment",
    description:
      "Employment type and joining information.",
    icon: BriefcaseBusiness,
    fields: [
      "employeeCode",
      "joinDate",
      "employmentType",
      "probationEndDate",
    ],
  },
  {
    id: "assignment",
    label: "Work assignment",
    shortLabel: "Assignment",
    description:
      "Branch, team, role and working schedule.",
    icon: Building2,
    fields: [
      "branchId",
      "department",
      "designation",
      "managerId",
      "shiftId",
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    shortLabel: "Payroll",
    description:
      "Salary and preferred payment details.",
    icon: BadgeDollarSign,
    fields: [
      "monthlySalary",
      "payFrequency",
      "paymentMethod",
      "bankName",
      "accountTitle",
      "accountNumber",
    ],
  },
  {
    id: "access",
    label: "Access & invitation",
    shortLabel: "Access",
    description:
      "Portal permissions and employee invitation.",
    icon: ShieldCheck,
    fields: [
      "systemRole",
      "canAccessPortal",
      "sendInvite",
    ],
  },
  {
    id: "review",
    label: "Review employee",
    shortLabel: "Review",
    description:
      "Confirm all information before creation.",
    icon: ClipboardCheck,
    fields: [],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof UserRound;
  fields: ReadonlyArray<
    keyof EmployeeOnboardingValues
  >;
}>;

export const EMPLOYMENT_TYPE_OPTIONS = [
  {
    value: "full_time",
    label: "Full-time",
  },
  {
    value: "part_time",
    label: "Part-time",
  },
  {
    value: "contract",
    label: "Contract",
  },
  {
    value: "internship",
    label: "Internship",
  },
] as const;

export const DEPARTMENT_OPTIONS = [
  "Human Resources",
  "Finance",
  "Sales",
  "Operations",
  "Marketing",
  "Support",
] as const;

export const DESIGNATION_OPTIONS = [
  "HR Manager",
  "HR Officer",
  "Payroll Officer",
  "Sales Executive",
  "Branch Manager",
  "Operations Officer",
  "Content Executive",
  "Support Executive",
] as const;

export const MANAGER_OPTIONS = [
  {
    value: "",
    label: "No reporting manager",
  },
  {
    value: "emp-001",
    label: "Ayesha Khan",
  },
  {
    value: "emp-004",
    label: "Bilal Raza",
  },
] as const;

export const SHIFT_OPTIONS = [
  {
    value: "general",
    label:
      "General — 9:00 AM to 6:00 PM",
  },
  {
    value: "morning",
    label:
      "Morning — 7:00 AM to 4:00 PM",
  },
  {
    value: "evening",
    label:
      "Evening — 2:00 PM to 11:00 PM",
  },
  {
    value: "flexible",
    label: "Flexible shift",
  },
] as const;

export const PAY_FREQUENCY_OPTIONS = [
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "biweekly",
    label: "Every two weeks",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  {
    value: "bank_transfer",
    label: "Bank transfer",
  },
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "cheque",
    label: "Cheque",
  },
] as const;

export const SYSTEM_ROLE_OPTIONS = [
  {
    value: "employee",
    label: "Employee",
  },
  {
    value: "line_manager",
    label: "Line Manager",
  },
  {
    value: "branch_manager",
    label: "Branch Manager",
  },
  {
    value: "hr_admin",
    label: "HR Admin",
  },
  {
    value: "payroll_manager",
    label: "Payroll Manager",
  },
  {
    value: "organization_admin",
    label: "Organization Admin",
  },
] as const;

export const ONBOARDING_DEFAULT_VALUES: EmployeeOnboardingValues =
  {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cnic: "",
    dateOfBirth: "",

    employeeCode: "",
    joinDate: "",
    employmentType: "full_time",
    probationEndDate: "",

    branchId: "",
    department: "",
    designation: "",
    managerId: "",
    shiftId: "general",

    monthlySalary: "",
    payFrequency: "monthly",
    paymentMethod:
      "bank_transfer",
    bankName: "",
    accountTitle: "",
    accountNumber: "",

    systemRole: "employee",
    canAccessPortal: true,
    sendInvite: true,
  };
