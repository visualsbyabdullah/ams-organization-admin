import type {
  CompensationHistory,
  CompensationRecord,
} from "@/types/compensation";

export const COMPENSATION_RECORDS: CompensationRecord[] =
  [
    {
      id: "compensation-001",
      employeeId: "emp-001",
      branchId: "islamabad",
      baseSalary: 180000,
      housingAllowance: 12000,
      transportAllowance: 8000,
      medicalAllowance: 5000,
      otherAllowance: 0,
      bonusTargetPercentage: 10,
      payFrequency: "monthly",
      status: "active",
      effectiveDate: "2026-01-01",
      nextReviewDate: "2027-01-01",
      lastChangeReason:
        "annual_review",
      previousBaseSalary: 165000,
      updatedAt: "2026-01-02",
      updatedBy: "Maaz",
      note:
        "Annual compensation adjustment approved for 2026.",
    },
    {
      id: "compensation-002",
      employeeId: "emp-002",
      branchId: "lahore",
      baseSalary: 120000,
      housingAllowance: 7000,
      transportAllowance: 5000,
      medicalAllowance: 3000,
      otherAllowance: 0,
      bonusTargetPercentage: 5,
      payFrequency: "monthly",
      status: "pending_review",
      effectiveDate: "2026-01-01",
      nextReviewDate: "2026-08-15",
      lastChangeReason:
        "market_adjustment",
      previousBaseSalary: 110000,
      updatedAt: "2026-07-10",
      updatedBy: "Ayesha Khan",
      note:
        "Market adjustment review is pending final approval.",
    },
    {
      id: "compensation-003",
      employeeId: "emp-003",
      branchId: "islamabad",
      baseSalary: 160000,
      housingAllowance: 10000,
      transportAllowance: 6000,
      medicalAllowance: 4000,
      otherAllowance: 0,
      bonusTargetPercentage: 8,
      payFrequency: "monthly",
      status: "active",
      effectiveDate: "2026-03-01",
      nextReviewDate: "2027-03-01",
      lastChangeReason: "promotion",
      previousBaseSalary: 140000,
      updatedAt: "2026-03-01",
      updatedBy: "Maaz",
      note:
        "Updated following promotion to senior payroll specialist.",
    },
    {
      id: "compensation-004",
      employeeId: "emp-004",
      branchId: "karachi",
      baseSalary: 145000,
      housingAllowance: 9000,
      transportAllowance: 6000,
      medicalAllowance: 3000,
      otherAllowance: 0,
      bonusTargetPercentage: 7,
      payFrequency: "monthly",
      status: "active",
      effectiveDate: "2026-02-01",
      nextReviewDate: "2027-02-01",
      lastChangeReason:
        "annual_review",
      previousBaseSalary: 132000,
      updatedAt: "2026-02-01",
      updatedBy: "Maaz",
      note: "",
    },
    {
      id: "compensation-005",
      employeeId: "emp-005",
      branchId: "lahore",
      baseSalary: 95000,
      housingAllowance: 5000,
      transportAllowance: 4000,
      medicalAllowance: 3000,
      otherAllowance: 0,
      bonusTargetPercentage: 4,
      payFrequency: "monthly",
      status: "pending_review",
      effectiveDate: "2026-01-01",
      nextReviewDate: "2026-09-01",
      lastChangeReason:
        "role_change",
      previousBaseSalary: 90000,
      updatedAt: "2026-07-12",
      updatedBy: "Ayesha Khan",
      note:
        "Role scope changed; compensation review required.",
    },
    {
      id: "compensation-006",
      employeeId: "emp-006",
      branchId: "islamabad",
      baseSalary: 90000,
      housingAllowance: 4000,
      transportAllowance: 3500,
      medicalAllowance: 2500,
      otherAllowance: 0,
      bonusTargetPercentage: 3,
      payFrequency: "monthly",
      status: "active",
      effectiveDate: "2026-04-01",
      nextReviewDate: "2026-10-01",
      lastChangeReason: "new_hire",
      previousBaseSalary: 0,
      updatedAt: "2026-04-01",
      updatedBy: "Maaz",
      note:
        "Initial employee compensation package.",
    },
  ];

export const COMPENSATION_HISTORY: CompensationHistory[] =
  [
    {
      id: "compensation-history-001",
      compensationId:
        "compensation-001",
      employeeId: "emp-001",
      previousBaseSalary: 165000,
      newBaseSalary: 180000,
      effectiveDate: "2026-01-01",
      reason: "annual_review",
      approvedBy: "Maaz",
      note:
        "Annual compensation review.",
    },
    {
      id: "compensation-history-002",
      compensationId:
        "compensation-002",
      employeeId: "emp-002",
      previousBaseSalary: 110000,
      newBaseSalary: 120000,
      effectiveDate: "2026-01-01",
      reason:
        "market_adjustment",
      approvedBy: "Ayesha Khan",
      note:
        "Market alignment adjustment.",
    },
    {
      id: "compensation-history-003",
      compensationId:
        "compensation-003",
      employeeId: "emp-003",
      previousBaseSalary: 140000,
      newBaseSalary: 160000,
      effectiveDate: "2026-03-01",
      reason: "promotion",
      approvedBy: "Maaz",
      note:
        "Promotion compensation change.",
    },
    {
      id: "compensation-history-004",
      compensationId:
        "compensation-004",
      employeeId: "emp-004",
      previousBaseSalary: 132000,
      newBaseSalary: 145000,
      effectiveDate: "2026-02-01",
      reason: "annual_review",
      approvedBy: "Maaz",
      note:
        "Annual salary review.",
    },
  ];
