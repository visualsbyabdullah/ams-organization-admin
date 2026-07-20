"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  CheckCircle2,
  Download,
  FileBarChart2,
  FileSearch,
  Play,
  RefreshCcw,
  Search,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportTabs } from "@/components/reports/report-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  REPORT_COPY,
  REPORT_EXPORT_STATUS_CONFIG,
  REPORT_FORMAT_CONFIG,
} from "@/config/reports";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { REPORT_DEFINITIONS, REPORT_EXPORTS } from "@/data/reports";
import {
  createReportExport,
  downloadReportSummary,
  formatFileSize,
  formatReportDateTime,
} from "@/lib/reports";
import type { ReportExport } from "@/types/report";

export function ReportExportsWorkspace() {
  const { selectedBranch } = useBranchScope();
  const [exports, setExports] = useState<ReportExport[]>(REPORT_EXPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedGenerateReportId, setSelectedGenerateReportId] = useState(
    REPORT_DEFINITIONS.find((report) => report.status === "active")?.id ?? "",
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

  const visibleExports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedExports.filter((item) => {
      const report = REPORT_DEFINITIONS.find(
        (definition) => definition.id === item.reportId,
      );

      const searchableValue = [
        report?.name,
        report?.code,
        item.requestedBy,
        item.format,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (formatFilter === "all" || item.format === formatFilter) &&
        (statusFilter === "all" || item.status === statusFilter)
      );
    });
  }, [formatFilter, scopedExports, searchQuery, statusFilter]);

  const selectedExport = exports.find((item) => item.id === selectedExportId) ?? null;

  const selectedReport = selectedExport
    ? REPORT_DEFINITIONS.find((report) => report.id === selectedExport.reportId)
    : undefined;

  const completedExports = scopedExports.filter((item) => item.status === "completed");
  const processingExports = scopedExports.filter(
    (item) => item.status === "queued" || item.status === "processing",
  );
  const failedExports = scopedExports.filter((item) => item.status === "failed");
  const totalRecords = completedExports.reduce(
    (total, item) => total + item.recordCount,
    0,
  );

  const metrics = [
    {
      label: "Completed exports",
      value: String(completedExports.length),
      detail: selectedBranch.name,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "In progress",
      value: String(processingExports.length),
      detail: "Queued or processing",
      icon: RefreshCcw,
      tone: "info" as const,
    },
    {
      label: "Failed exports",
      value: String(failedExports.length),
      detail: "Requires retry or review",
      icon: FileSearch,
      tone: "danger" as const,
    },
    {
      label: "Completed records",
      value: totalRecords.toLocaleString("en-PK"),
      detail: "Across completed exports",
      icon: FileBarChart2,
      tone: "warning" as const,
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
        id: "branch",
        header: "Scope",
        cell: (item) => (item.branchId === "all" ? "All Branches" : item.branchId),
      },
      {
        id: "requestedBy",
        header: "Requested by",
        cell: (item) => item.requestedBy,
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
        id: "records",
        header: "Records",
        cell: (item) => item.recordCount.toLocaleString("en-PK"),
      },
      {
        id: "fileSize",
        header: "File size",
        cell: (item) => formatFileSize(item.fileSizeKb),
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

  function generateReport() {
    const report = REPORT_DEFINITIONS.find(
      (item) => item.id === selectedGenerateReportId,
    );

    if (!report) {
      return;
    }

    const reportExport = createReportExport(
      report,
      selectedBranch.isAggregate ? "all" : selectedBranch.id,
      CURRENT_ADMIN.name,
    );

    setExports((currentExports) => [reportExport, ...currentExports]);
    setGenerateOpen(false);
    setSelectedExportId(reportExport.id);
    downloadReportSummary(report, reportExport);
  }

  function retryExport() {
    if (!selectedExport || !selectedReport) {
      return;
    }

    const retry = createReportExport(
      selectedReport,
      selectedExport.branchId,
      CURRENT_ADMIN.name,
      selectedExport.format,
    );

    setExports((currentExports) => [retry, ...currentExports]);
    setSelectedExportId(retry.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={REPORT_COPY.exports.eyebrow}
        title={REPORT_COPY.exports.title}
        description={REPORT_COPY.exports.description}
        actions={
          <Button onClick={() => setGenerateOpen(true)}>
            <Play />
            {REPORT_COPY.exports.generateAction}
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
          <h2 className="text-lg font-bold">{REPORT_COPY.exports.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {REPORT_COPY.exports.registerDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={REPORT_COPY.exports.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.exports.allFormats}</option>
              {Object.entries(REPORT_FORMAT_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.exports.allStatuses}</option>
              {Object.entries(REPORT_EXPORT_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleExports}
          columns={columns}
          getRowKey={(item) => item.id}
          onRowClick={(item) => setSelectedExportId(item.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileBarChart2 className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{REPORT_COPY.exports.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {REPORT_COPY.exports.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedExport && selectedReport)}
        onClose={() => setSelectedExportId(null)}
        title="Report export"
        description={selectedReport?.name}
        footer={
          selectedExport && selectedReport ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedExport.status === "failed" && (
                <Button variant="outline" onClick={retryExport}>
                  <RefreshCcw />
                  Retry export
                </Button>
              )}

              {selectedExport.status === "completed" && (
                <Button
                  onClick={() => downloadReportSummary(selectedReport, selectedExport)}
                >
                  <Download />
                  Download
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedExport && selectedReport && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {selectedReport.code}
                  </p>
                  <h3 className="mt-2 font-bold">{selectedReport.name}</h3>
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
                  <dt className="text-xs text-text-muted">Format</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {REPORT_FORMAT_CONFIG[selectedExport.format].label}
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
                <div>
                  <dt className="text-xs text-text-muted">Completed</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedExport.completedAt
                      ? formatReportDateTime(selectedExport.completedAt)
                      : "Not completed"}
                  </dd>
                </div>
              </dl>
            </section>

            {selectedExport.errorMessage && (
              <section className="rounded-control bg-danger-muted p-4">
                <h3 className="text-sm font-bold text-danger">Export error</h3>
                <p className="mt-2 text-sm leading-6 text-danger">
                  {selectedExport.errorMessage}
                </p>
              </section>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate report"
        description="Select an active report definition for the current organization scope."
        footer={
          <div className="flex justify-end">
            <Button onClick={generateReport} disabled={!selectedGenerateReportId}>
              <Download />
              Generate
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Select
            value={selectedGenerateReportId}
            onChange={(event) => setSelectedGenerateReportId(event.target.value)}
          >
            {REPORT_DEFINITIONS.filter(
              (report) =>
                report.status === "active" &&
                (selectedBranch.isAggregate ||
                  report.scope === "organization" ||
                  report.branchId === selectedBranch.id),
            ).map((report) => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </Select>

          {REPORT_DEFINITIONS.find(
            (report) => report.id === selectedGenerateReportId,
          ) && (
            <div className="rounded-control bg-canvas p-4">
              <p className="text-sm font-semibold">
                {
                  REPORT_DEFINITIONS.find(
                    (report) => report.id === selectedGenerateReportId,
                  )?.description
                }
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
