"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  UserCheck,
  UserMinus,
} from "lucide-react";

import { AttendanceTabs } from "@/components/attendance/attendance-tabs";
import { ScheduleAssignmentForm } from "@/components/attendance/schedule-assignment-form";
import { ScheduleWeekGrid } from "@/components/attendance/schedule-week-grid";
import { ShiftTemplateForm } from "@/components/attendance/shift-template-form";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SCHEDULE_COPY,
  SCHEDULE_STATUS_CONFIG,
  SCHEDULE_WEEK_DAYS,
  SHIFT_CATEGORY_CONFIG,
  SHIFT_STATUS_CONFIG,
} from "@/config/schedules";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import { SCHEDULE_ASSIGNMENTS, SHIFT_TEMPLATES } from "@/data/schedules";
import { formatDate } from "@/lib/date";
import { formatMinutesAsHours } from "@/lib/time";
import type {
  ScheduleAssignment,
  ScheduleAssignmentStatus,
  ShiftTemplate,
} from "@/types/schedule";

export function SchedulesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [shifts, setShifts] = useState<ShiftTemplate[]>(SHIFT_TEMPLATES);

  const [assignments, setAssignments] =
    useState<ScheduleAssignment[]>(SCHEDULE_ASSIGNMENTS);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);

  const [shiftEditorOpen, setShiftEditorOpen] = useState(false);

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const weekDates = useMemo(
    () => new Set<string>(SCHEDULE_WEEK_DAYS.map((day) => day.date)),
    [],
  );

  const scopedEmployees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          selectedBranch.isAggregate || employee.branchId === selectedBranch.id,
      ),
    [selectedBranch],
  );

  const visibleEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedEmployees.filter((employee) =>
      [employee.name, employee.employeeCode, employee.department, employee.designation]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [scopedEmployees, searchQuery]);

  const scopedAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          weekDates.has(assignment.date) &&
          (selectedBranch.isAggregate || assignment.branchId === selectedBranch.id),
      ),
    [assignments, selectedBranch, weekDates],
  );

  const visibleAssignments = useMemo(
    () =>
      scopedAssignments.filter(
        (assignment) => statusFilter === "all" || assignment.status === statusFilter,
      ),
    [scopedAssignments, statusFilter],
  );

  const selectedAssignment =
    assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null;

  const selectedEmployee = selectedAssignment
    ? EMPLOYEES.find((employee) => employee.id === selectedAssignment.employeeId)
    : null;

  const selectedAssignmentShift = selectedAssignment
    ? shifts.find((shift) => shift.id === selectedAssignment.shiftId)
    : null;

  const selectedShift = shifts.find((shift) => shift.id === selectedShiftId) ?? null;

  const scheduledEmployeeIds = new Set(
    scopedAssignments.map((assignment) => assignment.employeeId),
  );

  const unassignedEmployees = scopedEmployees.filter(
    (employee) => !scheduledEmployeeIds.has(employee.id),
  );

  const metrics = [
    {
      label: "Scheduled employees",
      value: scheduledEmployeeIds.size,
      detail: selectedBranch.name,
      icon: UserCheck,
      tone: "success" as const,
    },
    {
      label: "Unassigned employees",
      value: unassignedEmployees.length,
      detail: "No shift in selected week",
      icon: UserMinus,
      tone: "warning" as const,
    },
    {
      label: "Schedule conflicts",
      value: scopedAssignments.filter((assignment) => assignment.status === "conflict")
        .length,
      detail: "Require administrator review",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
    {
      label: "Active shifts",
      value: shifts.filter((shift) => shift.status === "active").length,
      detail: "Reusable shift templates",
      icon: CalendarClock,
      tone: "info" as const,
    },
  ];

  function saveAssignments(nextAssignments: ScheduleAssignment[]) {
    const replacementKeys = new Set(
      nextAssignments.map((assignment) => `${assignment.employeeId}-${assignment.date}`),
    );

    setAssignments((currentAssignments) => [
      ...currentAssignments.filter(
        (assignment) =>
          !replacementKeys.has(`${assignment.employeeId}-${assignment.date}`),
      ),
      ...nextAssignments,
    ]);

    setAssignmentFormOpen(false);
  }

  function saveShift(nextShift: ShiftTemplate) {
    setShifts((currentShifts) => {
      const exists = currentShifts.some((shift) => shift.id === nextShift.id);

      return exists
        ? currentShifts.map((shift) => (shift.id === nextShift.id ? nextShift : shift))
        : [nextShift, ...currentShifts];
    });

    setShiftEditorOpen(false);
    setSelectedShiftId(null);
  }

  function updateAssignmentStatus(
    assignmentId: string,
    status: ScheduleAssignmentStatus,
  ) {
    setAssignments((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status,
            }
          : assignment,
      ),
    );
  }

  function removeAssignment(assignmentId: string) {
    setAssignments((currentAssignments) =>
      currentAssignments.filter((assignment) => assignment.id !== assignmentId),
    );

    setSelectedAssignmentId(null);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SCHEDULE_COPY.eyebrow}
        title={SCHEDULE_COPY.title}
        description={SCHEDULE_COPY.description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedShiftId(null);
                setShiftEditorOpen(true);
              }}
            >
              <Settings2 />
              {SCHEDULE_COPY.createShift}
            </Button>

            <Button onClick={() => setAssignmentFormOpen(true)}>
              <Plus />
              {SCHEDULE_COPY.assignSchedule}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <AttendanceTabs />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{SCHEDULE_COPY.weekLabel}</p>

          <p className="mt-1 text-xs text-text-muted">{selectedBranch.name}</p>
        </div>

        <Badge variant="neutral">Weekly roster</Badge>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{SCHEDULE_COPY.rosterTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {SCHEDULE_COPY.rosterDescription}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={SCHEDULE_COPY.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{SCHEDULE_COPY.allStatuses}</option>

                {Object.entries(SCHEDULE_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {visibleEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <ScheduleWeekGrid
                employees={visibleEmployees}
                assignments={visibleAssignments}
                shifts={shifts}
                days={SCHEDULE_WEEK_DAYS}
                onSelect={setSelectedAssignmentId}
              />
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <CalendarClock className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">No employees found</h3>

              <p className="mt-2 text-sm text-text-muted">
                Change the branch or search filters.
              </p>
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h2 className="text-lg font-bold">{SCHEDULE_COPY.shiftsTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {SCHEDULE_COPY.shiftsDescription}
          </p>

          <div className="mt-5 space-y-3">
            {shifts.map((shift) => {
              const categoryConfig = SHIFT_CATEGORY_CONFIG[shift.category];

              const statusConfig = SHIFT_STATUS_CONFIG[shift.status];

              const assignedCount = scopedAssignments.filter(
                (assignment) => assignment.shiftId === shift.id,
              ).length;

              return (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => {
                    setSelectedShiftId(shift.id);

                    setShiftEditorOpen(true);
                  }}
                  className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={categoryConfig.badgeVariant}>{shift.code}</Badge>

                    <MoreHorizontal className="size-4 text-text-muted" />
                  </div>

                  <p className="mt-3 text-sm font-bold">{shift.name}</p>

                  <p className="mt-1 text-xs text-text-muted">
                    {shift.startTime} – {shift.endTime}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Badge variant={statusConfig.badgeVariant}>
                      {statusConfig.label}
                    </Badge>

                    <span className="text-xs text-text-muted">
                      {assignedCount} assignments
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignmentId(null)}
        title="Schedule assignment"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedAssignment ? (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => removeAssignment(selectedAssignment.id)}
              >
                Remove assignment
              </Button>

              {selectedAssignment.status !== "confirmed" && (
                <Button
                  onClick={() =>
                    updateAssignmentStatus(selectedAssignment.id, "confirmed")
                  }
                >
                  <Check />
                  Confirm schedule
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedAssignment && selectedEmployee && selectedAssignmentShift && (
          <div className="space-y-5">
            <section className="rounded-card border border-border">
              <div className="border-b border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{selectedAssignmentShift.name}</h3>

                    <p className="mt-1 text-xs text-text-muted">
                      {selectedAssignmentShift.code}
                    </p>
                  </div>

                  <Badge
                    variant={
                      SCHEDULE_STATUS_CONFIG[selectedAssignment.status].badgeVariant
                    }
                  >
                    {SCHEDULE_STATUS_CONFIG[selectedAssignment.status].label}
                  </Badge>
                </div>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Schedule date</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(selectedAssignment.date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Working time</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedAssignmentShift.startTime} –{" "}
                    {selectedAssignmentShift.endTime}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Break</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedAssignmentShift.breakMinutes} minutes
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Working hours</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatMinutesAsHours(selectedAssignmentShift.workingMinutes)}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Schedule note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedAssignment.note ||
                  "No note was added to this schedule assignment."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={assignmentFormOpen}
        onClose={() => setAssignmentFormOpen(false)}
        title="Assign employee schedule"
        description="Apply a shift template across selected dates and working days."
      >
        <ScheduleAssignmentForm
          shifts={shifts.filter((shift) => shift.status === "active")}
          selectedBranchId={selectedBranchId}
          onCancel={() => setAssignmentFormOpen(false)}
          onSave={saveAssignments}
        />
      </Drawer>

      <Drawer
        open={shiftEditorOpen}
        onClose={() => {
          setShiftEditorOpen(false);
          setSelectedShiftId(null);
        }}
        title={selectedShift ? "Edit shift template" : "Create shift template"}
        description="Configure reusable shift timing, break duration and category."
      >
        <ShiftTemplateForm
          key={selectedShift?.id ?? "new-shift"}
          shift={selectedShift ?? undefined}
          onCancel={() => {
            setShiftEditorOpen(false);
            setSelectedShiftId(null);
          }}
          onSave={saveShift}
        />
      </Drawer>
    </div>
  );
}
