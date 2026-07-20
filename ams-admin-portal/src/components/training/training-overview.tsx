"use client";

import { type MouseEvent, useMemo, useState } from "react";
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Download,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { TrainingActivityChart } from "@/components/training/training-activity-chart";
import { TrainingCourseForm } from "@/components/training/training-course-form";
import { TrainingTabs } from "@/components/training/training-tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import {
  TRAINING_COPY,
  TRAINING_ENROLLMENT_STATUS_CONFIG,
  TRAINING_REFERENCE_DATE,
} from "@/config/training";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import {
  TRAINING_COURSES,
  TRAINING_ENROLLMENTS,
  TRAINING_SESSIONS,
  TRAINING_TRENDS,
} from "@/data/training";
import { formatDate } from "@/lib/date";
import {
  calculateCompletionRate,
  downloadTrainingCsv,
  formatTrainingDuration,
} from "@/lib/training";
import type { TrainingCourse, TrainingEnrollment } from "@/types/training";

export function TrainingOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [courses, setCourses] = useState<TrainingCourse[]>(TRAINING_COURSES);

  const [enrollments] = useState<TrainingEnrollment[]>(TRAINING_ENROLLMENTS);

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const scopedCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          selectedBranch.isAggregate ||
          course.scope === "organization" ||
          course.branchId === selectedBranch.id,
      ),
    [courses, selectedBranch],
  );

  const scopedEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          selectedBranch.isAggregate || enrollment.branchId === selectedBranch.id,
      ),
    [enrollments, selectedBranch],
  );

  const activeEnrollments = scopedEnrollments.filter((enrollment) =>
    ["assigned", "in_progress", "overdue"].includes(enrollment.status),
  );

  const completedEnrollments = scopedEnrollments.filter(
    (enrollment) => enrollment.status === "completed",
  );

  const overdueEnrollments = scopedEnrollments.filter(
    (enrollment) => enrollment.status === "overdue",
  );

  const completionRate = calculateCompletionRate(
    completedEnrollments.length,
    scopedEnrollments.filter((enrollment) => enrollment.status !== "cancelled").length,
  );

  const publishedCourses = scopedCourses.filter(
    (course) => course.status === "published",
  );

  const upcomingSessions = TRAINING_SESSIONS.filter(
    (session) =>
      session.status === "scheduled" &&
      session.sessionDate >= TRAINING_REFERENCE_DATE &&
      (selectedBranch.isAggregate || session.branchId === selectedBranch.id),
  )
    .sort((first, second) => first.sessionDate.localeCompare(second.sessionDate))
    .slice(0, 4);

  const selectedEnrollment =
    enrollments.find((enrollment) => enrollment.id === selectedEnrollmentId) ?? null;

  const selectedEmployee = selectedEnrollment
    ? EMPLOYEES.find((employee) => employee.id === selectedEnrollment.employeeId)
    : null;

  const selectedCourse = selectedEnrollment
    ? courses.find((course) => course.id === selectedEnrollment.courseId)
    : null;

  const metrics = [
    {
      label: "Published courses",
      value: String(publishedCourses.length),
      detail: selectedBranch.name,
      icon: BookOpenCheck,
      tone: "info" as const,
    },
    {
      label: "Active enrollments",
      value: String(activeEnrollments.length),
      detail: "Assigned, underway or overdue",
      icon: Users,
      tone: "warning" as const,
    },
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      detail: "Non-cancelled assignments",
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Overdue training",
      value: String(overdueEnrollments.length),
      detail: "Requires follow-up",
      icon: CircleAlert,
      tone: "danger" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<TrainingEnrollment>[]>(
    () => [
      {
        id: "employee",
        header: "Employee",
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
        header: "Course",
        cell: (enrollment) => {
          const course = courses.find((item) => item.id === enrollment.courseId);

          return course ? (
            <div>
              <p className="font-semibold">{course.title}</p>

              <p className="mt-1 text-xs text-text-muted">
                {course.code} Â· {formatTrainingDuration(course.durationHours)}
              </p>
            </div>
          ) : (
            "Course unavailable"
          );
        },
      },
      {
        id: "due",
        header: "Due date",
        cell: (enrollment) => formatDate(enrollment.dueDate),
      },
      {
        id: "progress",
        header: "Progress",
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
        id: "status",
        header: "Status",
        cell: (enrollment) => (
          <Badge
            variant={TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].badgeVariant}
          >
            {TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].label}
          </Badge>
        ),
      },
    ],
    [courses],
  );

  function saveCourse(course: TrainingCourse) {
    setCourses((currentCourses) => [course, ...currentCourses]);
    setCreateOpen(false);
  }

  function exportData() {
    downloadTrainingCsv(
      "training-enrollments.csv",
      [
        "Employee",
        "Employee code",
        "Course",
        "Assigned date",
        "Due date",
        "Progress",
        "Status",
      ],
      scopedEnrollments.map((enrollment) => {
        const employee = EMPLOYEES.find((item) => item.id === enrollment.employeeId);
        const course = courses.find((item) => item.id === enrollment.courseId);

        return [
          employee?.name ?? "",
          employee?.employeeCode ?? "",
          course?.title ?? "",
          enrollment.assignedDate,
          enrollment.dueDate,
          enrollment.progress,
          TRAINING_ENROLLMENT_STATUS_CONFIG[enrollment.status].label,
        ];
      }),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={TRAINING_COPY.eyebrow}
        title={TRAINING_COPY.overview.title}
        description={TRAINING_COPY.overview.description}
        actions={
          <>
            <Button variant="outline" onClick={exportData}>
              <Download />
              {TRAINING_COPY.overview.exportAction}
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              {TRAINING_COPY.overview.createAction}
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={TRAINING_COPY.overview.chartTitle}
          description={TRAINING_COPY.overview.chartDescription}
        >
          <TrainingActivityChart
            data={TRAINING_TRENDS[selectedBranchId] ?? TRAINING_TRENDS.all}
          />
        </ChartCard>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              <CalendarDays size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {TRAINING_COPY.overview.upcomingTitle}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {TRAINING_COPY.overview.upcomingDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => {
                const course = courses.find((item) => item.id === session.courseId);

                return (
                  <div
                    key={session.id}
                    className="rounded-control border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {course?.title ?? "Training course"}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {session.facilitator}
                        </p>
                      </div>

                      <Badge variant="info">{formatDate(session.sessionDate)}</Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-muted">
                      <span>
                        {session.startTime}â€“{session.endTime}
                      </span>

                      <span>
                        {session.enrolledCount}/{session.capacity} enrolled
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-control bg-surface-muted p-4 text-sm font-medium text-text-muted">
                No upcoming instructor-led sessions are scheduled.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{TRAINING_COPY.overview.registerTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {TRAINING_COPY.overview.registerDescription}
          </p>
        </div>

        <DataTable
          rows={activeEnrollments}
          columns={columns}
          getRowKey={(enrollment) => enrollment.id}
          onRowClick={(enrollment) => setSelectedEnrollmentId(enrollment.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <GraduationCap className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">{TRAINING_COPY.overview.emptyTitle}</h3>

              <p className="mt-2 text-sm text-text-muted">
                {TRAINING_COPY.overview.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedEnrollment && selectedEmployee && selectedCourse)}
        onClose={() => setSelectedEnrollmentId(null)}
        title="Training enrollment"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} Â· ${selectedEmployee.employeeCode}`
            : undefined
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

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Due date</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(selectedEnrollment.dueDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Assigned by</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedEnrollment.assignedBy}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Attempts</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedEnrollment.attempts}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Score</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedEnrollment.score !== undefined
                      ? `${selectedEnrollment.score}%`
                      : "Not scored"}
                  </dd>
                </div>
              </dl>
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
        title="Add training course"
        description="Create reusable learning content for the organization or a selected branch."
      >
        <TrainingCourseForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onSave={saveCourse}
        />
      </Drawer>
    </div>
  );
}
