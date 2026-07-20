import type { GovernanceState } from "@/types/governance";

function daysAgo(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString();
}

function daysFromNow(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString();
}

export const GOVERNANCE_INITIAL_STATE: GovernanceState = {
  requests: [
    {
      id: "request-employee-ali",
      module: "people",
      deletionMode: "recoverable",
      entityId: "EMP-0194",
      entityName: "Ali Raza",
      branchId: "islamabad",
      branchName: "Islamabad Branch",
      requesterName: "Usman Malik",
      requesterRole: "line_manager",
      reason: "Duplicate employee profile created during onboarding.",
      status: "pending",
      requestedAt: daysAgo(1),
      hiddenFromNormalLists: false,
    },
    {
      id: "request-payroll-june",
      module: "payroll",
      deletionMode: "void_or_reverse",
      entityId: "PAY-JUN-2026",
      entityName: "June 2026 Payroll Run",
      requesterName: "Bilal Raza",
      requesterRole: "branch_admin",
      reason: "The run was created with the wrong payroll period.",
      status: "pending",
      requestedAt: daysAgo(1),
      hiddenFromNormalLists: false,
    },
  ],
  recovery: [
    {
      id: "recovery-document",
      requestId: "request-document",
      module: "documents",
      entityId: "DOC-8821",
      entityName: "Employee Identity Document",
      branchId: "karachi",
      branchName: "Karachi Branch",
      deletedAt: daysAgo(22),
      deletedBy: "Sara Ahmed",
      deletedByRole: "hr_admin",
      approvedBy: "Maaz",
      deletionReason: "Expired duplicate scan replaced by a verified document.",
      retentionUntil: daysFromNow(68),
    },
    {
      id: "recovery-report",
      requestId: "request-report",
      module: "reports",
      entityId: "REPORT-OLD-ATT",
      entityName: "Legacy Attendance Export",
      branchId: "islamabad",
      branchName: "Islamabad Branch",
      deletedAt: daysAgo(84),
      deletedBy: "Ayesha Khan",
      deletedByRole: "hr_admin",
      approvedBy: "Maaz",
      deletionReason: "A newer attendance report replaced this definition.",
      retentionUntil: daysFromNow(6),
    },
    {
      id: "recovery-policy",
      requestId: "request-policy",
      module: "policies",
      entityId: "POL-LEAVE-2019",
      entityName: "Legacy Leave Carryover Policy",
      deletedAt: daysAgo(104),
      deletedBy: "Usman Malik",
      deletedByRole: "line_manager",
      approvedBy: "Maaz",
      deletionReason: "The policy was superseded.",
      retentionUntil: daysAgo(14),
    },
  ],
  notifications: [
    {
      id: "notification-request",
      title: "New deletion request",
      message: "Usman Malik requested deletion of Ali Raza.",
      entityName: "Ali Raza",
      branchName: "Islamabad Branch",
      inAppStatus: "unread",
      emailStatus: "queued",
      createdAt: daysAgo(1),
    },
    {
      id: "notification-expiry",
      title: "Recovery retention expires soon",
      message: "Legacy Attendance Export expires in 6 days.",
      entityName: "Legacy Attendance Export",
      branchName: "Islamabad Branch",
      inAppStatus: "unread",
      emailStatus: "sent",
      createdAt: daysAgo(1),
    },
  ],
  audit: [
    {
      id: "audit-request",
      entityName: "Ali Raza",
      action: "Deletion request created",
      actorName: "Usman Malik",
      actorRole: "line_manager",
      createdAt: daysAgo(1),
    },
    {
      id: "audit-hidden",
      entityName: "Legacy Leave Carryover Policy",
      action: "Record hidden after approval",
      actorName: "Maaz",
      actorRole: "organization_admin",
      createdAt: daysAgo(104),
    },
  ],
};
