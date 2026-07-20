"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  CalendarClock,
  FilePenLine,
  Pause,
  Play,
  Plus,
  Search,
  StopCircle,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportScheduleForm } from "@/components/reports/report-schedule-form";
import { ReportTabs } from "@/components/reports/report-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DetailGrid } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  REPORT_COPY,
  REPORT_FORMAT_CONFIG,
  REPORT_SCHEDULE_FREQUENCY_CONFIG,
  REPORT_SCHEDULE_STATUS_CONFIG,
  REPORT_SCOPE_CONFIG,
} from "@/config/reports";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { REPORT_DEFINITIONS, REPORT_SCHEDULES } from "@/data/reports";
import { formatDate } from "@/lib/date";
import { formatReportDateTime } from "@/lib/reports";
import type { ReportSchedule } from "@/types/report";

export function ScheduledReportsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [schedules, setSchedules] = useState<ReportSchedule[]>(REPORT_SCHEDULES);
  const [searchQuery, setSearchQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          selectedBranch.isAggregate ||
          schedule.scope === "organization" ||
          schedule.branchId === selectedBranch.id,
      ),
    [schedules, selectedBranch],
  );

  const visibleSchedules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedSchedules.filter((schedule) => {
      const report = REPORT_DEFINITIONS.find((item) => item.id === schedule.reportId);

      const searchableValue = [
        schedule.name,
        report?.name,
        report?.code,
        schedule.branchName,
        schedule.recipients.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (frequencyFilter === "all" || schedule.frequency === frequencyFilter) &&
        (statusFilter === "all" || schedule.status === statusFilter)
      );
    });
  }, [frequencyFilter, scopedSchedules, searchQuery, statusFilter]);

  const selectedSchedule =
    schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null;

  const selectedReport = selectedSchedule
    ? REPORT_DEFINITIONS.find((report) => report.id === selectedSchedule.reportId)
    : undefined;

  const activeSchedules = scopedSchedules.filter(
    (schedule) => schedule.status === "active",
  );
  const pausedSchedules = scopedSchedules.filter(
    (schedule) => schedule.status === "paused",
  );
  const weeklySchedules = scopedSchedules.filter(
    (schedule) => schedule.frequency === "weekly",
  );
  const monthlySchedules = scopedSchedules.filter(
    (schedule) => schedule.frequency === "monthly",
  );

  const metrics = [
    {
      label: "Active schedules",
      value: String(activeSchedules.length),
      detail: selectedBranch.name,
      icon: CalendarClock,
      tone: "success" as const,
    },
    {
      label: "Paused schedules",
      value: String(pausedSchedules.length),
      detail: "Waiting to be resumed",
      icon: Pause,
      tone: "warning" as const,
    },
    {
      label: "Weekly delivery",
      value: String(weeklySchedules.length),
      detail: "Weekly report schedules",
      icon: CalendarClock,
      tone: "info" as const,
    },
    {
      label: "Monthly delivery",
      value: String(monthlySchedules.length),
      detail: "Monthly report schedules",
      icon: CalendarClock,
      tone: "info" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<ReportSchedule>[]>(
    () => [
      {
        id: "schedule",
        header: "Schedule",
        cell: (schedule) => (
          <div>
            <p className="font-semibold">{schedule.name}</p>
            <p className="mt-1 text-xs text-text-muted">
              {schedule.branchName ?? "All organization branches"}
            </p>
          </div>
        ),
      },
      {
        id: "report",
        header: "Report",
        cell: (schedule) => {
          const report = REPORT_DEFINITIONS.find((item) => item.id === schedule.reportId);

          return (
            <div>
              <p className="font-semibold">{report?.name ?? "Unknown report"}</p>
              <p className="mt-1 text-xs text-text-muted">
                {report?.code ?? schedule.reportId}
              </p>
            </div>
          );
        },
      },
      {
        id: "scope",
        header: "Scope",
        cell: (schedule) => (
          <Badge variant={REPORT_SCOPE_CONFIG[schedule.scope].badgeVariant}>
            {REPORT_SCOPE_CONFIG[schedule.scope].label}
          </Badge>
        ),
      },
      {
        id: "frequency",
        header: "Frequency",
        cell: (schedule) => REPORT_SCHEDULE_FREQUENCY_CONFIG[schedule.frequency].label,
      },
      {
        id: "format",
        header: "Format",
        cell: (schedule) => (
          <Badge variant={REPORT_FORMAT_CONFIG[schedule.format].badgeVariant}>
            {REPORT_FORMAT_CONFIG[schedule.format].label}
          </Badge>
        ),
      },
      {
        id: "recipients",
        header: "Recipients",
        cell: (schedule) => schedule.recipients.length,
      },
      {
        id: "nextRun",
        header: "Next run",
        cell: (schedule) => formatReportDateTime(schedule.nextRunAt),
      },
      {
        id: "status",
        header: "Status",
        cell: (schedule) => (
          <Badge variant={REPORT_SCHEDULE_STATUS_CONFIG[schedule.status].badgeVariant}>
            {REPORT_SCHEDULE_STATUS_CONFIG[schedule.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headClassName: "w-16",
        cell: (schedule) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open scheduled report actions"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedScheduleId(schedule.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveSchedule(schedule: ReportSchedule) {
    setSchedules((currentSchedules) => {
      const exists = currentSchedules.some((item) => item.id === schedule.id);

      return exists
        ? currentSchedules.map((item) => (item.id === schedule.id ? schedule : item))
        : [schedule, ...currentSchedules];
    });

    setEditorMode(null);
    setSelectedScheduleId(schedule.id);
  }

  function updateStatus(status: ReportSchedule["status"]) {
    if (!selectedSchedule) {
      return;
    }

    setSchedules((currentSchedules) =>
      currentSchedules.map((schedule) =>
        schedule.id === selectedSchedule.id
          ? {
              ...schedule,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : schedule,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={REPORT_COPY.scheduled.eyebrow}
        title={REPORT_COPY.scheduled.title}
        description={REPORT_COPY.scheduled.description}
        actions={
          <Button
            onClick={() => {
              setSelectedScheduleId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {REPORT_COPY.scheduled.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <ReportTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{REPORT_COPY.scheduled.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {REPORT_COPY.scheduled.registerDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={REPORT_COPY.scheduled.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={frequencyFilter}
              onChange={(event) => setFrequencyFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.scheduled.allFrequencies}</option>
              {Object.entries(REPORT_SCHEDULE_FREQUENCY_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.scheduled.allStatuses}</option>
              {Object.entries(REPORT_SCHEDULE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleSchedules}
          columns={columns}
          getRowKey={(schedule) => schedule.id}
          onRowClick={(schedule) => setSelectedScheduleId(schedule.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <CalendarClock className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{REPORT_COPY.scheduled.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {REPORT_COPY.scheduled.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedSchedule)}
        onClose={() => setSelectedScheduleId(null)}
        title="Scheduled report"
        description={selectedSchedule?.name}
        footer={
          selectedSchedule ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedSchedule.status === "active" && (
                <Button variant="outline" onClick={() => updateStatus("paused")}>
                  <Pause />
                  Pause
                </Button>
              )}

              {selectedSchedule.status === "paused" && (
                <Button variant="outline" onClick={() => updateStatus("active")}>
                  <Play />
                  Resume
                </Button>
              )}

              {selectedSchedule.status !== "ended" && (
                <Button variant="outline" onClick={() => updateStatus("ended")}>
                  <StopCircle />
                  End schedule
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedSchedule && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedSchedule.name}</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Updated by {selectedSchedule.updatedBy} on{" "}
                    {formatDate(selectedSchedule.updatedAt)}
                  </p>
                </div>

                <Badge
                  variant={
                    REPORT_SCHEDULE_STATUS_CONFIG[selectedSchedule.status].badgeVariant
                  }
                >
                  {REPORT_SCHEDULE_STATUS_CONFIG[selectedSchedule.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Report",
                    value: selectedReport?.name ?? "Unknown report",
                  },
                  {
                    label: "Scope",
                    value: REPORT_SCOPE_CONFIG[selectedSchedule.scope].label,
                  },
                  {
                    label: "Branch",
                    value: selectedSchedule.branchName ?? "All organization branches",
                  },
                  {
                    label: "Frequency",
                    value:
                      REPORT_SCHEDULE_FREQUENCY_CONFIG[selectedSchedule.frequency].label,
                  },
                  {
                    label: "Run time",
                    value: selectedSchedule.runAt,
                  },
                  {
                    label: "Format",
                    value: REPORT_FORMAT_CONFIG[selectedSchedule.format].label,
                  },
                  {
                    label: "Next run",
                    value: formatReportDateTime(selectedSchedule.nextRunAt),
                  },
                  {
                    label: "Last run",
                    value: selectedSchedule.lastRunAt
                      ? formatReportDateTime(selectedSchedule.lastRunAt)
                      : "Never",
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Recipients</h3>
              <div className="mt-3 space-y-2">
                {selectedSchedule.recipients.map((recipient) => (
                  <div
                    key={recipient}
                    className="rounded-control border border-border px-4 py-3 text-sm font-medium"
                  >
                    {recipient}
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-center justify-between rounded-control bg-canvas p-4">
              <div>
                <p className="text-sm font-semibold">Empty reports</p>
                <p className="mt-1 text-xs text-text-muted">
                  Deliver even when no records are available.
                </p>
              </div>

              <Badge
                variant={selectedSchedule.includeEmptyReport ? "success" : "neutral"}
              >
                {selectedSchedule.includeEmptyReport ? "Enabled" : "Disabled"}
              </Badge>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add report schedule" : "Edit report schedule"}
        description="Configure recurring report generation, scope, format and internal recipients."
      >
        {editorMode && (
          <ReportScheduleForm
            key={editorMode === "create" ? "new-report-schedule" : selectedSchedule?.id}
            schedule={editorMode === "edit" ? (selectedSchedule ?? undefined) : undefined}
            reports={REPORT_DEFINITIONS}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveSchedule}
          />
        )}
      </Drawer>
    </div>
  );
}
