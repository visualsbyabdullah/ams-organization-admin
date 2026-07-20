"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  CalendarCheck2,
  CalendarClock,
  Check,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  Umbrella,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { LeaveTabs } from "@/components/leave/leave-tabs";
import { LeaveTrendChart } from "@/components/leave/leave-trend-chart";
import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
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
import {
  LEAVE_COPY,
  LEAVE_REFERENCE_DATE,
  LEAVE_STATUS_CONFIG,
  LEAVE_TYPE_CONFIG,
} from "@/config/leave";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import {
  LEAVE_BALANCES,
  LEAVE_REQUESTS,
  LEAVE_TRENDS,
} from "@/data/leave";
import { formatDate } from "@/lib/date";
import type {
  LeaveRequest,
  LeaveRequestStatus,
} from "@/types/leave";

function isDateWithinRange(
  date: string,
  startDate: string,
  endDate: string,
) {
  return (
    date >= startDate &&
    date <= endDate
  );
}

function getDaysUntil(
  date: string,
) {
  const start = new Date(
    `${LEAVE_REFERENCE_DATE}T00:00:00`,
  );

  const end = new Date(
    `${date}T00:00:00`,
  );

  return Math.floor(
    (end.getTime() -
      start.getTime()) /
      86400000,
  );
}

export function LeaveOverview() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [requests, setRequests] =
    useState<LeaveRequest[]>(
      LEAVE_REQUESTS,
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    selectedRequestId,
    setSelectedRequestId,
  ] = useState<string | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const scopedEmployees =
    useMemo(
      () =>
        EMPLOYEES.filter(
          (employee) =>
            selectedBranch.isAggregate ||
            employee.branchId ===
              selectedBranch.id,
        ),
      [selectedBranch],
    );

  const scopedEmployeeIds =
    useMemo(
      () =>
        new Set(
          scopedEmployees.map(
            (employee) =>
              employee.id,
          ),
        ),
      [scopedEmployees],
    );

  const scopedRequests =
    useMemo(
      () =>
        requests.filter((request) =>
          scopedEmployeeIds.has(
            request.employeeId,
          ),
        ),
      [
        requests,
        scopedEmployeeIds,
      ],
    );

  const visibleRequests =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return scopedRequests.filter(
        (request) => {
          const employee =
            EMPLOYEES.find(
              (item) =>
                item.id ===
                request.employeeId,
            );

          if (!employee) {
            return false;
          }

          const searchableValue = [
            employee.name,
            employee.employeeCode,
            employee.department,
            employee.designation,
            request.reason,
            LEAVE_TYPE_CONFIG[
              request.type
            ].label,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            searchableValue.includes(
              query,
            );

          const matchesType =
            typeFilter === "all" ||
            request.type ===
              typeFilter;

          const matchesStatus =
            statusFilter === "all" ||
            request.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );
        },
      );
    }, [
      scopedRequests,
      searchQuery,
      statusFilter,
      typeFilter,
    ]);

  const selectedRequest =
    requests.find(
      (request) =>
        request.id ===
        selectedRequestId,
    ) ?? null;

  const selectedEmployee =
    selectedRequest
      ? EMPLOYEES.find(
          (employee) =>
            employee.id ===
            selectedRequest.employeeId,
        )
      : null;

  const employeesOnLeave =
    scopedRequests.filter(
      (request) =>
        request.status ===
          "approved" &&
        isDateWithinRange(
          LEAVE_REFERENCE_DATE,
          request.startDate,
          request.endDate,
        ),
    );

  const upcomingRequests =
    scopedRequests
      .filter((request) => {
        const daysUntil =
          getDaysUntil(
            request.startDate,
          );

        return (
          request.status ===
            "approved" &&
          daysUntil > 0 &&
          daysUntil <= 7
        );
      })
      .sort((first, second) =>
        first.startDate.localeCompare(
          second.startDate,
        ),
      );

  const scopedBalances =
    LEAVE_BALANCES.filter(
      (balance) =>
        scopedEmployeeIds.has(
          balance.employeeId,
        ),
    );

  const annualRemaining =
    scopedBalances.reduce(
      (total, balance) =>
        total +
        Math.max(
          balance.allowance.annual -
            balance.used.annual,
          0,
        ),
      0,
    );

  const trend =
    LEAVE_TRENDS[
      selectedBranchId
    ] ?? LEAVE_TRENDS.all;

  const metrics = [
    {
      label: "Pending requests",
      value: scopedRequests.filter(
        (request) =>
          request.status ===
          "pending",
      ).length,
      detail:
        "Waiting for approval",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "On leave today",
      value: employeesOnLeave.length,
      detail: selectedBranch.name,
      icon: Umbrella,
      tone: "info" as const,
    },
    {
      label: "Upcoming absences",
      value: upcomingRequests.length,
      detail:
        "Starting within seven days",
      icon: CalendarClock,
      tone: "warning" as const,
    },
    {
      label: "Annual days available",
      value: annualRemaining,
      detail:
        "Combined remaining balance",
      icon: CalendarCheck2,
      tone: "success" as const,
    },
  ];

  function createRequest(
    request: LeaveRequest,
  ) {
    setRequests(
      (currentRequests) => [
        request,
        ...currentRequests,
      ],
    );

    setCreateOpen(false);
    setSelectedRequestId(
      request.id,
    );
  }

  function updateRequestStatus(
    requestId: string,
    status: LeaveRequestStatus,
  ) {
    const reviewDate = new Date()
      .toISOString()
      .slice(0, 10);

    setRequests(
      (currentRequests) =>
        currentRequests.map(
          (request) =>
            request.id === requestId
              ? {
                  ...request,
                  status,
                  reviewedBy:
                    CURRENT_ADMIN.name,
                  reviewedAt:
                    reviewDate,
                }
              : request,
        ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          LEAVE_COPY.eyebrow
        }
        title={LEAVE_COPY.title}
        description={
          LEAVE_COPY.description
        }
        actions={
          <Button
            onClick={() =>
              setCreateOpen(true)
            }
          >
            <Plus />
            {LEAVE_COPY.createRequest}
          </Button>
        }
      />

      <div className="mt-7">
        <LeaveTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ChartCard
          title={
            LEAVE_COPY.trendTitle
          }
          description={
            LEAVE_COPY.trendDescription
          }
        >
          <LeaveTrendChart
            data={trend}
          />
        </ChartCard>

        <Card className="p-6">
          <div>
            <h2 className="text-lg font-bold">
              {
                LEAVE_COPY.upcomingTitle
              }
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              {
                LEAVE_COPY.upcomingDescription
              }
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingRequests.length >
            0 ? (
              upcomingRequests.map(
                (request) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        request.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() =>
                        setSelectedRequestId(
                          request.id,
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {employee.name}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {formatDate(
                            request.startDate,
                          )}{" "}
                          ·{" "}
                          {request.totalDays}{" "}
                          days
                        </p>
                      </div>

                      <Badge
                        variant={
                          LEAVE_TYPE_CONFIG[
                            request.type
                          ].badgeVariant
                        }
                      >
                        {
                          LEAVE_TYPE_CONFIG[
                            request.type
                          ].label
                        }
                      </Badge>
                    </button>
                  );
                },
              )
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No approved absences start
                within the next seven days.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {LEAVE_COPY.tableTitle}
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              LEAVE_COPY.tableDescription
            }
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder={
                  LEAVE_COPY.searchPlaceholder
                }
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {LEAVE_COPY.allTypes}
              </option>

              {Object.entries(
                LEAVE_TYPE_CONFIG,
              ).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  LEAVE_COPY.allStatuses
                }
              </option>

              {Object.entries(
                LEAVE_STATUS_CONFIG,
              ).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        {visibleRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>
                  Employee
                </TableHead>

                <TableHead>
                  Leave type
                </TableHead>

                <TableHead>
                  Dates
                </TableHead>

                <TableHead>
                  Duration
                </TableHead>

                <TableHead>
                  Requested
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="w-16">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRequests.map(
                (request) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        request.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  const typeConfig =
                    LEAVE_TYPE_CONFIG[
                      request.type
                    ];

                  const statusConfig =
                    LEAVE_STATUS_CONFIG[
                      request.status
                    ];

                  return (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer transition hover:bg-canvas"
                      onClick={() =>
                        setSelectedRequestId(
                          request.id,
                        )
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={
                              employee.name
                            }
                            initials={
                              employee.initials
                            }
                          />

                          <div>
                            <p className="font-semibold">
                              {
                                employee.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-text-muted">
                              {
                                employee.employeeCode
                              }{" "}
                              ·{" "}
                              {
                                employee.department
                              }
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            typeConfig.badgeVariant
                          }
                        >
                          {
                            typeConfig.label
                          }
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          request.startDate,
                        )}{" "}
                        –{" "}
                        {formatDate(
                          request.endDate,
                        )}
                      </TableCell>

                      <TableCell>
                        {request.totalDays}{" "}
                        {request.totalDays ===
                        1
                          ? "day"
                          : "days"}
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          request.requestedAt,
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            statusConfig.badgeVariant
                          }
                        >
                          {
                            statusConfig.label
                          }
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Open leave request for ${employee.name}`}
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            setSelectedRequestId(
                              request.id,
                            );
                          }}
                        >
                          <MoreHorizontal />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                },
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <Users className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">
              No leave requests found
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              Change the filters or submit a
              new leave request.
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(
          selectedRequest,
        )}
        onClose={() =>
          setSelectedRequestId(null)
        }
        title="Leave request"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedRequest?.status ===
          "pending" ? (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  updateRequestStatus(
                    selectedRequest.id,
                    "rejected",
                  )
                }
              >
                <X />
                Reject
              </Button>

              <Button
                onClick={() =>
                  updateRequestStatus(
                    selectedRequest.id,
                    "approved",
                  )
                }
              >
                <Check />
                Approve leave
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedRequest &&
          selectedEmployee && (
            <div className="space-y-6">
              <section className="rounded-card border border-border">
                <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                  <div>
                    <h3 className="font-bold">
                      {
                        LEAVE_TYPE_CONFIG[
                          selectedRequest.type
                        ].label
                      }
                    </h3>

                    <p className="mt-1 text-xs text-text-muted">
                      Submitted{" "}
                      {formatDate(
                        selectedRequest.requestedAt,
                      )}
                    </p>
                  </div>

                  <Badge
                    variant={
                      LEAVE_STATUS_CONFIG[
                        selectedRequest.status
                      ].badgeVariant
                    }
                  >
                    {
                      LEAVE_STATUS_CONFIG[
                        selectedRequest.status
                      ].label
                    }
                  </Badge>
                </div>

                <dl className="grid gap-5 p-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-text-muted">
                      Start date
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {formatDate(
                        selectedRequest.startDate,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      End date
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {formatDate(
                        selectedRequest.endDate,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Duration
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {
                        selectedRequest.totalDays
                      }{" "}
                      days
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Branch
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {
                        selectedEmployee.branchName
                      }
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Reviewer
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {selectedRequest.reviewedBy ||
                        "Not assigned"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Reviewed date
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {selectedRequest.reviewedAt
                        ? formatDate(
                            selectedRequest.reviewedAt,
                          )
                        : "Pending"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Leave reason
                </h3>

                <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                  {
                    selectedRequest.reason
                  }
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Manager note
                </h3>

                <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                  {selectedRequest.managerNote ||
                    "No manager note has been added."}
                </p>
              </section>
            </div>
          )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        title="New leave request"
        description="Submit an employee leave request for manager approval."
      >
        <LeaveRequestForm
          selectedBranchId={
            selectedBranchId
          }
          onCancel={() =>
            setCreateOpen(false)
          }
          onCreate={createRequest}
        />
      </Drawer>
    </div>
  );
}
