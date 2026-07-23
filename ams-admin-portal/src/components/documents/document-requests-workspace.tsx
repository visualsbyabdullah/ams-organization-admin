"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSearch,
  Plus,
  Search,
  Send,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DocumentRequestDetails } from "@/components/documents/document-request-details";
import { DocumentRequestForm } from "@/components/documents/document-request-form";
import { DocumentTabs } from "@/components/documents/document-tabs";
import { createDocumentRequestColumns } from "@/components/documents/document-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { IconContainer } from "@/components/shared/icon-container";
import { PageHeader } from "@/components/shared/page-header";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DOCUMENT_ACTION_LABELS,
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_REQUEST_STATUS_CONFIG,
  DOCUMENTS_COPY,
} from "@/config/documents";
import { useBranchScope } from "@/context/branch-scope-context";
import { DOCUMENT_REQUESTS } from "@/data/documents";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import { requestIsInScope } from "@/lib/documents";
import type { DocumentRequest, DocumentRequestStatus } from "@/types/document";

export function DocumentRequestsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [requests, setRequests] = useState<DocumentRequest[]>(DOCUMENT_REQUESTS);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const requestSelection = useEntitySelection(requests, (request) => request.id);
  const [createOpen, setCreateOpen] = useState(false);

  const scopedRequests = useMemo(
    () => requests.filter((request) => requestIsInScope(request, selectedBranchId)),
    [requests, selectedBranchId],
  );

  const visibleRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedRequests.filter((request) => {
      const employee = EMPLOYEES.find((item) => item.id === request.employeeId);

      const searchableValue = [
        request.title,
        request.note,
        employee?.name,
        employee?.employeeCode,
        employee?.department,
        DOCUMENT_CATEGORY_CONFIG[request.category].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (statusFilter === "all" || request.status === statusFilter) &&
        (categoryFilter === "all" || request.category === categoryFilter)
      );
    });
  }, [categoryFilter, scopedRequests, searchQuery, statusFilter]);

  const selectedRequest = requestSelection.selected;

  const queue = scopedRequests
    .filter((request) => ["open", "submitted", "overdue"].includes(request.status))
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));

  const metrics = [
    {
      label: "Open requests",
      value: String(scopedRequests.filter((request) => request.status === "open").length),
      detail: selectedBranch.name,
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Submitted",
      value: String(
        scopedRequests.filter((request) => request.status === "submitted").length,
      ),
      detail: "Waiting for verification",
      icon: Send,
      tone: "info" as const,
    },
    {
      label: "Overdue",
      value: String(
        scopedRequests.filter((request) => request.status === "overdue").length,
      ),
      detail: "Past the required date",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
    {
      label: "Fulfilled",
      value: String(
        scopedRequests.filter((request) => request.status === "fulfilled").length,
      ),
      detail: "Completed requests",
      icon: CheckCircle2,
      tone: "success" as const,
    },
  ];

  const columns = createDocumentRequestColumns({
    onOpen: (request) => requestSelection.select(request.id),
  });

  function createRequest(request: DocumentRequest) {
    setRequests((currentRequests) => [request, ...currentRequests]);
    setCreateOpen(false);
    requestSelection.select(request.id);
  }

  function updateStatus(requestId: string, status: DocumentRequestStatus) {
    const actionDate = new Date().toISOString().slice(0, 10);

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              submittedAt:
                status === "submitted"
                  ? actionDate
                  : status === "open"
                    ? undefined
                    : request.submittedAt,
              fulfilledAt:
                status === "fulfilled"
                  ? actionDate
                  : status === "open"
                    ? undefined
                    : request.fulfilledAt,
            }
          : request,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={DOCUMENTS_COPY.eyebrow}
        title={DOCUMENTS_COPY.requests.title}
        description={DOCUMENTS_COPY.requests.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {DOCUMENT_ACTION_LABELS.createRequest}
          </Button>
        }
      />

      <div className="mt-7">
        <DocumentTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{DOCUMENTS_COPY.requests.registerTitle}</h2>
            <p className="mt-1 text-sm text-text-muted">
              {DOCUMENTS_COPY.requests.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={DOCUMENTS_COPY.requests.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">{DOCUMENTS_COPY.requests.allCategories}</option>
                {Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{DOCUMENTS_COPY.requests.allStatuses}</option>
                {Object.entries(DOCUMENT_REQUEST_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DataTable
            rows={visibleRequests}
            columns={columns}
            getRowKey={(request) => request.id}
            onRowClick={(request) => requestSelection.select(request.id)}
            emptyState={
              <EmptyState
                icon={FileSearch}
                title={DOCUMENTS_COPY.requests.emptyTitle}
                description={DOCUMENTS_COPY.requests.emptyDescription}
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus />
                    {DOCUMENT_ACTION_LABELS.createRequest}
                  </Button>
                }
              />
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <IconContainer icon={AlertTriangle} tone="warning" />
            <div>
              <h2 className="text-lg font-bold">{DOCUMENTS_COPY.requests.queueTitle}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {DOCUMENTS_COPY.requests.queueDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length > 0 ? (
              queue.slice(0, 6).map((request) => {
                const employee = EMPLOYEES.find((item) => item.id === request.employeeId);

                return (
                  <Button
                    key={request.id}
                    variant="ghost"
                    onClick={() => requestSelection.select(request.id)}
                    className="h-auto w-full justify-start whitespace-normal rounded-control border border-border p-4 text-left hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {employee?.name ?? "Employee unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">{request.title}</p>
                        </div>
                        <Badge
                          variant={
                            DOCUMENT_REQUEST_STATUS_CONFIG[request.status].badgeVariant
                          }
                        >
                          {DOCUMENT_REQUEST_STATUS_CONFIG[request.status].label}
                        </Badge>
                      </div>
                      <p className="mt-3 text-xs text-text-muted">
                        Due {formatDate(request.dueDate)}
                      </p>
                    </div>
                  </Button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No document requests currently require follow-up.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedRequest)}
        onClose={() => requestSelection.clear()}
        title="Document request"
        description={selectedRequest?.title}
        footer={
          selectedRequest ? (
            <div className="flex flex-wrap justify-end gap-3">
              {["open", "overdue"].includes(selectedRequest.status) && (
                <Button onClick={() => updateStatus(selectedRequest.id, "submitted")}>
                  {DOCUMENT_ACTION_LABELS.markSubmitted}
                </Button>
              )}

              {selectedRequest.status === "submitted" && (
                <Button onClick={() => updateStatus(selectedRequest.id, "fulfilled")}>
                  {DOCUMENT_ACTION_LABELS.fulfill}
                </Button>
              )}

              {!["fulfilled", "cancelled"].includes(selectedRequest.status) && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedRequest.id, "cancelled")}
                >
                  {DOCUMENT_ACTION_LABELS.cancel}
                </Button>
              )}

              {["fulfilled", "cancelled"].includes(selectedRequest.status) && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedRequest.id, "open")}
                >
                  {DOCUMENT_ACTION_LABELS.reopen}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRequest && <DocumentRequestDetails request={selectedRequest} />}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New document request"
        description="Request a required or optional document from an employee."
      >
        <DocumentRequestForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onCreate={createRequest}
        />
      </Drawer>
    </div>
  );
}
