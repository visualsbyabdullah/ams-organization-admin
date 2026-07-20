"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart2,
  Play,
  RefreshCcw,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportGenerationChart } from "@/components/reports/report-generation-chart";
import { ReportTabs } from "@/components/reports/report-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import {
  REPORT_CATEGORY_CONFIG,
  REPORT_COPY,
  REPORT_EXPORT_STATUS_CONFIG,
  REPORT_FORMAT_CONFIG,
} from "@/config/reports";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import {
  REPORT_DEFINITIONS,
  REPORT_EXPORTS,
  REPORT_GENERATION_TRENDS,
  REPORT_SCHEDULES,
} from "@/data/reports";
import {
  createReportExport,
  downloadReportSummary,
  formatFileSize,
  formatReportDateTime,
} from "@/lib/reports";
import type { ReportDefinition, ReportExport } from "@/types/report";

export function ReportsOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [exports, setExports] = useState<ReportExport[]>(REPORT_EXPORTS);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  const scopedReports = useMemo(
    () =>
      REPORT_DEFINITIONS.filter(
        (report) =>
          report.status === "active" &&
          (selectedBranch.isAggregate ||
            report.scope === "organization" ||
            report.branchId === selectedBranch.id),
      ),
    [selectedBranch],
  );

  const scopedExports = useMemo(
    () =>
      exports.filter(
        (item) =>
          selectedBranch.isAggregate ||
          item.branchId === "all" ||
          item.branchId === selectedBranch.id,
      ),
    [exports, selectedBranch],
  );

  const activeSchedules = REPORT_SCHEDULES.filter(
    (schedule) =>
      schedule.status === "active" &&
      (selectedBranch.isAggregate ||
        schedule.scope === "organization" ||
        schedule.branchId === selectedBranch.id),
  );

  const completedExports = scopedExports.filter((item) => item.status === "completed");
  const processingIssues = scopedExports.filter(
    (item) =>
      item.status === "queued" ||
      item.status === "processing" ||
      item.status === "failed",
  );

  const popularReports = scopedReports
    .map((report) => ({
      report,
      count: scopedExports.filter((item) => item.reportId === report.id).length,
    }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 5);

  const recentExports = [...scopedExports]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 6);

  const selectedReport =
    REPORT_DEFINITIONS.find((report) => report.id === selectedReportId) ?? null;

  const selectedExport = exports.find((item) => item.id === selectedExportId) ?? null;

  const selectedExportReport = selectedExport
    ? REPORT_DEFINITIONS.find((report) => report.id === selectedExport.reportId)
    : undefined;

  const metrics = [
    {
      label: "Active reports",
      value: String(scopedReports.length),
      detail: selectedBranch.name,
      icon: FileBarChart2,
      tone: "info" as const,
    },
    {
      label: "Scheduled reports",
      value: String(activeSchedules.length),
      detail: "Recurring deliveries",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Completed exports",
      value: String(completedExports.length),
      detail: "Current export history",
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Processing issues",
      value: String(processingIssues.length),
      detail: "Queued, processing or failed",
      icon: RefreshCcw,
      tone: "danger" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<ReportExport>[]>(
    () => [
      {
        id: "report",
        header: "Report",
        cell: (item) => {
          const report = REPORT_DEFINITIONS.find(
            (definition) => definition.id === item.reportId,
          );

          return (
            <div>
              <p className="font-semibold">{report?.name ?? "Unknown report"}</p>
              <p className="mt-1 text-xs text-text-muted">
                {report?.code ?? item.reportId}
              </p>
            </div>
          );
        },
      },
      {
        id: "format",
        header: "Format",
        cell: (item) => (
          <Badge variant={REPORT_FORMAT_CONFIG[item.format].badgeVariant}>
            {REPORT_FORMAT_CONFIG[item.format].label}
          </Badge>
        ),
      },
      {
        id: "requested",
        header: "Requested by",
        cell: (item) => item.requestedBy,
      },
      {
        id: "records",
        header: "Records",
        cell: (item) => item.recordCount.toLocaleString("en-PK"),
      },
      {
        id: "created",
        header: "Created",
        cell: (item) => formatReportDateTime(item.createdAt),
      },
      {
        id: "status",
        header: "Status",
        cell: (item) => (
          <Badge variant={REPORT_EXPORT_STATUS_CONFIG[item.status].badgeVariant}>
            {REPORT_EXPORT_STATUS_CONFIG[item.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headClassName: "w-16",
        cell: (item) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open report export actions"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedExportId(item.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function generateReport(report: ReportDefinition) {
    const reportExport = createReportExport(
      report,
      selectedBranch.isAggregate ? "all" : selectedBranch.id,
      CURRENT_ADMIN.name,
    );

    setExports((currentExports) => [reportExport, ...currentExports]);
    downloadReportSummary(report, reportExport);
    setSelectedReportId(null);
    setSelectedExportId(reportExport.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={REPORT_COPY.overview.eyebrow}
        title={REPORT_COPY.overview.title}
        description={REPORT_COPY.overview.description}
        actions={
          <Button onClick={() => setSelectedReportId(scopedReports[0]?.id ?? null)}>
            <Play />
            {REPORT_COPY.overview.generateAction}
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={REPORT_COPY.overview.chartTitle}
          description={REPORT_COPY.overview.chartDescription}
        >
          <ReportGenerationChart
            data={
              REPORT_GENERATION_TRENDS[selectedBranchId] ?? REPORT_GENERATION_TRENDS.all
            }
          />
        </ChartCard>

        <Card className="h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              <BarChart3 size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">{REPORT_COPY.overview.popularTitle}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {REPORT_COPY.overview.popularDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {popularReports.map(({ report, count }) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReportId(report.id)}
                className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{report.name}</p>
                    <p className="mt-1 text-xs text-text-muted">{report.code}</p>
                  </div>

                  <Badge variant={REPORT_CATEGORY_CONFIG[report.category].badgeVariant}>
                    {REPORT_CATEGORY_CONFIG[report.category].label}
                  </Badge>
                </div>

                <p className="mt-3 text-xs text-text-muted">
                  {count} exports in current history
                </p>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{REPORT_COPY.overview.recentTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {REPORT_COPY.overview.recentDescription}
          </p>
        </div>

        <DataTable
          rows={recentExports}
          columns={columns}
          getRowKey={(item) => item.id}
          onRowClick={(item) => setSelectedExportId(item.id)}
          emptyState={
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <FileBarChart2 className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">No exports available</h3>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReportId(null)}
        title="Generate report"
        description={selectedReport?.name}
        footer={
          selectedReport ? (
            <div className="flex justify-end">
              <Button onClick={() => generateReport(selectedReport)}>
                <Download />
                Generate
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedReport && (
          <div className="space-y-6">
            <section className="rounded-card border border-border p-5">
              <p className="text-xs font-semibold text-primary">{selectedReport.code}</p>
              <h3 className="mt-2 font-bold">{selectedReport.name}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                {selectedReport.description}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Included fields</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedReport.includedFields.map((field) => (
                  <Badge key={field} variant="neutral">
                    {field}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Generation summary</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-control bg-canvas p-4">
                  <dt className="text-xs text-text-muted">Output format</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {REPORT_FORMAT_CONFIG[selectedReport.defaultFormat].label}
                  </dd>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <dt className="text-xs text-text-muted">Estimated records</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedReport.recordEstimate.toLocaleString("en-PK")}
                  </dd>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <dt className="text-xs text-text-muted">Organization scope</dt>
                  <dd className="mt-1 text-sm font-semibold">{selectedBranch.name}</dd>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <dt className="text-xs text-text-muted">Requested by</dt>
                  <dd className="mt-1 text-sm font-semibold">{CURRENT_ADMIN.name}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={Boolean(selectedExport && selectedExportReport)}
        onClose={() => setSelectedExportId(null)}
        title="Report export"
        description={selectedExportReport?.name}
        footer={
          selectedExport &&
          selectedExportReport &&
          selectedExport.status === "completed" ? (
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  downloadReportSummary(selectedExportReport, selectedExport)
                }
              >
                <Download />
                Download
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedExport && selectedExportReport && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {selectedExportReport.code}
                  </p>
                  <h3 className="mt-2 font-bold">{selectedExportReport.name}</h3>
                </div>

                <Badge
                  variant={
                    REPORT_EXPORT_STATUS_CONFIG[selectedExport.status].badgeVariant
                  }
                >
                  {REPORT_EXPORT_STATUS_CONFIG[selectedExport.status].label}
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Requested by</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedExport.requestedBy}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Records</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedExport.recordCount.toLocaleString("en-PK")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">File size</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatFileSize(selectedExport.fileSizeKb)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Created</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatReportDateTime(selectedExport.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
