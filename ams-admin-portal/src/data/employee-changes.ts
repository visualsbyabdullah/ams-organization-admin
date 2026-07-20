import type { EmployeeChange } from "@/types/employee-change";

export const EMPLOYEE_CHANGES: EmployeeChange[] = [
  {
    id: "change-001",
    employeeId: "emp-002",
    branchId: "lahore",
    type: "promotion",
    fromValue: "Sales Executive",
    toValue: "Senior Sales Executive",
    effectiveDate: "2026-08-01",
    requestedBy: "Ayesha Khan",
    requestedAt: "2026-07-14",
    reason:
      "Consistent performance and successful completion of the annual review cycle.",
    status: "pending",
    approvals: [
      {
        label: "Line manager review",
        status: "completed",
        actor: "Bilal Raza",
        date: "2026-07-14",
      },
      {
        label: "HR approval",
        status: "pending",
      },
    ],
  },
  {
    id: "change-002",
    employeeId: "emp-005",
    branchId: "lahore",
    type: "department_change",
    fromValue: "Marketing",
    toValue: "Sales",
    effectiveDate: "2026-08-05",
    requestedBy: "Bilal Raza",
    requestedAt: "2026-07-12",
    reason:
      "Employee requested an internal transfer aligned with her current responsibilities.",
    status: "approved",
    approvals: [
      {
        label: "Current department approval",
        status: "completed",
        actor: "Marketing Manager",
        date: "2026-07-12",
      },
      {
        label: "Receiving department approval",
        status: "completed",
        actor: "Sales Manager",
        date: "2026-07-13",
      },
      {
        label: "HR approval",
        status: "completed",
        actor: "Ayesha Khan",
        date: "2026-07-14",
      },
    ],
  },
  {
    id: "change-003",
    employeeId: "emp-003",
    branchId: "islamabad",
    type: "salary_adjustment",
    fromValue: "PKR 95,000",
    toValue: "PKR 110,000",
    effectiveDate: "2026-08-01",
    requestedBy: "Maaz",
    requestedAt: "2026-07-10",
    reason:
      "Annual compensation adjustment based on performance and expanded responsibilities.",
    status: "scheduled",
    approvals: [
      {
        label: "Department approval",
        status: "completed",
        actor: "Finance Manager",
        date: "2026-07-10",
      },
      {
        label: "Organization approval",
        status: "completed",
        actor: "Maaz",
        date: "2026-07-11",
      },
    ],
  },
  {
    id: "change-004",
    employeeId: "emp-006",
    branchId: "islamabad",
    type: "status_change",
    fromValue: "Active",
    toValue: "Inactive",
    effectiveDate: "2026-07-12",
    requestedBy: "Ayesha Khan",
    requestedAt: "2026-07-09",
    reason:
      "Employment ended after completion of the notice period.",
    status: "completed",
    approvals: [
      {
        label: "HR review",
        status: "completed",
        actor: "Ayesha Khan",
        date: "2026-07-09",
      },
      {
        label: "Final approval",
        status: "completed",
        actor: "Maaz",
        date: "2026-07-10",
      },
    ],
  },
  {
    id: "change-005",
    employeeId: "emp-004",
    branchId: "karachi",
    type: "manager_change",
    fromValue: "Regional Operations Head",
    toValue: "Chief Operations Officer",
    effectiveDate: "2026-08-10",
    requestedBy: "Maaz",
    requestedAt: "2026-07-15",
    reason:
      "Reporting structure updated following the operations reorganization.",
    status: "draft",
    approvals: [],
  },
];
