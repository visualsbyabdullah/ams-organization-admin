"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  Umbrella,
  X,
  XCircle,
} from "lucide-react";

import { LeaveBalanceSummary } from "@/components/leave/leave-balance-summary";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { LeaveTabs } from "@/components/leave/leave-tabs";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DetailGrid } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAVE_REFERENCE_DATE,
  LEAVE_STATUS_CONFIG,
  LEAVE_TYPE_CONFIG,
} from "@/config/leave";
import {
  LEAVE_REQUEST_PERIOD_OPTIONS,
  LEAVE_REQUESTS_COPY,
} from "@/config/leave-requests";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { LEAVE_BALANCES, LEAVE_REQUESTS } from "@/data/leave";
import { formatDate } from "@/lib/date";
import type { LeaveRequest, LeaveRequestStatus } from "@/types/leave";

function matchesPeriod(request: LeaveRequest, period: string) {
  if (period === "current") {
    return (
      request.startDate <= LEAVE_REFERENCE_DATE && request.endDate >= LEAVE_REFERENCE_DATE
    );
  }

  if (period === "upcoming") {
    return request.startDate > LEAVE_REFERENCE_DATE;
  }

  if (period === "past") {
    return request.endDate < LEAVE_REFERENCE_DATE;
  }

  return true;
}

export function LeaveRequestsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [requests, setRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);

  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [periodFilter, setPeriodFilter] = useState("all");

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [reviewNote, setReviewNote] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const scopedRequests = useMemo(
    () =>
      requests.filter(
        (request) => selectedBranch.isAggregate || request.branchId === selectedBranch.id,
      ),
    [requests, selectedBranch],
  );

  const visibleRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedRequests.filter((request) => {
      const employee = EMPLOYEES.find((item) => item.id === request.employeeId);

      if (!employee) {
        return false;
      }

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        employee.email,
        request.reason,
        LEAVE_TYPE_CONFIG[request.type].label,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableValue.includes(query);

      const matchesType = typeFilter === "all" || request.type === typeFilter;

      const matchesStatus = statusFilter === "all" || request.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPeriod(request, periodFilter)
      );
    });
  }, [periodFilter, scopedRequests, searchQuery, statusFilter, typeFilter]);

  const selectedRequest =
    requests.find((request) => request.id === selectedRequestId) ?? null;

  const selectedEmployee = selectedRequest
    ? EMPLOYEES.find((employee) => employee.id === selectedRequest.employeeId)
    : null;

  const selectedBalance = selectedRequest
    ? LEAVE_BALANCES.find((balance) => balance.employeeId === selectedRequest.employeeId)
    : undefined;

  useEffect(() => {
    setReviewNote(selectedRequest?.managerNote ?? "");
  }, [selectedRequest]);

  const metrics = [
    {
      label: "Pending approval",
      value: scopedRequests.filter((request) => request.status === "pending").length,
      detail: selectedBranch.name,
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Currently on leave",
      value: scopedRequests.filter(
        (request) => request.status === "approved" && matchesPeriod(request, "current"),
      ).length,
      detail: "Approved active absences",
      icon: Umbrella,
      tone: "info" as const,
    },
    {
      label: "Upcoming approved",
      value: scopedRequests.filter(
        (request) => request.status === "approved" && matchesPeriod(request, "upcoming"),
      ).length,
      detail: "Future approved requests",
      icon: CalendarClock,
      tone: "success" as const,
    },
    {
      label: "Rejected requests",
      value: scopedRequests.filter((request) => request.status === "rejected").length,
      detail: "Declined leave requests",
      icon: XCircle,
      tone: "danger" as const,
    },
  ];

  function createRequest(request: LeaveRequest) {
    setRequests((currentRequests) => [request, ...currentRequests]);

    setCreateOpen(false);
    setSelectedRequestId(request.id);
  }

  function saveReviewNote() {
    if (!selectedRequest) {
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              managerNote: reviewNote.trim(),
            }
          : request,
      ),
    );
  }

  function updateStatus(requestId: string, status: LeaveRequestStatus) {
    const reviewDate = new Date().toISOString().slice(0, 10);

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              managerNote: reviewNote.trim(),
              reviewedBy: status === "pending" ? undefined : CURRENT_ADMIN.name,
              reviewedAt: status === "pending" ? undefined : reviewDate,
            }
          : request,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={LEAVE_REQUESTS_COPY.eyebrow}
        title={LEAVE_REQUESTS_COPY.title}
        description={LEAVE_REQUESTS_COPY.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {LEAVE_REQUESTS_COPY.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <LeaveTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{LEAVE_REQUESTS_COPY.queueTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {LEAVE_REQUESTS_COPY.queueDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={LEAVE_REQUESTS_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">{LEAVE_REQUESTS_COPY.allTypes}</option>

              {Object.entries(LEAVE_TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{LEAVE_REQUESTS_COPY.allStatuses}</option>

              {Object.entries(LEAVE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value)}
            >
              {LEAVE_REQUEST_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visibleRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Leave type</TableHead>

                <TableHead>Leave dates</TableHead>

                <TableHead>Days</TableHead>

                <TableHead>Requested</TableHead>

                <TableHead>Reviewer</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRequests.map((request) => {
                const employee = EMPLOYEES.find((item) => item.id === request.employeeId);

                if (!employee) {
                  return null;
                }

                const typeConfig = LEAVE_TYPE_CONFIG[request.type];

                const statusConfig = LEAVE_STATUS_CONFIG[request.status];

                return (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.name} initials={employee.initials} />

                        <div>
                          <p className="font-semibold">{employee.name}</p>

                          <p className="mt-1 text-xs text-text-muted">
                            {employee.employeeCode} · {employee.department}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={typeConfig.badgeVariant}>{typeConfig.label}</Badge>
                    </TableCell>

                    <TableCell>
                      {formatDate(request.startDate)} – {formatDate(request.endDate)}
                    </TableCell>

                    <TableCell>{request.totalDays}</TableCell>

                    <TableCell>{formatDate(request.requestedAt)}</TableCell>

                    <TableCell>{request.reviewedBy || "Not assigned"}</TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Review leave request for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelectedRequestId(request.id);
                        }}
                      >
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">{LEAVE_REQUESTS_COPY.emptyTitle}</h3>

            <p className="mt-2 text-sm text-text-muted">
              {LEAVE_REQUESTS_COPY.emptyDescription}
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequestId(null)}
        title="Leave request review"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedRequest ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={saveReviewNote}>
                <Send />
                Save note
              </Button>

              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedRequest.id, "rejected")}
                  >
                    <X />
                    Reject
                  </Button>

                  <Button onClick={() => updateStatus(selectedRequest.id, "approved")}>
                    <Check />
                    Approve leave
                  </Button>
                </>
              )}

              {["approved", "rejected"].includes(selectedRequest.status) && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedRequest.id, "pending")}
                >
                  <RotateCcw />
                  Reopen request
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRequest && selectedEmployee && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">
                    {LEAVE_TYPE_CONFIG[selectedRequest.type].label}
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Submitted {formatDate(selectedRequest.requestedAt)}
                  </p>
                </div>

                <Badge variant={LEAVE_STATUS_CONFIG[selectedRequest.status].badgeVariant}>
                  {LEAVE_STATUS_CONFIG[selectedRequest.status].label}
                </Badge>
              </div>

              <DetailGrid
                bordered={false}
                items={[
                  {
                    label: "Start date",
                    value: formatDate(selectedRequest.startDate),
                  },
                  {
                    label: "End date",
                    value: formatDate(selectedRequest.endDate),
                  },
                  {
                    label: "Duration",
                    value: `${selectedRequest.totalDays} days`,
                  },
                  {
                    label: "Branch",
                    value: selectedEmployee.branchName,
                  },
                  {
                    label: "Reviewed by",
                    value: selectedRequest.reviewedBy || "Not reviewed",
                  },
                  {
                    label: "Review date",
                    value: selectedRequest.reviewedAt
                      ? formatDate(selectedRequest.reviewedAt)
                      : "Pending",
                  },
                ]}
              />
            </section>

            <LeaveBalanceSummary balance={selectedBalance} type={selectedRequest.type} />

            <section>
              <h3 className="text-sm font-bold">Employee reason</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedRequest.reason}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Manager note</h3>

              <Textarea
                className="mt-2"
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Add approval, rejection or coverage notes..."
              />
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New leave request"
        description="Submit an employee leave request for manager approval."
      >
        <LeaveRequestForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onCreate={createRequest}
        />
      </Drawer>
    </div>
  );
}
