"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { FormField } from "@/components/forms/form-field";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  GOVERNANCE_COPY,
  GOVERNANCE_MODULE_CONFIG,
  GOVERNANCE_RECOVERY_STATUS,
  GOVERNANCE_REQUEST_STATUS,
  GOVERNANCE_ROLE_CONFIG,
  GOVERNANCE_SECTIONS,
} from "@/config/governance";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { GOVERNANCE_INITIAL_STATE } from "@/data/governance";
import {
  createRecoveryRecord,
  daysUntil,
  formatGovernanceDateTime,
  getRecoveryStatus,
  recordIsInScope,
} from "@/lib/governance";
import type {
  DeletionRequest,
  GovernanceModule,
  GovernanceNotification,
  GovernanceRole,
  GovernanceSection,
  GovernanceState,
  RecoveryRecord,
} from "@/types/governance";

const STORAGE_KEY = "ams-governance-state-v1";

export function GovernanceWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [section, setSection] = useState<GovernanceSection>("overview");
  const [state, setState] = useState<GovernanceState>(GOVERNANCE_INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const requestSelection = useEntitySelection(state.requests, (item) => item.id);
  const recoverySelection = useEntitySelection(state.recovery, (item) => item.id);
  const notificationSelection = useEntitySelection(
    state.notifications,
    (item) => item.id,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmReason, setConfirmReason] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setState(JSON.parse(saved) as GovernanceState);
      } catch {
        setState(GOVERNANCE_INITIAL_STATE);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const requests = useMemo(
    () => state.requests.filter((item) => recordIsInScope(item, selectedBranchId)),
    [selectedBranchId, state.requests],
  );

  const recovery = useMemo(
    () => state.recovery.filter((item) => recordIsInScope(item, selectedBranchId)),
    [selectedBranchId, state.recovery],
  );

  const notifications = useMemo(
    () =>
      state.notifications.filter(
        (item) =>
          selectedBranchId === "all" ||
          !item.branchName ||
          item.branchName === selectedBranch.name,
      ),
    [selectedBranch.name, selectedBranchId, state.notifications],
  );

  const selectedRequest = requestSelection.selected;
  const selectedRecovery = recoverySelection.selected;
  const selectedNotification = notificationSelection.selected;

  const normalizedQuery = query.trim().toLowerCase();

  const visibleRequests = requests.filter(
    (item) =>
      [item.entityName, item.entityId, item.requesterName, item.branchName, item.reason]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery) &&
      (moduleFilter === "all" || item.module === moduleFilter) &&
      (statusFilter === "all" || item.status === statusFilter),
  );

  const visibleRecovery = recovery.filter((item) => {
    const status = getRecoveryStatus(item);

    return (
      [
        item.entityName,
        item.entityId,
        item.deletedBy,
        item.branchName,
        item.deletionReason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery) &&
      (moduleFilter === "all" || item.module === moduleFilter) &&
      (statusFilter === "all" || status === statusFilter)
    );
  });

  const visibleNotifications = notifications.filter(
    (item) =>
      [item.title, item.message, item.entityName, item.branchName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery) &&
      (statusFilter === "all" || item.inAppStatus === statusFilter),
  );

  const pendingCount = requests.filter((item) => item.status === "pending").length;
  const expiredCount = recovery.filter(
    (item) => getRecoveryStatus(item) === "expired",
  ).length;
  const unreadCount = notifications.filter(
    (item) => item.inAppStatus === "unread",
  ).length;

  const metrics = [
    {
      label: "Pending requests",
      value: String(pendingCount),
      detail: selectedBranch.name,
      icon: ShieldCheck,
      tone: "warning" as const,
    },
    {
      label: "Recoverable records",
      value: String(recovery.length - expiredCount),
      detail: "Within 90-day retention",
      icon: RotateCcw,
      tone: "success" as const,
    },
    {
      label: "Expired records",
      value: String(expiredCount),
      detail: "Awaiting manual deletion",
      icon: Clock3,
      tone: "danger" as const,
    },
    {
      label: "Unread notifications",
      value: String(unreadCount),
      detail: "In-app and email events",
      icon: Bell,
      tone: "info" as const,
    },
  ];

  const requestColumns: DataTableColumn<DeletionRequest>[] = [
    {
      id: "record",
      header: "Record",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.entityName}</p>
          <p className="mt-1 text-xs text-text-muted">
            {item.entityId} Â· {item.branchName ?? "Organization"}
          </p>
        </div>
      ),
    },
    {
      id: "module",
      header: "Module",
      cell: (item) => (
        <Badge variant="info">{GOVERNANCE_MODULE_CONFIG[item.module].label}</Badge>
      ),
    },
    {
      id: "requester",
      header: "Requested by",
      cell: (item) => (
        <div>
          <p className="font-medium">{item.requesterName}</p>
          <p className="mt-1 text-xs text-text-muted">
            {GOVERNANCE_ROLE_CONFIG[item.requesterRole].label}
          </p>
        </div>
      ),
    },
    {
      id: "requested",
      header: "Requested",
      cell: (item) => formatGovernanceDateTime(item.requestedAt),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => (
        <Badge variant={GOVERNANCE_REQUEST_STATUS[item.status].badgeVariant}>
          {GOVERNANCE_REQUEST_STATUS[item.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${item.entityName}`}
          onClick={(event) => {
            event.stopPropagation();
            requestSelection.select(item.id);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];

  const recoveryColumns: DataTableColumn<RecoveryRecord>[] = [
    {
      id: "record",
      header: "Hidden record",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.entityName}</p>
          <p className="mt-1 text-xs text-text-muted">
            {item.entityId} Â· {item.branchName ?? "Organization"}
          </p>
        </div>
      ),
    },
    {
      id: "module",
      header: "Module",
      cell: (item) => (
        <Badge variant="info">{GOVERNANCE_MODULE_CONFIG[item.module].label}</Badge>
      ),
    },
    {
      id: "deletedBy",
      header: "Deleted by",
      cell: (item) => (
        <div>
          <p className="font-medium">{item.deletedBy}</p>
          <p className="mt-1 text-xs text-text-muted">
            {GOVERNANCE_ROLE_CONFIG[item.deletedByRole].label}
          </p>
        </div>
      ),
    },
    {
      id: "retention",
      header: "Retention",
      cell: (item) => {
        const remaining = daysUntil(item.retentionUntil);
        return remaining > 0 ? `${remaining} days remaining` : "Retention expired";
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => {
        const status = getRecoveryStatus(item);
        return (
          <Badge variant={GOVERNANCE_RECOVERY_STATUS[status].badgeVariant}>
            {GOVERNANCE_RECOVERY_STATUS[status].label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${item.entityName}`}
          onClick={(event) => {
            event.stopPropagation();
            recoverySelection.select(item.id);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];

  const notificationColumns: DataTableColumn<GovernanceNotification>[] = [
    {
      id: "notification",
      header: "Notification",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="mt-1 text-xs text-text-muted">{item.message}</p>
        </div>
      ),
    },
    {
      id: "record",
      header: "Record",
      cell: (item) => item.entityName,
    },
    {
      id: "email",
      header: "Email",
      cell: (item) => (
        <Badge
          variant={
            item.emailStatus === "sent"
              ? "success"
              : item.emailStatus === "queued"
                ? "warning"
                : "danger"
          }
        >
          {item.emailStatus}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "In-app",
      cell: (item) => (
        <Badge variant={item.inAppStatus === "unread" ? "info" : "neutral"}>
          {item.inAppStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open notification ${item.title}`}
          onClick={(event) => {
            event.stopPropagation();
            notificationSelection.select(item.id);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];

  function addNotification(
    title: string,
    message: string,
    entityName: string,
    branchName?: string,
  ) {
    return {
      id: crypto.randomUUID(),
      title,
      message,
      entityName,
      branchName,
      inAppStatus: "unread" as const,
      emailStatus: "queued" as const,
      createdAt: new Date().toISOString(),
    };
  }

  function approveRequest() {
    if (!selectedRequest || selectedRequest.status !== "pending") {
      return;
    }

    const recoverable =
      GOVERNANCE_MODULE_CONFIG[selectedRequest.module].mode === "recoverable";

    const recoveryRecord = recoverable
      ? createRecoveryRecord(selectedRequest, CURRENT_ADMIN.name)
      : null;

    setState((current) => ({
      ...current,
      requests: current.requests.map((item) =>
        item.id === selectedRequest.id
          ? {
              ...item,
              status: "approved",
              reviewedAt: new Date().toISOString(),
              reviewedBy: CURRENT_ADMIN.name,
              reviewReason,
              hiddenFromNormalLists: recoverable,
            }
          : item,
      ),
      recovery: recoveryRecord ? [recoveryRecord, ...current.recovery] : current.recovery,
      notifications: [
        addNotification(
          recoverable ? "Deletion request approved" : "Protected action approved",
          recoverable
            ? `${selectedRequest.entityName} is hidden and available in Recovery Center for 90 days.`
            : `${selectedRequest.entityName} will use archive, void or reversal instead of hard deletion.`,
          selectedRequest.entityName,
          selectedRequest.branchName,
        ),
        ...current.notifications,
      ],
      audit: [
        {
          id: crypto.randomUUID(),
          entityName: selectedRequest.entityName,
          action: recoverable ? "Approved and hidden" : "Protected action approved",
          actorName: CURRENT_ADMIN.name,
          actorRole: "organization_admin",
          createdAt: new Date().toISOString(),
        },
        ...current.audit,
      ],
    }));

    setReviewReason("");
    requestSelection.clear();
  }

  function rejectRequest() {
    if (
      !selectedRequest ||
      selectedRequest.status !== "pending" ||
      !reviewReason.trim()
    ) {
      return;
    }

    setState((current) => ({
      ...current,
      requests: current.requests.map((item) =>
        item.id === selectedRequest.id
          ? {
              ...item,
              status: "rejected",
              reviewedAt: new Date().toISOString(),
              reviewedBy: CURRENT_ADMIN.name,
              reviewReason,
              hiddenFromNormalLists: false,
            }
          : item,
      ),
      notifications: [
        addNotification(
          "Deletion request rejected",
          `${selectedRequest.entityName} remains visible. ${reviewReason}`,
          selectedRequest.entityName,
          selectedRequest.branchName,
        ),
        ...current.notifications,
      ],
      audit: [
        {
          id: crypto.randomUUID(),
          entityName: selectedRequest.entityName,
          action: "Deletion request rejected",
          actorName: CURRENT_ADMIN.name,
          actorRole: "organization_admin",
          createdAt: new Date().toISOString(),
        },
        ...current.audit,
      ],
    }));

    setReviewReason("");
    requestSelection.clear();
  }

  function restoreRecord() {
    if (!selectedRecovery) {
      return;
    }

    setState((current) => ({
      ...current,
      recovery: current.recovery.filter((item) => item.id !== selectedRecovery.id),
      notifications: [
        addNotification(
          "Record restored",
          `${selectedRecovery.entityName} is visible again in its original module.`,
          selectedRecovery.entityName,
          selectedRecovery.branchName,
        ),
        ...current.notifications,
      ],
      audit: [
        {
          id: crypto.randomUUID(),
          entityName: selectedRecovery.entityName,
          action: "Record restored",
          actorName: CURRENT_ADMIN.name,
          actorRole: "organization_admin",
          createdAt: new Date().toISOString(),
        },
        ...current.audit,
      ],
    }));

    recoverySelection.clear();
  }

  function permanentlyDeleteRecord() {
    if (
      !selectedRecovery ||
      getRecoveryStatus(selectedRecovery) !== "expired" ||
      confirmPhrase !== GOVERNANCE_COPY.permanentPhrase ||
      !confirmReason.trim() ||
      !/^\\d{6}$/.test(mfaCode)
    ) {
      return;
    }

    setState((current) => ({
      ...current,
      recovery: current.recovery.filter((item) => item.id !== selectedRecovery.id),
      notifications: [
        addNotification(
          "Permanent deletion confirmed",
          `${selectedRecovery.entityName} was permanently deleted after manual confirmation.`,
          selectedRecovery.entityName,
          selectedRecovery.branchName,
        ),
        ...current.notifications,
      ],
      audit: [
        {
          id: crypto.randomUUID(),
          entityName: selectedRecovery.entityName,
          action: "Permanently deleted after retention expiry",
          actorName: CURRENT_ADMIN.name,
          actorRole: "organization_admin",
          createdAt: new Date().toISOString(),
        },
        ...current.audit,
      ],
    }));

    recoverySelection.clear();
    resetConfirmation();
  }

  function resetConfirmation() {
    setConfirmOpen(false);
    setConfirmReason("");
    setConfirmPhrase("");
    setMfaCode("");
  }

  const sectionTitle =
    section === "overview"
      ? "Governance overview"
      : section === "requests"
        ? "Deletion requests"
        : section === "recovery"
          ? "Recovery Center"
          : section === "notifications"
            ? "Governance notifications"
            : "Deletion & recovery policy";

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={GOVERNANCE_COPY.eyebrow}
        title={sectionTitle}
        description={GOVERNANCE_COPY.description}
        actions={
          section === "requests" ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              {GOVERNANCE_COPY.createRequest}
            </Button>
          ) : undefined
        }
      />

      <div className="mt-7 overflow-x-auto border-b border-border">
        <div className="flex min-w-max gap-1">
          {GOVERNANCE_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSection(item.id);
                setQuery("");
                setModuleFilter("all");
                setStatusFilter("all");
              }}
              className={
                section === item.id
                  ? "border-b-2 border-primary px-4 py-3 text-sm font-semibold text-primary"
                  : "border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-text-muted transition hover:text-text"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {section === "overview" && (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <PolicyCard />
          <Card className="overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-bold">Recent activity</h2>
            </div>
            <div className="space-y-3 p-5" data-governance-recent-activity-cards="true">
              {state.audit.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-control border border-border p-4">
                  <p className="font-semibold">{item.entityName}</p>
                  <p className="mt-1 text-sm text-text-muted">{item.action}</p>
                  <p className="mt-2 text-xs text-text-muted">
                    {item.actorName} Â· {GOVERNANCE_ROLE_CONFIG[item.actorRole].label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {section === "requests" && (
        <Card className="mt-6 overflow-hidden">
          <TableFilters
            query={query}
            setQuery={setQuery}
            moduleFilter={moduleFilter}
            setModuleFilter={setModuleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statuses={[
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
            ]}
          />
          <DataTable
            rows={visibleRequests}
            columns={requestColumns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => requestSelection.select(item.id)}
            emptyState={<EmptyState />}
          />
        </Card>
      )}

      {section === "recovery" && (
        <Card className="mt-6 overflow-hidden">
          <TableFilters
            query={query}
            setQuery={setQuery}
            moduleFilter={moduleFilter}
            setModuleFilter={setModuleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statuses={[
              ["recoverable", "Recoverable"],
              ["expiring", "Expiring soon"],
              ["expired", "Expired"],
            ]}
          />
          <DataTable
            rows={visibleRecovery}
            columns={recoveryColumns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => recoverySelection.select(item.id)}
            emptyState={<EmptyState />}
          />
        </Card>
      )}

      {section === "notifications" && (
        <Card className="mt-6 overflow-hidden">
          <TableFilters
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statuses={[
              ["unread", "Unread"],
              ["read", "Read"],
            ]}
          />
          <DataTable
            rows={visibleNotifications}
            columns={notificationColumns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => notificationSelection.select(item.id)}
            emptyState={<EmptyState />}
          />
        </Card>
      )}

      {section === "policy" && <PolicyWorkspace />}

      <Drawer
        open={Boolean(selectedRequest)}
        onClose={() => {
          requestSelection.clear();
          setReviewReason("");
        }}
        title="Deletion request"
        description={selectedRequest?.entityName}
        footer={
          selectedRequest?.status === "pending" ? (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={rejectRequest}
                disabled={!reviewReason.trim()}
              >
                Reject request
              </Button>
              <Button onClick={approveRequest}>
                <CheckCircle2 />
                Approve request
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedRequest && (
          <RequestDetails
            request={selectedRequest}
            reviewReason={reviewReason}
            setReviewReason={setReviewReason}
          />
        )}
      </Drawer>

      <Drawer
        open={Boolean(selectedRecovery)}
        onClose={() => {
          recoverySelection.clear();
          resetConfirmation();
        }}
        title="Recovery record"
        description={selectedRecovery?.entityName}
        footer={
          selectedRecovery ? (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={restoreRecord}>
                <RotateCcw />
                Restore record
              </Button>
              {getRecoveryStatus(selectedRecovery) === "expired" && (
                <Button onClick={() => setConfirmOpen(true)}>
                  <Trash2 />
                  Permanently delete
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRecovery && (
          <RecoveryDetails
            record={selectedRecovery}
            confirmOpen={confirmOpen}
            confirmReason={confirmReason}
            setConfirmReason={setConfirmReason}
            confirmPhrase={confirmPhrase}
            setConfirmPhrase={setConfirmPhrase}
            mfaCode={mfaCode}
            setMfaCode={setMfaCode}
            onDelete={permanentlyDeleteRecord}
          />
        )}
      </Drawer>

      <Drawer
        open={Boolean(selectedNotification)}
        onClose={() => notificationSelection.clear()}
        title="Governance notification"
        description={selectedNotification?.title}
        footer={
          selectedNotification?.inAppStatus === "unread" ? (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setState((current) => ({
                    ...current,
                    notifications: current.notifications.map((item) =>
                      item.id === selectedNotification.id
                        ? { ...item, inAppStatus: "read" }
                        : item,
                    ),
                  }));
                  notificationSelection.clear();
                }}
              >
                Mark as read
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedNotification && (
          <div className="space-y-4">
            <p className="rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
              {selectedNotification.message}
            </p>
            <InfoRow label="Record" value={selectedNotification.entityName} />
            <InfoRow
              label="Branch"
              value={selectedNotification.branchName ?? "Organization"}
            />
            <InfoRow label="Email status" value={selectedNotification.emailStatus} />
            <InfoRow
              label="Created"
              value={formatGovernanceDateTime(selectedNotification.createdAt)}
            />
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create deletion request"
        description="Delegated roles submit requests and cannot directly delete records."
      >
        <RequestForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onSubmit={(request) => {
            setState((current) => ({
              ...current,
              requests: [request, ...current.requests],
              notifications: [
                addNotification(
                  "New deletion request",
                  `${request.requesterName} requested an action for ${request.entityName}.`,
                  request.entityName,
                  request.branchName,
                ),
                ...current.notifications,
              ],
              audit: [
                {
                  id: crypto.randomUUID(),
                  entityName: request.entityName,
                  action: "Deletion request created",
                  actorName: request.requesterName,
                  actorRole: request.requesterRole,
                  createdAt: new Date().toISOString(),
                },
                ...current.audit,
              ],
            }));
            setCreateOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
}

function TableFilters({
  query,
  setQuery,
  moduleFilter,
  setModuleFilter,
  statusFilter,
  setStatusFilter,
  statuses,
}: {
  query: string;
  setQuery: (value: string) => void;
  moduleFilter?: string;
  setModuleFilter?: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statuses: [string, string][];
}) {
  return (
    <div className="border-b border-border p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search record, branch, requester or reason"
            className="pl-9"
          />
        </div>

        {setModuleFilter && (
          <Select
            value={moduleFilter ?? "all"}
            onChange={(event) => setModuleFilter(event.target.value)}
          >
            <option value="all">All modules</option>
            {Object.entries(GOVERNANCE_MODULE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        )}

        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          {statuses.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function RequestDetails({
  request,
  reviewReason,
  setReviewReason,
}: {
  request: DeletionRequest;
  reviewReason: string;
  setReviewReason: (value: string) => void;
}) {
  const config = GOVERNANCE_MODULE_CONFIG[request.module];

  return (
    <div className="space-y-5">
      <InfoRow label="Record ID" value={request.entityId} />
      <InfoRow label="Module" value={config.label} />
      <InfoRow
        label="Requested by"
        value={`${request.requesterName} Â· ${
          GOVERNANCE_ROLE_CONFIG[request.requesterRole].label
        }`}
      />
      <InfoRow
        label="Requested at"
        value={formatGovernanceDateTime(request.requestedAt)}
      />
      <InfoRow
        label="Normal-list visibility"
        value={request.hiddenFromNormalLists ? "Hidden" : "Visible until approval"}
      />

      <div className="rounded-control bg-canvas p-4">
        <p className="text-xs font-semibold text-text-muted">Reason</p>
        <p className="mt-2 text-sm leading-6">{request.reason}</p>
      </div>

      <div className="rounded-control bg-info-muted p-4">
        <p className="text-sm font-semibold text-info">{config.description}</p>
      </div>

      {request.status === "pending" && (
        <FormField
          label="Review note"
          htmlFor="governanceReviewNote"
          description="Required when rejecting."
          optional
        >
          <Textarea
            id="governanceReviewNote"
            value={reviewReason}
            onChange={(event) => setReviewReason(event.target.value)}
          />
        </FormField>
      )}
    </div>
  );
}

function RecoveryDetails({
  record,
  confirmOpen,
  confirmReason,
  setConfirmReason,
  confirmPhrase,
  setConfirmPhrase,
  mfaCode,
  setMfaCode,
  onDelete,
}: {
  record: RecoveryRecord;
  confirmOpen: boolean;
  confirmReason: string;
  setConfirmReason: (value: string) => void;
  confirmPhrase: string;
  setConfirmPhrase: (value: string) => void;
  mfaCode: string;
  setMfaCode: (value: string) => void;
  onDelete: () => void;
}) {
  const status = getRecoveryStatus(record);
  const remaining = daysUntil(record.retentionUntil);
  const valid =
    confirmPhrase === GOVERNANCE_COPY.permanentPhrase &&
    Boolean(confirmReason.trim()) &&
    /^\\d{6}$/.test(mfaCode);

  return (
    <div className="space-y-5">
      <InfoRow label="Record ID" value={record.entityId} />
      <InfoRow label="Module" value={GOVERNANCE_MODULE_CONFIG[record.module].label} />
      <InfoRow
        label="Deleted by"
        value={`${record.deletedBy} Â· ${
          GOVERNANCE_ROLE_CONFIG[record.deletedByRole].label
        }`}
      />
      <InfoRow label="Approved by" value={record.approvedBy} />
      <InfoRow
        label="Retention"
        value={
          remaining > 0
            ? `${remaining} days remaining`
            : "Expired â€” awaiting manual deletion"
        }
      />

      <div className="rounded-control bg-canvas p-4">
        <p className="text-xs font-semibold text-text-muted">Deletion reason</p>
        <p className="mt-2 text-sm leading-6">{record.deletionReason}</p>
      </div>

      {status !== "expired" && (
        <p className="rounded-control bg-warning-muted p-4 text-sm text-warning">
          Permanent deletion is blocked until the 90-day retention expires.
        </p>
      )}

      {confirmOpen && status === "expired" && (
        <div className="space-y-4 rounded-card border border-danger p-5">
          <h3 className="font-bold text-danger">Manual permanent deletion</h3>
          <p className="text-sm leading-6 text-text-muted">
            Type <strong>{GOVERNANCE_COPY.permanentPhrase}</strong>, enter a reason and a
            six-digit MFA code.
          </p>

          <Textarea
            value={confirmReason}
            onChange={(event) => setConfirmReason(event.target.value)}
            placeholder="Permanent deletion reason"
          />

          <Input
            value={confirmPhrase}
            onChange={(event) => setConfirmPhrase(event.target.value)}
            placeholder={GOVERNANCE_COPY.permanentPhrase}
          />

          <Input
            value={mfaCode}
            maxLength={6}
            inputMode="numeric"
            onChange={(event) => setMfaCode(event.target.value.replace(/\\D/g, ""))}
            placeholder="Six-digit MFA code"
          />

          <div className="flex justify-end">
            <Button onClick={onDelete} disabled={!valid}>
              <Trash2 />
              Confirm permanent deletion
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestForm({
  selectedBranchId,
  onCancel,
  onSubmit,
}: {
  selectedBranchId: string;
  onCancel: () => void;
  onSubmit: (request: DeletionRequest) => void;
}) {
  const [module, setModule] = useState<GovernanceModule>("people");
  const [entityId, setEntityId] = useState("");
  const [entityName, setEntityName] = useState("");
  const [branchId, setBranchId] = useState(
    selectedBranchId === "all" ? "" : selectedBranchId,
  );
  const [requesterName, setRequesterName] = useState(CURRENT_ADMIN.name);
  const [requesterRole, setRequesterRole] = useState<GovernanceRole>("line_manager");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid =
    entityId.trim() && entityName.trim() && requesterName.trim() && reason.trim();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!valid) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);
    const config = GOVERNANCE_MODULE_CONFIG[module];

    onSubmit({
      id: crypto.randomUUID(),
      module,
      deletionMode: config.mode,
      entityId: entityId.trim(),
      entityName: entityName.trim(),
      branchId: branchId || undefined,
      branchName: branch?.name,
      requesterName: requesterName.trim(),
      requesterRole,
      reason: reason.trim(),
      status: "pending",
      requestedAt: new Date().toISOString(),
      hiddenFromNormalLists: false,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Module" htmlFor="requestModule">
          <Select
            id="requestModule"
            value={module}
            onChange={(event) => setModule(event.target.value as GovernanceModule)}
          >
            {Object.entries(GOVERNANCE_MODULE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Branch" htmlFor="requestBranch" optional>
          <Select
            id="requestBranch"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
          >
            <option value="">Organization-wide</option>
            {BRANCH_OPTIONS.filter((item) => !item.isAggregate).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Record ID"
          htmlFor="requestEntityId"
          error={submitted && !entityId.trim() ? "Enter the record ID" : undefined}
        >
          <Input
            id="requestEntityId"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          />
        </FormField>

        <FormField
          label="Record name"
          htmlFor="requestEntityName"
          error={submitted && !entityName.trim() ? "Enter the record name" : undefined}
        >
          <Input
            id="requestEntityName"
            value={entityName}
            onChange={(event) => setEntityName(event.target.value)}
          />
        </FormField>

        <FormField label="Requester name" htmlFor="requesterName">
          <Input
            id="requesterName"
            value={requesterName}
            onChange={(event) => setRequesterName(event.target.value)}
          />
        </FormField>

        <FormField label="Requester role" htmlFor="requesterRole">
          <Select
            id="requesterRole"
            value={requesterRole}
            onChange={(event) => setRequesterRole(event.target.value as GovernanceRole)}
          >
            {(["line_manager", "hr_admin", "branch_admin"] as const).map((role) => (
              <option key={role} value={role}>
                {GOVERNANCE_ROLE_CONFIG[role].label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="rounded-control bg-info-muted p-4 text-sm text-info">
        {GOVERNANCE_MODULE_CONFIG[module].description}
      </div>

      <FormField
        label="Deletion request reason"
        htmlFor="requestReason"
        error={submitted && !reason.trim() ? "A reason is required" : undefined}
      >
        <Textarea
          id="requestReason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit request</Button>
      </div>
    </form>
  );
}

function PolicyCard() {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">Locked governance rules</h2>
      <div className="mt-5 space-y-3">
        {[
          ["Line Manager", "Request only"],
          ["HR / Branch Admin", "Request only"],
          ["Head / Organization Admin", "Approve + restore"],
          ["Retention", "90 days"],
          ["After expiry", "Manual confirmation only"],
          ["Automatic deletion", "Disabled"],
          ["Normal lists", "Hidden after approval"],
          ["Notifications", "In-app + email queue"],
        ].map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
    </Card>
  );
}

function PolicyWorkspace() {
  return (
    <div className="mt-6 space-y-6">
      <PolicyCard />
      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">Module deletion behavior</h2>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(GOVERNANCE_MODULE_CONFIG).map(([module, config]) => (
            <div
              key={module}
              className="grid gap-3 p-5 xl:grid-cols-[12rem_12rem_minmax(0,1fr)]"
            >
              <p className="font-semibold">{config.label}</p>
              <Badge variant={config.mode === "recoverable" ? "success" : "warning"}>
                {config.mode.replaceAll("_", " ")}
              </Badge>
              <p className="text-sm leading-6 text-text-muted">{config.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-control border border-border p-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <ShieldCheck className="size-8 text-text-muted" />
      <h3 className="mt-4 font-bold">No governance records found</h3>
      <p className="mt-2 text-sm text-text-muted">
        Change the filters or create a deletion request.
      </p>
    </div>
  );
}
