"use client";

import { type MouseEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FilePenLine,
  FileSearch,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { TrainingSessionForm } from "@/components/training/training-session-form";
import { TrainingTabs } from "@/components/training/training-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TRAINING_COPY,
  TRAINING_DELIVERY_MODE_CONFIG,
  TRAINING_REFERENCE_DATE,
  TRAINING_SESSION_STATUS_CONFIG,
} from "@/config/training";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { TRAINING_COURSES, TRAINING_SESSIONS } from "@/data/training";
import { formatDate } from "@/lib/date";
import { downloadTrainingCsv } from "@/lib/training";
import type { TrainingSession, TrainingSessionStatus } from "@/types/training";

type EditorMode = "create" | "edit" | null;

export function TrainingSessionsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [sessions, setSessions] = useState<TrainingSession[]>(TRAINING_SESSIONS);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [modeFilter, setModeFilter] = useState("all");

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedSessions = useMemo(
    () =>
      sessions.filter(
        (session) => selectedBranch.isAggregate || session.branchId === selectedBranch.id,
      ),
    [sessions, selectedBranch],
  );

  const visibleSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedSessions.filter((session) => {
      const course = TRAINING_COURSES.find((item) => item.id === session.courseId);

      const branch = BRANCH_OPTIONS.find((item) => item.id === session.branchId);

      const searchableValue = [
        course?.title,
        course?.code,
        session.facilitator,
        session.venue,
        branch?.name,
        TRAINING_DELIVERY_MODE_CONFIG[session.deliveryMode].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (statusFilter === "all" || session.status === statusFilter) &&
        (modeFilter === "all" || session.deliveryMode === modeFilter)
      );
    });
  }, [modeFilter, scopedSessions, searchQuery, statusFilter]);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? null;

  const selectedCourse = selectedSession
    ? TRAINING_COURSES.find((course) => course.id === selectedSession.courseId)
    : null;

  const scheduledSessions = scopedSessions.filter(
    (session) => session.status === "scheduled",
  );

  const upcomingSessions = scheduledSessions
    .filter((session) => session.sessionDate >= TRAINING_REFERENCE_DATE)
    .sort((first, second) => first.sessionDate.localeCompare(second.sessionDate));

  const completedSessions = scopedSessions.filter(
    (session) => session.status === "completed",
  );

  const totalEnrollments = scheduledSessions.reduce(
    (total, session) => total + session.enrolledCount,
    0,
  );

  const totalAttendance = completedSessions.reduce(
    (total, session) => total + session.attendanceCount,
    0,
  );

  const attendanceCapacity = completedSessions.reduce(
    (total, session) => total + session.enrolledCount,
    0,
  );

  const attendanceRate =
    attendanceCapacity > 0 ? Math.round((totalAttendance / attendanceCapacity) * 100) : 0;

  const metrics = [
    {
      label: "Upcoming sessions",
      value: String(upcomingSessions.length),
      detail: selectedBranch.name,
      icon: CalendarDays,
      tone: "info" as const,
    },
    {
      label: "Scheduled learners",
      value: String(totalEnrollments),
      detail: "Across upcoming sessions",
      icon: Users,
      tone: "warning" as const,
    },
    {
      label: "Completed sessions",
      value: String(completedSessions.length),
      detail: "Historical instructor-led delivery",
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Attendance rate",
      value: `${attendanceRate}%`,
      detail: "Across completed sessions",
      icon: UserCheck,
      tone: "success" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<TrainingSession>[]>(
    () => [
      {
        id: "course",
        header: TRAINING_COPY.sessions.columns.course,
        cell: (session) => {
          const course = TRAINING_COURSES.find((item) => item.id === session.courseId);

          const branch = BRANCH_OPTIONS.find((item) => item.id === session.branchId);

          return course ? (
            <div>
              <p className="font-semibold">{course.title}</p>

              <p className="mt-1 text-xs text-text-muted">
                {course.code} Â· {branch?.name ?? session.branchId}
              </p>
            </div>
          ) : (
            "Course unavailable"
          );
        },
      },
      {
        id: "date",
        header: TRAINING_COPY.sessions.columns.date,
        cell: (session) => (
          <div>
            <p className="font-semibold">{formatDate(session.sessionDate)}</p>

            <p className="mt-1 text-xs text-text-muted">
              {session.startTime}â€“{session.endTime}
            </p>
          </div>
        ),
      },
      {
        id: "facilitator",
        header: TRAINING_COPY.sessions.columns.facilitator,
        cell: (session) => session.facilitator,
      },
      {
        id: "venue",
        header: TRAINING_COPY.sessions.columns.venue,
        cell: (session) => (
          <div>
            <p>{session.venue}</p>

            <div className="mt-1">
              <Badge
                variant={TRAINING_DELIVERY_MODE_CONFIG[session.deliveryMode].badgeVariant}
              >
                {TRAINING_DELIVERY_MODE_CONFIG[session.deliveryMode].label}
              </Badge>
            </div>
          </div>
        ),
      },
      {
        id: "capacity",
        header: TRAINING_COPY.sessions.columns.capacity,
        cell: (session) => `${session.enrolledCount}/${session.capacity}`,
      },
      {
        id: "attendance",
        header: TRAINING_COPY.sessions.columns.attendance,
        className: "min-w-40",
        cell: (session) => {
          const rate =
            session.enrolledCount > 0
              ? Math.round((session.attendanceCount / session.enrolledCount) * 100)
              : 0;

          return session.status === "completed" ? (
            <ProgressBar value={rate} tone="success" />
          ) : (
            <span className="text-text-muted">Not recorded</span>
          );
        },
      },
      {
        id: "status",
        header: TRAINING_COPY.sessions.columns.status,
        cell: (session) => (
          <Badge variant={TRAINING_SESSION_STATUS_CONFIG[session.status].badgeVariant}>
            {TRAINING_SESSION_STATUS_CONFIG[session.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: TRAINING_COPY.sessions.columns.actions,
        headClassName: "w-16",
        cell: (session) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open training session"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              setSelectedSessionId(session.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveSession(nextSession: TrainingSession) {
    setSessions((currentSessions) => {
      const exists = currentSessions.some((session) => session.id === nextSession.id);

      return exists
        ? currentSessions.map((session) =>
            session.id === nextSession.id ? nextSession : session,
          )
        : [nextSession, ...currentSessions];
    });

    setSelectedSessionId(nextSession.id);
    setEditorMode(null);
  }

  function updateStatus(sessionId: string, status: TrainingSessionStatus) {
    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        if (status === "completed") {
          return {
            ...session,
            status,
            attendanceCount: session.enrolledCount,
          };
        }

        if (status === "scheduled") {
          return {
            ...session,
            status,
            attendanceCount: 0,
          };
        }

        return {
          ...session,
          status,
        };
      }),
    );
  }

  function exportSessions() {
    downloadTrainingCsv(
      "training-sessions.csv",
      [
        "Course",
        "Branch",
        "Date",
        "Start time",
        "End time",
        "Facilitator",
        "Venue",
        "Delivery",
        "Capacity",
        "Enrolled",
        "Attendance",
        "Status",
      ],
      visibleSessions.map((session) => {
        const course = TRAINING_COURSES.find((item) => item.id === session.courseId);
        const branch = BRANCH_OPTIONS.find((item) => item.id === session.branchId);

        return [
          course?.title ?? "",
          branch?.name ?? session.branchId,
          session.sessionDate,
          session.startTime,
          session.endTime,
          session.facilitator,
          session.venue,
          TRAINING_DELIVERY_MODE_CONFIG[session.deliveryMode].label,
          session.capacity,
          session.enrolledCount,
          session.attendanceCount,
          TRAINING_SESSION_STATUS_CONFIG[session.status].label,
        ];
      }),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={TRAINING_COPY.eyebrow}
        title={TRAINING_COPY.sessions.title}
        description={TRAINING_COPY.sessions.description}
        actions={
          <>
            <Button variant="outline" onClick={exportSessions}>
              <Download />
              {TRAINING_COPY.sessions.exportAction}
            </Button>

            <Button
              onClick={() => {
                setSelectedSessionId(null);
                setEditorMode("create");
              }}
            >
              <Plus />
              {TRAINING_COPY.sessions.createAction}
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
            <h2 className="text-lg font-bold">{TRAINING_COPY.sessions.registerTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {TRAINING_COPY.sessions.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={TRAINING_COPY.sessions.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{TRAINING_COPY.sessions.allStatuses}</option>

                {Object.entries(TRAINING_SESSION_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={modeFilter}
                onChange={(event) => setModeFilter(event.target.value)}
              >
                <option value="all">{TRAINING_COPY.sessions.allModes}</option>

                {Object.entries(TRAINING_DELIVERY_MODE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DataTable
            rows={visibleSessions}
            columns={columns}
            getRowKey={(session) => session.id}
            onRowClick={(session) => setSelectedSessionId(session.id)}
            emptyState={
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <FileSearch className="size-8 text-text-muted" />

                <h3 className="mt-4 font-bold">{TRAINING_COPY.sessions.emptyTitle}</h3>

                <p className="mt-2 text-sm text-text-muted">
                  {TRAINING_COPY.sessions.emptyDescription}
                </p>
              </div>
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              <Clock3 size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {TRAINING_COPY.sessions.upcomingTitle}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {TRAINING_COPY.sessions.upcomingDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => {
                const course = TRAINING_COURSES.find(
                  (item) => item.id === session.courseId,
                );

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(session.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <p className="text-sm font-semibold">
                      {course?.title ?? "Training course"}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">{session.facilitator}</p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Badge variant="info">{formatDate(session.sessionDate)}</Badge>

                      <span className="text-xs text-text-muted">
                        {session.enrolledCount}/{session.capacity}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-surface-muted p-4 text-sm font-medium text-text-muted">
                No upcoming training sessions are scheduled.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedSession && selectedCourse)}
        onClose={() => setSelectedSessionId(null)}
        title="Training session"
        description={selectedCourse?.title}
        footer={
          selectedSession ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedSession.status === "scheduled" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedSession.id, "cancelled")}
                  >
                    <X />
                    Cancel session
                  </Button>

                  <Button variant="outline" onClick={() => setEditorMode("edit")}>
                    <FilePenLine />
                    Edit session
                  </Button>

                  <Button onClick={() => updateStatus(selectedSession.id, "in_progress")}>
                    <Play />
                    Start session
                  </Button>
                </>
              )}

              {selectedSession.status === "in_progress" && (
                <Button onClick={() => updateStatus(selectedSession.id, "completed")}>
                  <CheckCircle2 />
                  Complete session
                </Button>
              )}

              {selectedSession.status === "cancelled" && (
                <Button onClick={() => updateStatus(selectedSession.id, "scheduled")}>
                  <RotateCcw />
                  Restore session
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedSession && selectedCourse && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedCourse.title}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    {selectedCourse.code} Â· {formatDate(selectedSession.sessionDate)}
                  </p>
                </div>

                <Badge
                  variant={
                    TRAINING_SESSION_STATUS_CONFIG[selectedSession.status].badgeVariant
                  }
                >
                  {TRAINING_SESSION_STATUS_CONFIG[selectedSession.status].label}
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Facilitator</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSession.facilitator}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Venue</dt>
                  <dd className="mt-1 text-sm font-semibold">{selectedSession.venue}</dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Time</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSession.startTime}â€“{selectedSession.endTime}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Delivery mode</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {TRAINING_DELIVERY_MODE_CONFIG[selectedSession.deliveryMode].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Capacity</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSession.capacity}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Enrolled</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSession.enrolledCount}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Attendance</h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-control bg-info-muted p-4">
                  <p className="text-xs text-info">Enrolled</p>
                  <p className="mt-1 text-lg font-bold text-info">
                    {selectedSession.enrolledCount}
                  </p>
                </div>

                <div className="rounded-control bg-success-muted p-4">
                  <p className="text-xs text-success">Attended</p>
                  <p className="mt-1 text-lg font-bold text-success">
                    {selectedSession.attendanceCount}
                  </p>
                </div>
              </div>

              {selectedSession.status === "completed" && (
                <ProgressBar
                  className="mt-4"
                  value={
                    selectedSession.enrolledCount > 0
                      ? Math.round(
                          (selectedSession.attendanceCount /
                            selectedSession.enrolledCount) *
                            100,
                        )
                      : 0
                  }
                  label="Attendance rate"
                  tone="success"
                />
              )}
            </section>

            <section>
              <h3 className="text-sm font-bold">Session note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedSession.note || "No session note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Schedule training session" : "Edit training session"
        }
        description="Configure course delivery, facilitator, capacity and session timing."
      >
        {editorMode && (
          <TrainingSessionForm
            key={editorMode === "create" ? "new-training-session" : selectedSession?.id}
            session={editorMode === "edit" ? (selectedSession ?? undefined) : undefined}
            courses={TRAINING_COURSES}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveSession}
          />
        )}
      </Drawer>
    </div>
  );
}
