"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import { AttendanceExceptionForm } from "@/components/attendance/attendance-exception-form";
import { AttendanceTabs } from "@/components/attendance/attendance-tabs";
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
import {
  ATTENDANCE_EXCEPTIONS_COPY,
  ATTENDANCE_EXCEPTION_SEVERITY_CONFIG,
  ATTENDANCE_EXCEPTION_SOURCE_CONFIG,
  ATTENDANCE_EXCEPTION_STATUS_CONFIG,
  ATTENDANCE_EXCEPTION_TYPE_CONFIG,
} from "@/config/attendance-exceptions";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { ATTENDANCE_EXCEPTIONS } from "@/data/attendance-exceptions";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import type {
  AttendanceException,
  AttendanceExceptionSeverity,
  AttendanceExceptionStatus,
  AttendanceExceptionType,
} from "@/types/attendance-exception";

function formatImpact(minutes: number) {
  if (minutes <= 0) {
    return "Not calculated";
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function AttendanceExceptionsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [exceptions, setExceptions] =
    useState<AttendanceException[]>(ATTENDANCE_EXCEPTIONS);

  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [severityFilter, setSeverityFilter] = useState("all");

  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const scopedExceptions = useMemo(
    () =>
      exceptions.filter(
        (exception) =>
          selectedBranch.isAggregate || exception.branchId === selectedBranch.id,
      ),
    [exceptions, selectedBranch],
  );

  const visibleExceptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedExceptions.filter((exception) => {
      const employee = EMPLOYEES.find((item) => item.id === exception.employeeId);

      if (!employee) {
        return false;
      }

      const typeConfig = ATTENDANCE_EXCEPTION_TYPE_CONFIG[exception.type];

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        typeConfig.label,
        exception.reason,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableValue.includes(query);

      const matchesType = typeFilter === "all" || exception.type === typeFilter;

      const matchesStatus = statusFilter === "all" || exception.status === statusFilter;

      const matchesSeverity =
        severityFilter === "all" || exception.severity === severityFilter;

      return matchesSearch && matchesType && matchesStatus && matchesSeverity;
    });
  }, [scopedExceptions, searchQuery, severityFilter, statusFilter, typeFilter]);

  const selectedException =
    exceptions.find((exception) => exception.id === selectedExceptionId) ?? null;

  const selectedEmployee = selectedException
    ? EMPLOYEES.find((employee) => employee.id === selectedException.employeeId)
    : null;

  const metrics = [
    {
      label: "Open exceptions",
      value: scopedExceptions.filter((exception) => exception.status === "open").length,
      detail: selectedBranch.name,
      icon: ShieldAlert,
      tone: "danger" as const,
    },
    {
      label: "Under review",
      value: scopedExceptions.filter((exception) => exception.status === "under_review")
        .length,
      detail: "Waiting for administrator action",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "High severity",
      value: scopedExceptions.filter(
        (exception) => exception.severity === "high" && exception.status !== "resolved",
      ).length,
      detail: "Priority attendance cases",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
    {
      label: "Resolved",
      value: scopedExceptions.filter((exception) => exception.status === "resolved")
        .length,
      detail: "Completed exception reviews",
      icon: CheckCircle2,
      tone: "success" as const,
    },
  ];

  function createException(exception: AttendanceException) {
    setExceptions((currentExceptions) => [exception, ...currentExceptions]);

    setCreateOpen(false);
    setSelectedExceptionId(exception.id);
  }

  function updateStatus(exceptionId: string, status: AttendanceExceptionStatus) {
    setExceptions((currentExceptions) =>
      currentExceptions.map((exception) =>
        exception.id === exceptionId
          ? {
              ...exception,
              status,
              reviewer: status === "open" ? undefined : CURRENT_ADMIN.name,
              resolvedAt:
                status === "resolved"
                  ? new Date().toISOString().slice(0, 10)
                  : exception.resolvedAt,
            }
          : exception,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={ATTENDANCE_EXCEPTIONS_COPY.eyebrow}
        title={ATTENDANCE_EXCEPTIONS_COPY.title}
        description={ATTENDANCE_EXCEPTIONS_COPY.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {ATTENDANCE_EXCEPTIONS_COPY.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <AttendanceTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{ATTENDANCE_EXCEPTIONS_COPY.tableTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {ATTENDANCE_EXCEPTIONS_COPY.tableDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_12rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={ATTENDANCE_EXCEPTIONS_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">{ATTENDANCE_EXCEPTIONS_COPY.allTypes}</option>

              {Object.entries(ATTENDANCE_EXCEPTION_TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{ATTENDANCE_EXCEPTIONS_COPY.allStatuses}</option>

              {Object.entries(ATTENDANCE_EXCEPTION_STATUS_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
            >
              <option value="all">{ATTENDANCE_EXCEPTIONS_COPY.allSeverities}</option>

              {Object.entries(ATTENDANCE_EXCEPTION_SEVERITY_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        {visibleExceptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Exception</TableHead>

                <TableHead>Date</TableHead>

                <TableHead>Impact</TableHead>

                <TableHead>Severity</TableHead>

                <TableHead>Source</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleExceptions.map((exception) => {
                const employee = EMPLOYEES.find(
                  (item) => item.id === exception.employeeId,
                );

                if (!employee) {
                  return null;
                }

                const typeConfig = ATTENDANCE_EXCEPTION_TYPE_CONFIG[exception.type];

                const severityConfig =
                  ATTENDANCE_EXCEPTION_SEVERITY_CONFIG[exception.severity];

                const sourceConfig = ATTENDANCE_EXCEPTION_SOURCE_CONFIG[exception.source];

                const statusConfig = ATTENDANCE_EXCEPTION_STATUS_CONFIG[exception.status];

                return (
                  <TableRow
                    key={exception.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => setSelectedExceptionId(exception.id)}
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
                      <div className="max-w-64">
                        <Badge variant={typeConfig.badgeVariant}>
                          {typeConfig.label}
                        </Badge>

                        <p className="mt-2 line-clamp-1 text-xs text-text-muted">
                          {exception.reason}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{formatDate(exception.date)}</TableCell>

                    <TableCell>{formatImpact(exception.impactMinutes)}</TableCell>

                    <TableCell>
                      <Badge variant={severityConfig.badgeVariant}>
                        {severityConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={sourceConfig.badgeVariant}>
                        {sourceConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Review exception for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelectedExceptionId(exception.id);
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

            <h3 className="mt-4 font-bold">No exceptions found</h3>

            <p className="mt-2 text-sm text-text-muted">
              Change the filters or create a new attendance exception.
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedException)}
        onClose={() => setSelectedExceptionId(null)}
        title="Attendance exception"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedException ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedException.status === "open" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedException.id, "under_review")}
                >
                  <Clock3 />
                  Start review
                </Button>
              )}

              {["open", "under_review"].includes(selectedException.status) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedException.id, "rejected")}
                  >
                    <X />
                    Reject
                  </Button>

                  <Button onClick={() => updateStatus(selectedException.id, "approved")}>
                    <Check />
                    Approve correction
                  </Button>
                </>
              )}

              {selectedException.status === "approved" && (
                <Button onClick={() => updateStatus(selectedException.id, "resolved")}>
                  <CheckCircle2 />
                  Mark resolved
                </Button>
              )}

              {["rejected", "resolved"].includes(selectedException.status) && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedException.id, "open")}
                >
                  <RotateCcw />
                  Reopen
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedException && selectedEmployee && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">
                    {ATTENDANCE_EXCEPTION_TYPE_CONFIG[selectedException.type].label}
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Detected {selectedException.detectedAt}
                  </p>
                </div>

                <Badge
                  variant={
                    ATTENDANCE_EXCEPTION_STATUS_CONFIG[selectedException.status]
                      .badgeVariant
                  }
                >
                  {ATTENDANCE_EXCEPTION_STATUS_CONFIG[selectedException.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Attendance date",
                    value: formatDate(selectedException.date),
                  },
                  {
                    label: "Branch",
                    value: selectedEmployee.branchName,
                  },
                  {
                    label: "Severity",
                    value: (
                      <Badge
                        variant={
                          ATTENDANCE_EXCEPTION_SEVERITY_CONFIG[selectedException.severity]
                            .badgeVariant
                        }
                      >
                        {
                          ATTENDANCE_EXCEPTION_SEVERITY_CONFIG[selectedException.severity]
                            .label
                        }
                      </Badge>
                    ),
                  },
                  {
                    label: "Time impact",
                    value: formatImpact(selectedException.impactMinutes),
                  },
                  {
                    label: "Source",
                    value:
                      ATTENDANCE_EXCEPTION_SOURCE_CONFIG[selectedException.source].label,
                  },
                  {
                    label: "Reviewer",
                    value: selectedException.reviewer || "Not assigned",
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Exception reason</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedException.reason}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Employee note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedException.employeeNote || "No employee note was submitted."}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Administrator note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedException.adminNote || "No administrator note has been added."}
              </p>
            </section>

            {selectedException.resolvedAt && (
              <div className="rounded-control bg-success-muted p-4">
                <p className="text-sm font-semibold text-success">
                  Resolved on {formatDate(selectedException.resolvedAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create attendance exception"
        description="Create a manual exception for an employee attendance record."
      >
        <AttendanceExceptionForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onCreate={createException}
        />
      </Drawer>
    </div>
  );
}
