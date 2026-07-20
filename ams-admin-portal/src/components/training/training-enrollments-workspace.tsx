"use client";

import { type MouseEvent, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  CircleAlert,
  Download,
  FileSearch,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DetailGrid } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { TrainingEnrollmentForm } from "@/components/training/training-enrollment-form";
import { TrainingTabs } from "@/components/training/training-tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TRAINING_COPY, TRAINING_ENROLLMENT_STATUS_CONFIG } from "@/config/training";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import { TRAINING_COURSES, TRAINING_ENROLLMENTS } from "@/data/training";
import { formatDate } from "@/lib/date";
import { calculateCompletionRate, downloadTrainingCsv } from "@/lib/training";
import type { TrainingEnrollment, TrainingEnrollmentStatus } from "@/types/training";

export function TrainingEnrollmentsWorkspace() {
  const { selectedBranch } = useBranchScope();

  const [enrollments, setEnrollments] =
    useState<TrainingEnrollment[]>(TRAINING_ENROLLMENTS);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [courseFilter, setCourseFilter] = useState("all");

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const scopedEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          selectedBranch.isAggregate || enrollment.branchId === selectedBranch.id,
      ),
    [enrollments, selectedBranch],
  );

  const visibleEnrollments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedEnrollments.filter((enrollment) => {
      const employee = EMPLOYEES.find((item) => item.id === enrollment.employeeId);

      const course = TRAINING_COURSES.find((item) => item.id === enrollment.courseId);

      if (!employee || !course) {
        return false;
      }

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        course.title,
        course.code,
        enrollment.certificateId,
        enrollment.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (statusFilter === "all" || enrollment.status === statusFilter) &&
        (courseFilter === "all" || enrollment.courseId === courseFilter)
      );
    });
  }, [courseFilter, scopedEnrollments, searchQuery, statusFilter]);

  const selectedEnrollment =
    enrollments.find((enrollment) => enrollment.id === selectedEnrollmentId) ?? null;

  const selectedEmployee = selectedEnrollment
    ? EMPLOYEES.find((employee) => employee.id === selectedEnrollment.employeeId)
    : null;

  const selectedCourse = selectedEnrollment
    ? TRAINING_COURSES.find((course) => course.id === selectedEnrollment.courseId)
    : null;

  const assignedCount = scopedEnrollments.filter(
    (enrollment) => enrollment.status === "assigned",
  ).length;

  const inProgressCount = scopedEnrollments.filter(
    (enrollment) => enrollment.status === "in_progress",
  ).length;

  const completedCount = scopedEnrollments.filter(
    (enrollment) => enrollment.status === "completed",
  ).length;

  const overdueCount = scopedEnrollments.filter(
    (enrollment) => enrollment.status === "overdue",
  ).length;

  const completionRate = calculateCompletionRate(
    completedCount,
    scopedEnrollments.filter((enrollment) => enrollment.status !== "cancelled").length,
  );

  const completionQueue = scopedEnrollments
    .filter(
      (enrollment) =>
        enrollment.status === "overdue" ||
        (["assigned", "in_progress"].includes(enrollment.status) &&
          enrollment.dueDate <= "2026-07-31"),
    )
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));

  const metrics = [
    {
      label: "Assigned",
      value: String(assignedCount),
      detail: selectedBranch.name,
      icon: Users,
      tone: "info" as const,
    },
    {
      label: "In progress",
      value: String(inProgressCount),
      detail: "Employees currently learning",
      icon: Play,
      tone: "warning" as const,
    },
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      detail: `${completedCount} completed assignments`,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Overdue",
      value: String(overdueCount),
      detail: "Requires manager follow-up",
      icon: CircleAlert,
      tone: "danger" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<TrainingEnrollment>[]>(
    () => [
      {
        id: "employee",
        header: TRAINING_COPY.enrollments.columns.employee,
        cell: (enrollment) => {
          const employee = EMPLOYEES.find((item) => item.id === enrollment.employeeId);

          if (!employee) {
            return "Employee unavailable";
          }

          return (
            <div className="flex items-center gap-3">
              <Avatar name={employee.name} initials={employee.initials} />

              <div>
                <p className="font-semibold">{employee.name}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {employee.employeeCode} Â· {employee.department}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "course",
        header: TRAINING_COPY.enrollments.columns.course,
        cell: (enrollment) => {
          const course = TRAINING_COURSES.find((item) => item.id === enrollment.courseId);

          return course ? (
            <div>
              <p className="font-semibold">{course.title}</p>

              <p className="mt-1 text-xs text-text-muted">{course.code}</p>
            </div>
          ) : (
            "Course unavailable"
          );
        },
      },
      {
        id: "assigned",
        header: TRAINING_COPY.enrollments.columns.assigned,
        cell: (enrollment) => formatDate(enrollment.assignedDate),
      },
      {
        id: "due",
        header: TRAINING_COPY.enrollments.columns.due,
        cell: (enrollment) => formatDate(enrollment.dueDate),
      },
      {
        id: "progress",
        header: TRAINING_COPY.enrollments.columns.progress,
        className: "min-w-44",
        cell: (enrollment) => (
          <ProgressBar
            value={enrollment.progress}
            tone={
              enrollment.status === "overdue"
                ? "danger"
                : enrollment.status === "completed"
                  ? "success"
                  : "info"
            }
          />
        ),
      },
      {
        id: "score",
        header: TRAINING_COPY.enrollments.columns.score,
        cell: (enrollment) =>
          enrollment.score !== undefined ? `${enrollment.score}%` : "â€”",
      },
      {
        id: "status",
        header: TRAINING_COPY.enrollments.columns.status,
        cell: (enrollment) => (
          <Badge
            variant={TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].badgeVariant}
          >
            {TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: TRAINING_COPY.enrollments.columns.actions,
        headClassName: "w-16",
        cell: (enrollment) => {
          const employee = EMPLOYEES.find((item) => item.id === enrollment.employeeId);

          return (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Open training enrollment for ${employee?.name ?? "employee"}`}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                setSelectedEnrollmentId(enrollment.id);
              }}
            >
              <MoreHorizontal />
            </Button>
          );
        },
      },
    ],
    [],
  );

  function saveEnrollment(enrollment: TrainingEnrollment) {
    setEnrollments((currentEnrollments) => [enrollment, ...currentEnrollments]);
    setCreateOpen(false);
    setSelectedEnrollmentId(enrollment.id);
  }

  function updateStatus(enrollmentId: string, status: TrainingEnrollmentStatus) {
    setEnrollments((currentEnrollments) =>
      currentEnrollments.map((enrollment) => {
        if (enrollment.id !== enrollmentId) {
          return enrollment;
        }

        if (status === "in_progress") {
          return {
            ...enrollment,
            status,
            startedAt: enrollment.startedAt ?? new Date().toISOString().slice(0, 10),
            progress: Math.max(enrollment.progress, 5),
            attempts: Math.max(enrollment.attempts, 1),
          };
        }

        if (status === "completed") {
          const course = TRAINING_COURSES.find((item) => item.id === enrollment.courseId);

          return {
            ...enrollment,
            status,
            progress: 100,
            score: enrollment.score ?? course?.passingScore ?? 100,
            completedAt: new Date().toISOString().slice(0, 10),
            certificateId:
              enrollment.certificateId ?? `CERT-${enrollment.id.toUpperCase()}`,
          };
        }

        if (status === "assigned") {
          return {
            ...enrollment,
            status,
            completedAt: undefined,
            certificateId: undefined,
            progress: enrollment.progress === 100 ? 0 : enrollment.progress,
          };
        }

        return {
          ...enrollment,
          status,
        };
      }),
    );
  }

  function exportEnrollments() {
    downloadTrainingCsv(
      "training-enrollments.csv",
      [
        "Employee",
        "Employee code",
        "Course",
        "Assigned date",
        "Due date",
        "Progress",
        "Score",
        "Status",
        "Certificate",
      ],
      visibleEnrollments.map((enrollment) => {
        const employee = EMPLOYEES.find((item) => item.id === enrollment.employeeId);
        const course = TRAINING_COURSES.find((item) => item.id === enrollment.courseId);

        return [
          employee?.name ?? "",
          employee?.employeeCode ?? "",
          course?.title ?? "",
          enrollment.assignedDate,
          enrollment.dueDate,
          enrollment.progress,
          enrollment.score ?? "",
          TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].label,
          enrollment.certificateId ?? "",
        ];
      }),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={TRAINING_COPY.eyebrow}
        title={TRAINING_COPY.enrollments.title}
        description={TRAINING_COPY.enrollments.description}
        actions={
          <>
            <Button variant="outline" onClick={exportEnrollments}>
              <Download />
              {TRAINING_COPY.enrollments.exportAction}
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              {TRAINING_COPY.enrollments.createAction}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <TrainingTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">
              {TRAINING_COPY.enrollments.registerTitle}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              {TRAINING_COPY.enrollments.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_16rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={TRAINING_COPY.enrollments.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{TRAINING_COPY.enrollments.allStatuses}</option>

                {Object.entries(TRAINING_ENROLLMENT_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>

              <Select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
              >
                <option value="all">{TRAINING_COPY.enrollments.allCourses}</option>

                {TRAINING_COURSES.filter(
                  (course) =>
                    selectedBranch.isAggregate ||
                    course.scope === "organization" ||
                    course.branchId === selectedBranch.id,
                ).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DataTable
            rows={visibleEnrollments}
            columns={columns}
            getRowKey={(enrollment) => enrollment.id}
            onRowClick={(enrollment) => setSelectedEnrollmentId(enrollment.id)}
            emptyState={
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <FileSearch className="size-8 text-text-muted" />

                <h3 className="mt-4 font-bold">{TRAINING_COPY.enrollments.emptyTitle}</h3>

                <p className="mt-2 text-sm text-text-muted">
                  {TRAINING_COPY.enrollments.emptyDescription}
                </p>
              </div>
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <CircleAlert size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {TRAINING_COPY.enrollments.attentionTitle}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {TRAINING_COPY.enrollments.attentionDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {completionQueue.length > 0 ? (
              completionQueue.map((enrollment) => {
                const employee = EMPLOYEES.find(
                  (item) => item.id === enrollment.employeeId,
                );
                const course = TRAINING_COURSES.find(
                  (item) => item.id === enrollment.courseId,
                );

                if (!employee || !course) {
                  return null;
                }

                return (
                  <button
                    key={enrollment.id}
                    type="button"
                    onClick={() => setSelectedEnrollmentId(enrollment.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{employee.name}</p>

                        <p className="mt-1 text-xs text-text-muted">{course.title}</p>
                      </div>

                      <Badge
                        variant={
                          TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status]
                            .badgeVariant
                        }
                      >
                        {TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].label}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <ProgressBar
                        value={enrollment.progress}
                        tone={enrollment.status === "overdue" ? "danger" : "warning"}
                      />
                    </div>

                    <p className="mt-3 text-xs text-text-muted">
                      Due {formatDate(enrollment.dueDate)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No training assignments currently require follow-up.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedEnrollment && selectedEmployee && selectedCourse)}
        onClose={() => setSelectedEnrollmentId(null)}
        title="Training enrollment"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} Â· ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedEnrollment ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedEnrollment.status === "assigned" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedEnrollment.id, "cancelled")}
                  >
                    <X />
                    Cancel assignment
                  </Button>

                  <Button
                    onClick={() => updateStatus(selectedEnrollment.id, "in_progress")}
                  >
                    <Play />
                    Start training
                  </Button>
                </>
              )}

              {["in_progress", "overdue"].includes(selectedEnrollment.status) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedEnrollment.id, "cancelled")}
                  >
                    <X />
                    Cancel assignment
                  </Button>

                  <Button
                    onClick={() => updateStatus(selectedEnrollment.id, "completed")}
                  >
                    <CheckCircle2 />
                    Mark completed
                  </Button>
                </>
              )}

              {selectedEnrollment.status === "cancelled" && (
                <Button onClick={() => updateStatus(selectedEnrollment.id, "assigned")}>
                  <RotateCcw />
                  Reopen assignment
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedEnrollment && selectedEmployee && selectedCourse && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedCourse.title}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    {selectedCourse.code} Â· Assigned{" "}
                    {formatDate(selectedEnrollment.assignedDate)}
                  </p>
                </div>

                <Badge
                  variant={
                    TRAINING_ENROLLMENT_STATUS_CONFIG[selectedEnrollment.status]
                      .badgeVariant
                  }
                >
                  {TRAINING_ENROLLMENT_STATUS_CONFIG[selectedEnrollment.status].label}
                </Badge>
              </div>

              <DetailGrid
                bordered={false}
                items={[
                  {
                    label: "Employee branch",
                    value: selectedEmployee.branchName,
                  },
                  {
                    label: "Due date",
                    value: formatDate(selectedEnrollment.dueDate),
                  },
                  {
                    label: "Started date",
                    value: selectedEnrollment.startedAt
                      ? formatDate(selectedEnrollment.startedAt)
                      : "Not started",
                  },
                  {
                    label: "Completed date",
                    value: selectedEnrollment.completedAt
                      ? formatDate(selectedEnrollment.completedAt)
                      : "Not completed",
                  },
                  {
                    label: "Score",
                    value:
                      selectedEnrollment.score !== undefined
                        ? `${selectedEnrollment.score}%`
                        : "Not scored",
                  },
                  {
                    label: "Attempts",
                    value: selectedEnrollment.attempts,
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Completion progress</h3>

              <ProgressBar
                className="mt-4"
                value={selectedEnrollment.progress}
                tone={
                  selectedEnrollment.status === "overdue"
                    ? "danger"
                    : selectedEnrollment.status === "completed"
                      ? "success"
                      : "info"
                }
              />
            </section>

            {selectedEnrollment.certificateId && (
              <div className="flex items-center gap-3 rounded-control bg-success-muted p-4 text-success">
                <Award className="size-5" />

                <div>
                  <p className="text-sm font-semibold">Certificate issued</p>

                  <p className="mt-1 text-xs">{selectedEnrollment.certificateId}</p>
                </div>
              </div>
            )}

            <section>
              <h3 className="text-sm font-bold">Assignment note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedEnrollment.note || "No assignment note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Assign training course"
        description="Assign a published course to an employee and set the completion deadline."
      >
        <TrainingEnrollmentForm
          courses={TRAINING_COURSES}
          selectedBranchId={selectedBranch.isAggregate ? "all" : selectedBranch.id}
          onCancel={() => setCreateOpen(false)}
          onSave={saveEnrollment}
        />
      </Drawer>
    </div>
  );
}
