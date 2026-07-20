"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  Download,
  FileClock,
  LockKeyhole,
  MoreHorizontal,
  Search,
  TimerReset,
  X,
} from "lucide-react";

import { AttendanceTabs } from "@/components/attendance/attendance-tabs";
import { TimesheetDetails } from "@/components/attendance/timesheet-details";
import { TimesheetHoursChart } from "@/components/attendance/timesheet-hours-chart";
import {
  TimesheetStatusChart,
  TIMESHEET_STATUS_CHART_COLORS,
} from "@/components/attendance/timesheet-status-chart";
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
  TIMESHEET_COPY,
  TIMESHEET_PERIOD_OPTIONS,
  TIMESHEET_STATUS_CONFIG,
} from "@/config/timesheets";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { TIMESHEETS } from "@/data/timesheets";
import { formatDate } from "@/lib/date";
import {
  formatMinutesAsHours,
  getTimesheetTotals,
  minutesToDecimalHours,
} from "@/lib/time";
import type { Timesheet, TimesheetChartPoint, TimesheetStatus } from "@/types/timesheet";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function TimesheetsWorkspace() {
  const { selectedBranch } = useBranchScope();

  const [timesheets, setTimesheets] = useState<Timesheet[]>(TIMESHEETS);

  const [selectedPeriod, setSelectedPeriod] = useState(TIMESHEET_PERIOD_OPTIONS[0].value);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | null>(null);

  const periodConfig =
    TIMESHEET_PERIOD_OPTIONS.find((period) => period.value === selectedPeriod) ??
    TIMESHEET_PERIOD_OPTIONS[0];

  const visibleTimesheets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return timesheets.filter((timesheet) => {
      const employee = EMPLOYEES.find((item) => item.id === timesheet.employeeId);

      if (!employee) {
        return false;
      }

      const matchesBranch =
        selectedBranch.isAggregate || timesheet.branchId === selectedBranch.id;

      const matchesPeriod =
        timesheet.periodStart === periodConfig.start &&
        timesheet.periodEnd === periodConfig.end;

      const matchesStatus = statusFilter === "all" || timesheet.status === statusFilter;

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesBranch && matchesPeriod && matchesStatus && searchableValue.includes(query)
      );
    });
  }, [
    periodConfig.end,
    periodConfig.start,
    searchQuery,
    selectedBranch,
    statusFilter,
    timesheets,
  ]);

  const selectedTimesheet =
    timesheets.find((timesheet) => timesheet.id === selectedTimesheetId) ?? null;

  const selectedEmployee = selectedTimesheet
    ? EMPLOYEES.find((employee) => employee.id === selectedTimesheet.employeeId)
    : null;

  const chartData = useMemo<TimesheetChartPoint[]>(
    () =>
      DAY_LABELS.map((day, index) => {
        const totals = visibleTimesheets.reduce(
          (currentTotals, timesheet) => {
            const entry = timesheet.days[index];

            return {
              regularMinutes: currentTotals.regularMinutes + (entry?.regularMinutes ?? 0),

              overtimeMinutes:
                currentTotals.overtimeMinutes + (entry?.overtimeMinutes ?? 0),
            };
          },
          {
            regularMinutes: 0,
            overtimeMinutes: 0,
          },
        );

        return {
          day,
          regularHours: minutesToDecimalHours(totals.regularMinutes),
          overtimeHours: minutesToDecimalHours(totals.overtimeMinutes),
        };
      }),
    [visibleTimesheets],
  );

  const totalOvertimeMinutes = visibleTimesheets.reduce(
    (total, timesheet) => total + getTimesheetTotals(timesheet.days).overtimeMinutes,
    0,
  );

  const totalMissingEntries = visibleTimesheets.reduce(
    (total, timesheet) => total + getTimesheetTotals(timesheet.days).missingEntries,
    0,
  );

  const statusChartData = [
    {
      name: "Approved",
      value: visibleTimesheets.filter((timesheet) => timesheet.status === "approved")
        .length,
      color: TIMESHEET_STATUS_CHART_COLORS.approved,
    },
    {
      name: "Pending",
      value: visibleTimesheets.filter((timesheet) => timesheet.status === "submitted")
        .length,
      color: TIMESHEET_STATUS_CHART_COLORS.submitted,
    },
    {
      name: "Draft",
      value: visibleTimesheets.filter((timesheet) => timesheet.status === "draft").length,
      color: TIMESHEET_STATUS_CHART_COLORS.draft,
    },
    {
      name: "Rejected",
      value: visibleTimesheets.filter((timesheet) => timesheet.status === "rejected")
        .length,
      color: TIMESHEET_STATUS_CHART_COLORS.rejected,
    },
    {
      name: "Locked",
      value: visibleTimesheets.filter((timesheet) => timesheet.status === "locked")
        .length,
      color: TIMESHEET_STATUS_CHART_COLORS.locked,
    },
  ];

  const metrics = [
    {
      label: "Timesheets",
      value: visibleTimesheets.length,
      detail: selectedBranch.name,
      icon: FileClock,
      tone: "info" as const,
    },
    {
      label: "Pending approval",
      value: visibleTimesheets.filter((timesheet) => timesheet.status === "submitted")
        .length,
      detail: "Waiting for manager review",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Total overtime",
      value: formatMinutesAsHours(totalOvertimeMinutes),
      detail: "Selected weekly period",
      icon: TimerReset,
      tone: "success" as const,
    },
    {
      label: "Missing entries",
      value: totalMissingEntries,
      detail: "Attendance corrections needed",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
  ];

  function updateTimesheetStatus(timesheetId: string, status: TimesheetStatus) {
    setTimesheets((currentTimesheets) =>
      currentTimesheets.map((timesheet) =>
        timesheet.id === timesheetId
          ? {
              ...timesheet,
              status,
              approvedBy:
                status === "approved" || status === "locked"
                  ? CURRENT_ADMIN.name
                  : undefined,
            }
          : timesheet,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={TIMESHEET_COPY.eyebrow}
        title={TIMESHEET_COPY.title}
        description={TIMESHEET_COPY.description}
        actions={
          <Button variant="outline">
            <Download />
            {TIMESHEET_COPY.export}
          </Button>
        }
      />

      <div className="mt-7">
        <AttendanceTabs />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          Viewing <strong className="text-text">{selectedBranch.name}</strong>
        </p>

        <Select
          value={selectedPeriod}
          onChange={(event) => setSelectedPeriod(event.target.value)}
          className="min-w-58"
        >
          {TIMESHEET_PERIOD_OPTIONS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </Select>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartCard
          title={TIMESHEET_COPY.chartTitle}
          description={TIMESHEET_COPY.chartDescription}
        >
          <TimesheetHoursChart data={chartData} />
        </ChartCard>

        <ChartCard
          title={TIMESHEET_COPY.statusTitle}
          description={TIMESHEET_COPY.statusDescription}
        >
          <TimesheetStatusChart data={statusChartData} />
        </ChartCard>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{TIMESHEET_COPY.tableTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {formatDate(periodConfig.start)} – {formatDate(periodConfig.end)}
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={TIMESHEET_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{TIMESHEET_COPY.allStatuses}</option>

              {Object.entries(TIMESHEET_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visibleTimesheets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Regular hours</TableHead>

                <TableHead>Overtime</TableHead>

                <TableHead>Breaks</TableHead>

                <TableHead>Missing</TableHead>

                <TableHead>Submitted</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleTimesheets.map((timesheet) => {
                const employee = EMPLOYEES.find(
                  (item) => item.id === timesheet.employeeId,
                );

                if (!employee) {
                  return null;
                }

                const totals = getTimesheetTotals(timesheet.days);

                const statusConfig = TIMESHEET_STATUS_CONFIG[timesheet.status];

                return (
                  <TableRow
                    key={timesheet.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => setSelectedTimesheetId(timesheet.id)}
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

                    <TableCell>{formatMinutesAsHours(totals.regularMinutes)}</TableCell>

                    <TableCell>{formatMinutesAsHours(totals.overtimeMinutes)}</TableCell>

                    <TableCell>{formatMinutesAsHours(totals.breakMinutes)}</TableCell>

                    <TableCell>
                      <span
                        className={
                          totals.missingEntries > 0 ? "font-bold text-danger" : ""
                        }
                      >
                        {totals.missingEntries}
                      </span>
                    </TableCell>

                    <TableCell>
                      {timesheet.submittedAt
                        ? formatDate(timesheet.submittedAt)
                        : "Not submitted"}
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
                        aria-label={`Open timesheet for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelectedTimesheetId(timesheet.id);
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
            <FileClock className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">{TIMESHEET_COPY.noResults}</h3>

            <p className="mt-2 text-sm text-text-muted">
              Change the branch, period or status filters.
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedTimesheet)}
        onClose={() => setSelectedTimesheetId(null)}
        title="Timesheet review"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedTimesheet ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedTimesheet.status === "submitted" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateTimesheetStatus(selectedTimesheet.id, "rejected")
                    }
                  >
                    <X />
                    Reject
                  </Button>

                  <Button
                    onClick={() =>
                      updateTimesheetStatus(selectedTimesheet.id, "approved")
                    }
                  >
                    <Check />
                    Approve
                  </Button>
                </>
              )}

              {selectedTimesheet.status === "approved" && (
                <Button
                  onClick={() => updateTimesheetStatus(selectedTimesheet.id, "locked")}
                >
                  <LockKeyhole />
                  Lock for payroll
                </Button>
              )}

              {selectedTimesheet.status === "rejected" && (
                <Button
                  onClick={() => updateTimesheetStatus(selectedTimesheet.id, "submitted")}
                >
                  Resubmit timesheet
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedTimesheet && selectedEmployee && (
          <TimesheetDetails timesheet={selectedTimesheet} employee={selectedEmployee} />
        )}
      </Drawer>
    </div>
  );
}
