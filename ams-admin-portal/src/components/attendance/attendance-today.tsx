"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  CalendarCheck2,
  Clock3,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { AttendanceRecordForm } from "@/components/attendance/attendance-record-form";
import { AttendanceTabs } from "@/components/attendance/attendance-tabs";
import { AttendanceTrendChart } from "@/components/attendance/attendance-trend-chart";
import { DepartmentAttendanceChart } from "@/components/attendance/department-attendance-chart";
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
  ATTENDANCE_COPY,
  ATTENDANCE_STATUS_CONFIG,
} from "@/config/attendance";
import { useBranchScope } from "@/context/branch-scope-context";
import {
  ATTENDANCE_RECORDS,
  ATTENDANCE_SUMMARIES,
  ATTENDANCE_TRENDS,
  DEPARTMENT_ATTENDANCE,
} from "@/data/attendance";
import { EMPLOYEES } from "@/data/employees";
import type {
  AttendanceRecord,
} from "@/types/attendance";

function formatWorkedTime(
  minutes: number,
) {
  if (minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const remainingMinutes =
    minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function formatAttendanceDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

export function AttendanceToday() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [records, setRecords] =
    useState<AttendanceRecord[]>(
      ATTENDANCE_RECORDS,
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    selectedRecordId,
    setSelectedRecordId,
  ] = useState<string | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const selectedRecord =
    records.find(
      (record) =>
        record.id === selectedRecordId,
    ) ?? null;

  const visibleRecords = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return records.filter((record) => {
      const employee = EMPLOYEES.find(
        (item) =>
          item.id === record.employeeId,
      );

      const matchesBranch =
        selectedBranch.isAggregate ||
        record.branchId ===
          selectedBranch.id;

      const searchableValue = [
        employee?.name,
        employee?.employeeCode,
        employee?.department,
        employee?.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableValue.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        record.status === statusFilter;

      return (
        matchesBranch &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    records,
    searchQuery,
    selectedBranch,
    statusFilter,
  ]);

  const summary =
    ATTENDANCE_SUMMARIES[
      selectedBranchId
    ] ?? ATTENDANCE_SUMMARIES.all;

  const trend =
    ATTENDANCE_TRENDS[
      selectedBranchId
    ] ?? ATTENDANCE_TRENDS.all;

  const departmentData =
    DEPARTMENT_ATTENDANCE[
      selectedBranchId
    ] ??
    DEPARTMENT_ATTENDANCE.all;

  const exceptionRecords =
    visibleRecords.filter(
      (record) =>
        record.status === "late" ||
        record.status === "absent" ||
        record.status ===
          "missing_checkout",
    );

  const metrics = [
    {
      label: "Scheduled today",
      value: String(
        summary.scheduled,
      ),
      detail: selectedBranch.name,
      icon: Users,
      tone: "info" as const,
    },
    {
      label: "Present",
      value: String(summary.present),
      detail: `${Math.round(
        (summary.present /
          summary.scheduled) *
          100,
      )}% attendance rate`,
      icon: UserCheck,
      tone: "success" as const,
    },
    {
      label: "Late arrivals",
      value: String(summary.late),
      detail: "Require attendance review",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Absent",
      value: String(summary.absent),
      detail: `${summary.onLeave} employees on leave`,
      icon: UserX,
      tone: "danger" as const,
    },
    {
      label: "Missing checkouts",
      value: String(
        summary.missingCheckout,
      ),
      detail: "Incomplete attendance records",
      icon: AlertTriangle,
      tone: "warning" as const,
    },
  ];

  function saveRecord(
    updatedRecord: AttendanceRecord,
  ) {
    setRecords((currentRecords) => {
      const exists =
        currentRecords.some(
          (record) =>
            record.id ===
            updatedRecord.id,
        );

      return exists
        ? currentRecords.map((record) =>
            record.id ===
            updatedRecord.id
              ? updatedRecord
              : record,
          )
        : [
            updatedRecord,
            ...currentRecords,
          ];
    });

    setCreateOpen(false);
    setSelectedRecordId(null);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          ATTENDANCE_COPY.eyebrow
        }
        title={ATTENDANCE_COPY.title}
        description={
          ATTENDANCE_COPY.description
        }
        actions={
          <>
            <Button variant="outline">
              <Download />
              {ATTENDANCE_COPY.export}
            </Button>

            <Button
              onClick={() =>
                setCreateOpen(true)
              }
            >
              <Plus />
              {ATTENDANCE_COPY.addRecord}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <AttendanceTabs />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-text-muted">
        <CalendarCheck2 size={17} />

        <span>
          {ATTENDANCE_COPY.viewingDate}{" "}
          <strong className="text-text">
            {formatAttendanceDate(
              "2026-07-16",
            )}
          </strong>
        </span>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={
            ATTENDANCE_COPY
              .attendanceTrend.title
          }
          description={
            ATTENDANCE_COPY
              .attendanceTrend.description
          }
        >
          <AttendanceTrendChart
            data={trend}
          />
        </ChartCard>

        <Card className="p-6">
          <div>
            <h2 className="text-lg font-bold">
              {
                ATTENDANCE_COPY.exceptions
                  .title
              }
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              {
                ATTENDANCE_COPY.exceptions
                  .description
              }
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {exceptionRecords.length >
            0 ? (
              exceptionRecords.map(
                (record) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        record.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  const config =
                    ATTENDANCE_STATUS_CONFIG[
                      record.status
                    ];

                  return (
                    <button
                      type="button"
                      key={record.id}
                      onClick={() =>
                        setSelectedRecordId(
                          record.id,
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {employee.name}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {
                            employee.department
                          }
                        </p>
                      </div>

                      <Badge
                        variant={
                          config.badgeVariant
                        }
                      >
                        {config.label}
                      </Badge>
                    </button>
                  );
                },
              )
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm text-success">
                No attendance exceptions in
                the current view.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <ChartCard
          title={
            ATTENDANCE_COPY
              .departmentChart.title
          }
          description={
            ATTENDANCE_COPY
              .departmentChart.description
          }
        >
          <DepartmentAttendanceChart
            data={departmentData}
          />
        </ChartCard>
      </section>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

            <Input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value,
                )
              }
              placeholder={
                ATTENDANCE_COPY.searchPlaceholder
              }
              className="pl-9"
            />
          </div>

          <div className="lg:w-56">
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
                  ATTENDANCE_COPY.allStatuses
                }
              </option>

              {Object.entries(
                ATTENDANCE_STATUS_CONFIG,
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

        {visibleRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>
                  {
                    ATTENDANCE_COPY.table
                      .employee
                  }
                </TableHead>

                <TableHead>
                  {
                    ATTENDANCE_COPY.table
                      .schedule
                  }
                </TableHead>

                <TableHead>
                  {
                    ATTENDANCE_COPY.table
                      .checkIn
                  }
                </TableHead>

                <TableHead>
                  {
                    ATTENDANCE_COPY.table
                      .checkOut
                  }
                </TableHead>

                <TableHead>
                  {
                    ATTENDANCE_COPY.table
                      .worked
                  }
                </TableHead>

                <TableHead>
                  {
                    ATTENDANCE_COPY.table
                      .status
                  }
                </TableHead>

                <TableHead className="w-16">
                  {
                    ATTENDANCE_COPY.table
                      .actions
                  }
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRecords.map(
                (record) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        record.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  const statusConfig =
                    ATTENDANCE_STATUS_CONFIG[
                      record.status
                    ];

                  return (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer transition hover:bg-canvas"
                      onClick={() =>
                        setSelectedRecordId(
                          record.id,
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
                        {
                          record.scheduledStart
                        }{" "}
                        –{" "}
                        {
                          record.scheduledEnd
                        }
                      </TableCell>

                      <TableCell>
                        {record.checkIn ||
                          "—"}
                      </TableCell>

                      <TableCell>
                        {record.checkOut ||
                          "—"}
                      </TableCell>

                      <TableCell>
                        {formatWorkedTime(
                          record.workedMinutes,
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
                          aria-label={`Edit attendance for ${employee.name}`}
                          onClick={(event) => {
                            event.stopPropagation();

                            setSelectedRecordId(
                              record.id,
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

            <h2 className="mt-4 font-bold">
              No attendance records found
            </h2>

            <p className="mt-2 text-sm text-text-muted">
              Change the filters or add an
              attendance record.
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedRecord)}
        onClose={() =>
          setSelectedRecordId(null)
        }
        title="Edit attendance"
        description="Correct attendance timings, status or administrator notes."
      >
        {selectedRecord && (
          <AttendanceRecordForm
            key={selectedRecord.id}
            record={selectedRecord}
            selectedBranchId={
              selectedBranchId
            }
            onCancel={() =>
              setSelectedRecordId(null)
            }
            onSave={saveRecord}
          />
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        title="Add attendance record"
        description="Create a manual attendance entry for an employee."
      >
        <AttendanceRecordForm
          selectedBranchId={
            selectedBranchId
          }
          onCancel={() =>
            setCreateOpen(false)
          }
          onSave={saveRecord}
        />
      </Drawer>
    </div>
  );
}
