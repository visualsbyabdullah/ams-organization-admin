"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { AttendanceRecordForm } from "@/components/attendance/attendance-record-form";
import { AttendanceTabs } from "@/components/attendance/attendance-tabs";
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
import { ATTENDANCE_STATUS_CONFIG } from "@/config/attendance";
import {
  ATTENDANCE_REGISTER_COPY,
  ATTENDANCE_SOURCE_CONFIG,
} from "@/config/attendance-register";
import { useBranchScope } from "@/context/branch-scope-context";
import {
  ATTENDANCE_REGISTER_RECORDS,
  getAttendanceCalendar,
} from "@/data/attendance-register";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import type { AttendanceRecord } from "@/types/attendance";
import type { AttendanceRegisterRecord } from "@/types/attendance-register";

function formatWorkedTime(minutes: number) {
  if (minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function formatTotalHours(minutes: number) {
  const hours = Math.floor(minutes / 60);

  return `${hours.toLocaleString()}h`;
}

export function AttendanceRegister() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [records, setRecords] = useState<AttendanceRegisterRecord[]>(
    ATTENDANCE_REGISTER_RECORDS,
  );

  const [selectedDate, setSelectedDate] = useState("2026-07-16");

  const [searchQuery, setSearchQuery] = useState("");

  const [department, setDepartment] = useState("all");

  const [status, setStatus] = useState("all");

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const calendarDays = useMemo(
    () => getAttendanceCalendar(selectedBranchId),
    [selectedBranchId],
  );

  const selectedCalendarDay =
    calendarDays.find((day) => day.date === selectedDate) ?? calendarDays.at(-1);

  const branchRecords = useMemo(
    () =>
      records.filter(
        (record) => selectedBranch.isAggregate || record.branchId === selectedBranch.id,
      ),
    [records, selectedBranch],
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          EMPLOYEES.filter(
            (employee) =>
              selectedBranch.isAggregate || employee.branchId === selectedBranch.id,
          ).map((employee) => employee.department),
        ),
      ).sort(),
    [selectedBranch],
  );

  const visibleRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return branchRecords.filter((record) => {
      const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

      if (!employee) {
        return false;
      }

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        employee.email,
      ]
        .join(" ")
        .toLowerCase();

      const matchesDate = record.date === selectedDate;

      const matchesSearch = searchableValue.includes(query);

      const matchesDepartment =
        department === "all" || employee.department === department;

      const matchesStatus = status === "all" || record.status === status;

      return matchesDate && matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [branchRecords, department, searchQuery, selectedDate, status]);

  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? null;

  const totalWorkedMinutes = branchRecords.reduce(
    (total, record) => total + record.workedMinutes,
    0,
  );

  const exceptionCount = branchRecords.filter((record) => record.hasException).length;

  const averageAttendanceRate =
    calendarDays.length > 0
      ? Math.round(
          calendarDays.reduce((total, day) => total + day.attendanceRate, 0) /
            calendarDays.length,
        )
      : 0;

  const metrics = [
    {
      label: "Monthly records",
      value: branchRecords.length,
      detail: selectedBranch.name,
      icon: CalendarDays,
      tone: "info" as const,
    },
    {
      label: "Total worked",
      value: formatTotalHours(totalWorkedMinutes),
      detail: "Recorded employee hours",
      icon: Clock3,
      tone: "success" as const,
    },
    {
      label: "Average attendance",
      value: `${averageAttendanceRate}%`,
      detail: "Current month",
      icon: UserCheck,
      tone: "success" as const,
    },
    {
      label: "Exceptions",
      value: exceptionCount,
      detail: "Records requiring review",
      icon: AlertTriangle,
      tone: "warning" as const,
    },
  ];

  function saveRecord(updatedRecord: AttendanceRecord) {
    setRecords((currentRecords) => {
      const existingRecord = currentRecords.find(
        (record) => record.id === updatedRecord.id,
      );

      const hasException = ["late", "absent", "missing_checkout"].includes(
        updatedRecord.status,
      );

      const nextRecord: AttendanceRegisterRecord = {
        ...updatedRecord,
        source: existingRecord?.source ?? "manual",
        hasException,
      };

      const exists = currentRecords.some((record) => record.id === updatedRecord.id);

      return exists
        ? currentRecords.map((record) =>
            record.id === updatedRecord.id ? nextRecord : record,
          )
        : [nextRecord, ...currentRecords];
    });

    setSelectedRecordId(null);
    setCreateOpen(false);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={ATTENDANCE_REGISTER_COPY.eyebrow}
        title={ATTENDANCE_REGISTER_COPY.title}
        description={ATTENDANCE_REGISTER_COPY.description}
        actions={
          <>
            <Button variant="outline">
              <Download />
              {ATTENDANCE_REGISTER_COPY.export}
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              {ATTENDANCE_REGISTER_COPY.addRecord}
            </Button>
          </>
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div>
            <h2 className="text-lg font-bold">
              {ATTENDANCE_REGISTER_COPY.calendarTitle}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              {ATTENDANCE_REGISTER_COPY.calendarDescription}
            </p>
          </div>

          <div className="mt-6">
            <AttendanceCalendar
              days={calendarDays}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-semibold text-primary">
              {ATTENDANCE_REGISTER_COPY.selectedDayTitle}
            </p>

            <h2 className="mt-2 text-xl font-bold">{formatDate(selectedDate)}</h2>

            <p className="mt-1 text-sm text-text-muted">{selectedBranch.name}</p>
          </div>

          {selectedCalendarDay && (
            <div className="mt-6 space-y-3">
              {[
                {
                  label: "Attendance rate",
                  value: `${selectedCalendarDay.attendanceRate}%`,
                },
                {
                  label: "Scheduled",
                  value: selectedCalendarDay.scheduled,
                },
                {
                  label: "Present",
                  value: selectedCalendarDay.present,
                },
                {
                  label: "Late",
                  value: selectedCalendarDay.late,
                },
                {
                  label: "Absent",
                  value: selectedCalendarDay.absent,
                },
                {
                  label: "On leave",
                  value: selectedCalendarDay.onLeave,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-control bg-canvas px-4 py-3"
                >
                  <span className="text-sm text-text-muted">{item.label}</span>

                  <strong className="text-sm">{item.value}</strong>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold">{ATTENDANCE_REGISTER_COPY.tableTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {formatDate(selectedDate)} · {selectedBranch.name}
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_13rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={ATTENDANCE_REGISTER_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="all">{ATTENDANCE_REGISTER_COPY.allDepartments}</option>

              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">{ATTENDANCE_REGISTER_COPY.allStatuses}</option>

              {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visibleRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Schedule</TableHead>

                <TableHead>Check in</TableHead>

                <TableHead>Check out</TableHead>

                <TableHead>Worked</TableHead>

                <TableHead>Source</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRecords.map((record) => {
                const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

                if (!employee) {
                  return null;
                }

                const statusConfig = ATTENDANCE_STATUS_CONFIG[record.status];

                const sourceConfig = ATTENDANCE_SOURCE_CONFIG[record.source];

                return (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => setSelectedRecordId(record.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.name} initials={employee.initials} />

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{employee.name}</p>

                            {record.hasException && (
                              <AlertTriangle className="size-3.5 text-warning" />
                            )}
                          </div>

                          <p className="mt-1 text-xs text-text-muted">
                            {employee.employeeCode} · {employee.department}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {record.scheduledStart} – {record.scheduledEnd}
                    </TableCell>

                    <TableCell>{record.checkIn || "—"}</TableCell>

                    <TableCell>{record.checkOut || "—"}</TableCell>

                    <TableCell>{formatWorkedTime(record.workedMinutes)}</TableCell>

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
                        aria-label={`Edit attendance for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelectedRecordId(record.id);
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
            <Users className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">{ATTENDANCE_REGISTER_COPY.noRecordsTitle}</h3>

            <p className="mt-2 max-w-md text-sm text-text-muted">
              {ATTENDANCE_REGISTER_COPY.noRecordsDescription}
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecordId(null)}
        title="Edit attendance record"
        description="Correct employee attendance timing, status or notes."
      >
        {selectedRecord && (
          <AttendanceRecordForm
            key={selectedRecord.id}
            record={selectedRecord}
            selectedBranchId={selectedBranchId}
            onCancel={() => setSelectedRecordId(null)}
            onSave={saveRecord}
          />
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add attendance record"
        description="Create a manual attendance entry for the selected organization scope."
      >
        <AttendanceRecordForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onSave={saveRecord}
        />
      </Drawer>
    </div>
  );
}
