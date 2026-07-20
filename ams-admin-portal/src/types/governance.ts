export type GovernanceSection =
  "overview" | "requests" | "recovery" | "notifications" | "policy";

export type GovernanceRole =
  | "line_manager"
  | "hr_admin"
  | "branch_admin"
  | "organization_admin"
  | "organization_head";

export type GovernanceModule =
  | "people"
  | "attendance"
  | "leave"
  | "documents"
  | "training"
  | "support"
  | "branches"
  | "policies"
  | "reports"
  | "settings"
  | "performance"
  | "payroll"
  | "loans"
  | "invoices";

export type DeletionMode = "recoverable" | "archive_only" | "void_or_reverse";

export type DeletionRequestStatus = "pending" | "approved" | "rejected";

export type DeletionRequest = {
  id: string;
  module: GovernanceModule;
  deletionMode: DeletionMode;
  entityId: string;
  entityName: string;
  branchId?: string;
  branchName?: string;
  requesterName: string;
  requesterRole: GovernanceRole;
  reason: string;
  status: DeletionRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewReason?: string;
  hiddenFromNormalLists: boolean;
};

export type RecoveryRecord = {
  id: string;
  requestId: string;
  module: GovernanceModule;
  entityId: string;
  entityName: string;
  branchId?: string;
  branchName?: string;
  deletedAt: string;
  deletedBy: string;
  deletedByRole: GovernanceRole;
  approvedBy: string;
  deletionReason: string;
  retentionUntil: string;
};

export type GovernanceNotification = {
  id: string;
  title: string;
  message: string;
  entityName: string;
  branchName?: string;
  inAppStatus: "unread" | "read";
  emailStatus: "queued" | "sent" | "failed";
  createdAt: string;
};

export type GovernanceAuditEntry = {
  id: string;
  entityName: string;
  action: string;
  actorName: string;
  actorRole: GovernanceRole;
  createdAt: string;
};

export type GovernanceState = {
  requests: DeletionRequest[];
  recovery: RecoveryRecord[];
  notifications: GovernanceNotification[];
  audit: GovernanceAuditEntry[];
};
