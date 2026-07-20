import type { ReportDefinition, ReportExport, ReportFormat } from "@/types/report";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatReportDateTime(value: string) {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function formatFileSize(value?: number) {
  if (!value) {
    return "Pending";
  }

  return value >= 1024 ? `${(value / 1024).toFixed(1)} MB` : `${value} KB`;
}

function escapeCsvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function createReportExport(
  report: ReportDefinition,
  branchId: string,
  requestedBy: string,
  format?: ReportFormat,
): ReportExport {
  const actionTime = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    reportId: report.id,
    branchId,
    requestedBy,
    format: format ?? report.defaultFormat,
    status: "completed",
    createdAt: actionTime,
    completedAt: actionTime,
    recordCount: report.recordEstimate,
    fileSizeKb: Math.max(Math.round(report.recordEstimate * 1.2), 24),
  };
}

export function downloadReportSummary(
  report: ReportDefinition,
  reportExport: ReportExport,
) {
  const rows = [
    ["Report Code", report.code],
    ["Report Name", report.name],
    ["Category", report.category],
    ["Scope", report.scope],
    ["Requested By", reportExport.requestedBy],
    ["Format", reportExport.format],
    ["Record Count", reportExport.recordCount],
    ["Generated At", reportExport.completedAt ?? reportExport.createdAt],
    ["Included Fields", report.includedFields.join(", ")],
    ["Default Filters", report.defaultFilters.join(", ")],
  ];

  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${report.code.toLowerCase()}-summary.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
