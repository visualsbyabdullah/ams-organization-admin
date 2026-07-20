"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Umbrella,
  Users,
  X,
} from "lucide-react";

import { LeaveCalendarGrid } from "@/components/leave/leave-calendar-grid";
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
import { Select } from "@/components/ui/select";
import { LEAVE_CALENDAR_COPY } from "@/config/leave-calendar";
import { LEAVE_STATUS_CONFIG, LEAVE_TYPE_CONFIG } from "@/config/leave";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { LEAVE_REQUESTS } from "@/data/leave";
import { formatDate } from "@/lib/date";
import type { LeaveRequest, LeaveRequestStatus } from "@/types/leave";

function toDateString(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthBounds(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return {
    start: toDateString(new Date(year, monthIndex, 1)),
    end: toDateString(new Date(year, monthIndex + 1, 0)),
  };
}

function overlapsRange(request: LeaveRequest, startDate: string, endDate: string) {
  return request.startDate <= endDate && request.endDate >= startDate;
}

function includesDate(request: LeaveRequest, date: string) {
  return request.startDate <= date && request.endDate >= date;
}

function countOverlapDays(request: LeaveRequest, monthStart: string, monthEnd: string) {
  const start = request.startDate > monthStart ? request.startDate : monthStart;

  const end = request.endDate < monthEnd ? request.endDate : monthEnd;

  const startTime = new Date(`${start}T00:00:00`).getTime();

  const endTime = new Date(`${end}T00:00:00`).getTime();

  return Math.max(Math.floor((endTime - startTime) / 86400000) + 1, 0);
}

function getPeakDay(month: Date, requests: LeaveRequest[]) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  let result = {
    date: toDateString(new Date(year, monthIndex, 1)),
    count: 0,
  };

  for (let day = 1; day <= totalDays; day += 1) {
    const date = toDateString(new Date(year, monthIndex, day));

    const count = requests.filter((request) => includesDate(request, date)).length;

    if (count > result.count) {
      result = {
        date,
        count,
      };
    }
  }

  return result;
}

export function LeaveCalendarWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [requests, setRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);

  const [month, setMonth] = useState(new Date(2026, 6, 1));

  const [selectedDate, setSelectedDate] = useState("2026-07-16");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("active");

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const monthBounds = useMemo(() => getMonthBounds(month), [month]);

  const scopedRequests = useMemo(
    () =>
      requests.filter(
        (request) => selectedBranch.isAggregate || request.branchId === selectedBranch.id,
      ),
    [requests, selectedBranch],
  );

  const calendarRequests = useMemo(
    () =>
      scopedRequests.filter((request) => {
        const matchesType = typeFilter === "all" || request.type === typeFilter;

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active"
            ? ["approved", "pending"].includes(request.status)
            : request.status === statusFilter);

        return (
          matchesType &&
          matchesStatus &&
          overlapsRange(request, monthBounds.start, monthBounds.end)
        );
      }),
    [monthBounds.end, monthBounds.start, scopedRequests, statusFilter, typeFilter],
  );

  const selectedDayRequests = calendarRequests
    .filter((request) => includesDate(request, selectedDate))
    .sort((first, second) => first.startDate.localeCompare(second.startDate));

  const selectedRequest =
    requests.find((request) => request.id === selectedRequestId) ?? null;

  const selectedEmployee = selectedRequest
    ? EMPLOYEES.find((employee) => employee.id === selectedRequest.employeeId)
    : null;

  const uniqueEmployees = new Set(calendarRequests.map((request) => request.employeeId))
    .size;

  const scheduledDays = calendarRequests.reduce(
    (total, request) =>
      total + countOverlapDays(request, monthBounds.start, monthBounds.end),
    0,
  );

  const pendingCount = calendarRequests.filter(
    (request) => request.status === "pending",
  ).length;

  const peakDay = getPeakDay(month, calendarRequests);

  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(month);

  const metrics = [
    {
      label: "Employees with leave",
      value: uniqueEmployees,
      detail: selectedBranch.name,
      icon: Users,
      tone: "info" as const,
    },
    {
      label: "Scheduled leave days",
      value: scheduledDays,
      detail: monthLabel,
      icon: CalendarRange,
      tone: "success" as const,
    },
    {
      label: "Pending requests",
      value: pendingCount,
      detail: "Visible planning requests",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Peak absence day",
      value: peakDay.count > 0 ? formatDate(peakDay.date) : "None",
      detail: `${peakDay.count} employees`,
      icon: Umbrella,
      tone: "danger" as const,
    },
  ];

  function moveMonth(direction: number) {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + direction, 1);

    setMonth(nextMonth);

    setSelectedDate(toDateString(nextMonth));
  }

  function createRequest(request: LeaveRequest) {
    setRequests((currentRequests) => [request, ...currentRequests]);

    const requestMonth = new Date(`${request.startDate}T00:00:00`);

    setMonth(new Date(requestMonth.getFullYear(), requestMonth.getMonth(), 1));

    setSelectedDate(request.startDate);

    setCreateOpen(false);

    setSelectedRequestId(request.id);
  }

  function updateStatus(requestId: string, status: LeaveRequestStatus) {
    const reviewDate = new Date().toISOString().slice(0, 10);

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              reviewedBy: CURRENT_ADMIN.name,
              reviewedAt: reviewDate,
            }
          : request,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={LEAVE_CALENDAR_COPY.eyebrow}
        title={LEAVE_CALENDAR_COPY.title}
        description={LEAVE_CALENDAR_COPY.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {LEAVE_CALENDAR_COPY.createAction}
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">{LEAVE_CALENDAR_COPY.calendarTitle}</h2>

                <p className="mt-1 text-sm text-text-muted">
                  {LEAVE_CALENDAR_COPY.calendarDescription}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() => moveMonth(-1)}
                >
                  <ChevronLeft />
                </Button>

                <div className="min-w-38 text-center text-sm font-bold">{monthLabel}</div>

                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next month"
                  onClick={() => moveMonth(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">{LEAVE_CALENDAR_COPY.allLeaveTypes}</option>

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
                <option value="active">{LEAVE_CALENDAR_COPY.activeRequests}</option>

                <option value="approved">{LEAVE_CALENDAR_COPY.approvedOnly}</option>

                <option value="pending">{LEAVE_CALENDAR_COPY.pendingOnly}</option>

                <option value="all">{LEAVE_CALENDAR_COPY.allStatuses}</option>
              </Select>
            </div>
          </div>

          <LeaveCalendarGrid
            month={month}
            selectedDate={selectedDate}
            requests={calendarRequests}
            onDateSelect={setSelectedDate}
            onRequestSelect={setSelectedRequestId}
          />
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              <CalendarDays size={19} />
            </span>

            <div>
              <p className="text-sm font-semibold text-primary">
                {LEAVE_CALENDAR_COPY.selectedDayTitle}
              </p>

              <h2 className="mt-1 text-lg font-bold">{formatDate(selectedDate)}</h2>

              <p className="mt-1 text-xs text-text-muted">{selectedBranch.name}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedDayRequests.length > 0 ? (
              selectedDayRequests.map((request) => {
                const employee = EMPLOYEES.find((item) => item.id === request.employeeId);

                if (!employee) {
                  return null;
                }

                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedRequestId(request.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={employee.name} initials={employee.initials} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{employee.name}</p>

                        <p className="mt-1 truncate text-xs text-text-muted">
                          {employee.department}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant={LEAVE_TYPE_CONFIG[request.type].badgeVariant}>
                        {LEAVE_TYPE_CONFIG[request.type].label}
                      </Badge>

                      <Badge variant={LEAVE_STATUS_CONFIG[request.status].badgeVariant}>
                        {LEAVE_STATUS_CONFIG[request.status].label}
                      </Badge>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No employee leave is recorded for this date.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequestId(null)}
        title="Calendar leave request"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedRequest?.status === "pending" ? (
            <div className="flex justify-end gap-3">
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
                    Requested {formatDate(selectedRequest.requestedAt)}
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
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Leave reason</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedRequest.reason}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Manager note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedRequest.managerNote || "No manager note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New leave request"
        description="Submit an employee leave request and add it to the organization calendar."
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
