import { GOVERNANCE_RETENTION_DAYS } from "@/config/governance";
import type {
  DeletionRequest,
  RecoveryRecord,
} from "@/types/governance";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatGovernanceDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function daysUntil(value: string) {
  return Math.ceil(
    (new Date(value).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );
}

export function getRecoveryStatus(record: RecoveryRecord) {
  const remaining = daysUntil(record.retentionUntil);

  if (remaining <= 0) {
    return "expired" as const;
  }

  if (remaining <= 7) {
    return "expiring" as const;
  }

  return "recoverable" as const;
}

export function createRecoveryRecord(
  request: DeletionRequest,
  approvedBy: string,
): RecoveryRecord {
  const deletedAt = new Date();
  const retentionUntil = new Date(deletedAt);
  retentionUntil.setDate(
    retentionUntil.getDate() + GOVERNANCE_RETENTION_DAYS,
  );

  return {
    id: crypto.randomUUID(),
    requestId: request.id,
    module: request.module,
    entityId: request.entityId,
    entityName: request.entityName,
    branchId: request.branchId,
    branchName: request.branchName,
    deletedAt: deletedAt.toISOString(),
    deletedBy: request.requesterName,
    deletedByRole: request.requesterRole,
    approvedBy,
    deletionReason: request.reason,
    retentionUntil: retentionUntil.toISOString(),
  };
}

export function recordIsInScope(
  record: { branchId?: string },
  selectedBranchId: string,
) {
  return (
    selectedBranchId === "all" ||
    !record.branchId ||
    record.branchId === selectedBranchId
  );
}
