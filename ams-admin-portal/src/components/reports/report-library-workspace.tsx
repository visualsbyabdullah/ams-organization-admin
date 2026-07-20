"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Archive,
  CheckCircle2,
  Copy,
  Download,
  FileBarChart2,
  FilePenLine,
  Plus,
  Search,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportDefinitionForm } from "@/components/reports/report-definition-form";
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
  REPORT_CATEGORY_CONFIG,
  REPORT_COPY,
  REPORT_DEFINITION_STATUS_CONFIG,
  REPORT_FORMAT_CONFIG,
  REPORT_SCOPE_CONFIG,
} from "@/config/reports";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { REPORT_DEFINITIONS } from "@/data/reports";
import {
  createReportExport,
  downloadReportSummary,
  formatReportDateTime,
} from "@/lib/reports";
import type { ReportDefinition } from "@/types/report";

export function ReportLibraryWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [reports, setReports] = useState<ReportDefinition[]>(REPORT_DEFINITIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          selectedBranch.isAggregate ||
          report.scope === "organization" ||
          report.branchId === selectedBranch.id,
      ),
    [reports, selectedBranch],
  );

  const visibleReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedReports.filter((report) => {
      const searchableValue = [
        report.name,
        report.code,
        report.description,
        report.includedFields.join(" "),
        report.defaultFilters.join(" "),
        report.branchName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (categoryFilter === "all" || report.category === categoryFilter) &&
        (statusFilter === "all" || report.status === statusFilter) &&
        (scopeFilter === "all" || report.scope === scopeFilter)
      );
    });
  }, [categoryFilter, scopedReports, scopeFilter, searchQuery, statusFilter]);

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? null;

  const activeReports = scopedReports.filter((report) => report.status === "active");
  const draftReports = scopedReports.filter((report) => report.status === "draft");
  const branchReports = scopedReports.filter((report) => report.scope === "branch");
  const multiFormatReports = scopedReports.filter(
    (report) => report.availableFormats.length > 1,
  );

  const metrics = [
    {
      label: "Active reports",
      value: String(activeReports.length),
      detail: selectedBranch.name,
      icon: FileBarChart2,
      tone: "success" as const,
    },
    {
      label: "Draft reports",
      value: String(draftReports.length),
      detail: "Waiting for activation",
      icon: FilePenLine,
      tone: "warning" as const,
    },
    {
      label: "Branch reports",
      value: String(branchReports.length),
      detail: "Scoped report definitions",
      icon: FileBarChart2,
      tone: "info" as const,
    },
    {
      label: "Multi-format",
      value: String(multiFormatReports.length),
      detail: "Multiple export options",
      icon: Download,
      tone: "info" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<ReportDefinition>[]>(
    () => [
      {
        id: "report",
        header: "Report",
        cell: (report) => (
          <div>
            <p className="font-semibold">{report.name}</p>
            <p className="mt-1 text-xs text-text-muted">
              {report.code} · {report.branchName ?? "All organization branches"}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: (report) => (
          <Badge variant={REPORT_CATEGORY_CONFIG[report.category].badgeVariant}>
            {REPORT_CATEGORY_CONFIG[report.category].label}
          </Badge>
        ),
      },
      {
        id: "scope",
        header: "Scope",
        cell: (report) => (
          <Badge variant={REPORT_SCOPE_CONFIG[report.scope].badgeVariant}>
            {REPORT_SCOPE_CONFIG[report.scope].label}
          </Badge>
        ),
      },
      {
        id: "format",
        header: "Default format",
        cell: (report) => (
          <Badge variant={REPORT_FORMAT_CONFIG[report.defaultFormat].badgeVariant}>
            {REPORT_FORMAT_CONFIG[report.defaultFormat].label}
          </Badge>
        ),
      },
      {
        id: "fields",
        header: "Fields",
        cell: (report) => report.includedFields.length,
      },
      {
        id: "estimate",
        header: "Estimated records",
        cell: (report) => report.recordEstimate.toLocaleString("en-PK"),
      },
      {
        id: "lastGenerated",
        header: "Last generated",
        cell: (report) =>
          report.lastGeneratedAt ? formatReportDateTime(report.lastGeneratedAt) : "Never",
      },
      {
        id: "status",
        header: "Status",
        cell: (report) => (
          <Badge variant={REPORT_DEFINITION_STATUS_CONFIG[report.status].badgeVariant}>
            {REPORT_DEFINITION_STATUS_CONFIG[report.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headClassName: "w-16",
        cell: (report) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open report actions"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedReportId(report.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveReport(report: ReportDefinition) {
    setReports((currentReports) => {
      const exists = currentReports.some((item) => item.id === report.id);

      return exists
        ? currentReports.map((item) => (item.id === report.id ? report : item))
        : [report, ...currentReports];
    });

    setEditorMode(null);
    setSelectedReportId(report.id);
  }

  function duplicateReport() {
    if (!selectedReport) {
      return;
    }

    const duplicate: ReportDefinition = {
      ...selectedReport,
      id: crypto.randomUUID(),
      code: `${selectedReport.code}-COPY`,
      name: `${selectedReport.name} Copy`,
      status: "draft",
      lastGeneratedAt: undefined,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };

    setReports((currentReports) => [duplicate, ...currentReports]);
    setSelectedReportId(duplicate.id);
  }

  function updateStatus(status: ReportDefinition["status"]) {
    if (!selectedReport) {
      return;
    }

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : report,
      ),
    );
  }

  function generateReport() {
    if (!selectedReport) {
      return;
    }

    const reportExport = createReportExport(
      selectedReport,
      selectedBranch.isAggregate ? "all" : selectedBranch.id,
      CURRENT_ADMIN.name,
    );

    downloadReportSummary(selectedReport, reportExport);

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? { ...report, lastGeneratedAt: reportExport.completedAt }
          : report,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={REPORT_COPY.library.eyebrow}
        title={REPORT_COPY.library.title}
        description={REPORT_COPY.library.description}
        actions={
          <Button
            onClick={() => {
              setSelectedReportId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {REPORT_COPY.library.createAction}
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
          <h2 className="text-lg font-bold">{REPORT_COPY.library.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {REPORT_COPY.library.registerDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={REPORT_COPY.library.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.library.allCategories}</option>
              {Object.entries(REPORT_CATEGORY_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.library.allScopes}</option>
              {Object.entries(REPORT_SCOPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{REPORT_COPY.library.allStatuses}</option>
              {Object.entries(REPORT_DEFINITION_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleReports}
          columns={columns}
          getRowKey={(report) => report.id}
          onRowClick={(report) => setSelectedReportId(report.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileBarChart2 className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{REPORT_COPY.library.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {REPORT_COPY.library.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReportId(null)}
        title="Report definition"
        description={selectedReport?.name}
        footer={
          selectedReport ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateReport}>
                <Copy />
                Duplicate
              </Button>

              {selectedReport.status === "active" ? (
                <Button variant="outline" onClick={() => updateStatus("archived")}>
                  <Archive />
                  Archive
                </Button>
              ) : (
                <Button variant="outline" onClick={() => updateStatus("active")}>
                  <CheckCircle2 />
                  Activate
                </Button>
              )}

              {selectedReport.status === "active" && (
                <Button variant="outline" onClick={generateReport}>
                  <Download />
                  Generate
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
        {selectedReport && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {selectedReport.code}
                  </p>
                  <h3 className="mt-2 font-bold">{selectedReport.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {selectedReport.description}
                  </p>
                </div>

                <Badge
                  variant={
                    REPORT_DEFINITION_STATUS_CONFIG[selectedReport.status].badgeVariant
                  }
                >
                  {REPORT_DEFINITION_STATUS_CONFIG[selectedReport.status].label}
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Category</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {REPORT_CATEGORY_CONFIG[selectedReport.category].label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Scope</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {REPORT_SCOPE_CONFIG[selectedReport.scope].label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Branch</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedReport.branchName ?? "All organization branches"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Default format</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {REPORT_FORMAT_CONFIG[selectedReport.defaultFormat].label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Estimated records</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedReport.recordEstimate.toLocaleString("en-PK")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Last generated</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedReport.lastGeneratedAt
                      ? formatReportDateTime(selectedReport.lastGeneratedAt)
                      : "Never"}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Available formats</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedReport.availableFormats.map((format) => (
                  <Badge key={format} variant={REPORT_FORMAT_CONFIG[format].badgeVariant}>
                    {REPORT_FORMAT_CONFIG[format].label}
                  </Badge>
                ))}
              </div>
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
              <h3 className="text-sm font-bold">Default filters</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedReport.defaultFilters.length > 0 ? (
                  selectedReport.defaultFilters.map((filter) => (
                    <Badge key={filter} variant="info">
                      {filter}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">
                    No default filters configured.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add report definition" : "Edit report definition"
        }
        description="Configure report scope, fields, filters and available export formats."
      >
        {editorMode && (
          <ReportDefinitionForm
            key={editorMode === "create" ? "new-report-definition" : selectedReport?.id}
            report={editorMode === "edit" ? (selectedReport ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveReport}
          />
        )}
      </Drawer>
    </div>
  );
}
