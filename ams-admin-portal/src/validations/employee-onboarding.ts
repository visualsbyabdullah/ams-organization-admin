import { z } from "zod";

const optionalCnicSchema = z.union([
  z.literal(""),
  z.string().regex(/^\d{5}-\d{7}-\d$/, "Use CNIC format 12345-1234567-1"),
]);

export const employeeOnboardingSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),

  lastName: z.string().trim().min(2, "Last name is required"),

  email: z.string().trim().email("Enter a valid email address"),

  phone: z.string().trim().min(10, "Enter a valid phone number"),

  cnic: optionalCnicSchema,

  dateOfBirth: z.string(),

  employeeCode: z.string().trim().min(1, "Employee ID is required"),

  joinDate: z.string().min(1, "Joining date is required"),

  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]),

  probationEndDate: z.string(),

  branchId: z.string().min(1, "Select an employee branch"),

  department: z.string().min(1, "Select a department"),

  designation: z.string().min(1, "Select a designation"),

  managerId: z.string(),

  shiftId: z.string().min(1, "Select a work shift"),

  monthlySalary: z
    .string()
    .min(1, "Monthly salary is required")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "Enter a valid salary",
    ),

  payFrequency: z.enum(["monthly", "biweekly", "weekly"]),

  paymentMethod: z.enum(["bank_transfer", "cash", "cheque"]),

  bankName: z.string(),

  accountTitle: z.string(),

  accountNumber: z.string(),

  systemRole: z.enum([
    "employee",
    "line_manager",
    "branch_manager",
    "hr_admin",
    "payroll_manager",
    "organization_admin",
  ]),

  canAccessPortal: z.boolean(),

  sendInvite: z.boolean(),
});

export type EmployeeOnboardingValues = z.infer<typeof employeeOnboardingSchema>;
