"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Download,
  FileClock,
  Files,
  Upload,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DocumentActivityChart } from "@/components/documents/document-activity-chart";
import { DocumentDetails } from "@/components/documents/document-details";
import { DocumentTabs } from "@/components/documents/document-tabs";
import { createDocumentColumns } from "@/components/documents/document-table-columns";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { IconContainer } from "@/components/shared/icon-container";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import {
  DOCUMENT_ACTION_LABELS,
  DOCUMENT_DEFAULT_REJECTION_REASON,
  DOCUMENT_REFERENCE_DATE,
  DOCUMENT_STATUS_CONFIG,
  DOCUMENTS_COPY,
} from "@/config/documents";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import {
  DOCUMENT_ACTIVITY_TRENDS,
  DOCUMENT_RECORDS,
  DOCUMENT_REQUESTS,
  DOCUMENT_SETTINGS,
} from "@/data/documents";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import {
  documentIsInScope,
  downloadCsv,
  isDocumentExpired,
  isDocumentExpiring,
  requestIsInScope,
  resolveDocumentSettings,
} from "@/lib/documents";
import type { DocumentRecord, DocumentStatus } from "@/types/document";

export function DocumentsOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [documents, setDocuments] = useState<DocumentRecord[]>(DOCUMENT_RECORDS);

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);

  const effectiveSettings = resolveDocumentSettings(DOCUMENT_SETTINGS, selectedBranchId);

  const scopedDocuments = useMemo(
    () => documents.filter((document) => documentIsInScope(document, selectedBranchId)),
    [documents, selectedBranchId],
  );

  const scopedRequests = DOCUMENT_REQUESTS.filter((request) =>
    requestIsInScope(request, selectedBranchId),
  );

  const selectedDocument =
    documents.find((document) => document.id === selectedDocumentId) ?? null;

  const verifiedDocuments = scopedDocuments.filter(
    (document) => document.status === "verified",
  );

  const expiringDocuments = scopedDocuments.filter(
    (document) =>
      document.status === "expiring" ||
      isDocumentExpiring(
        document,
        DOCUMENT_REFERENCE_DATE,
        effectiveSettings?.expiryReminderDays ?? 45,
      ),
  );

  const expiredDocuments = scopedDocuments.filter(
    (document) =>
      document.status === "expired" ||
      isDocumentExpired(document, DOCUMENT_REFERENCE_DATE),
  );

  const openRequests = scopedRequests.filter((request) =>
    ["open", "submitted", "overdue"].includes(request.status),
  );

  const attentionDocuments = scopedDocuments
    .filter((document) =>
      ["pending_verification", "expiring", "expired", "rejected"].includes(
        document.status,
      ),
    )
    .sort((first, second) =>
      (first.expiryDate ?? first.uploadedAt).localeCompare(
        second.expiryDate ?? second.uploadedAt,
      ),
    );

  const recentDocuments = [...scopedDocuments]
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .slice(0, 6);

  const metrics = [
    {
      label: "Documents",
      value: String(scopedDocuments.length),
      detail: selectedBranch.name,
      icon: Files,
      tone: "info" as const,
    },
    {
      label: "Verified records",
      value: String(verifiedDocuments.length),
      detail: "Available and approved",
      icon: BadgeCheck,
      tone: "success" as const,
    },
    {
      label: "Expiring or expired",
      value: String(expiringDocuments.length + expiredDocuments.length),
      detail: "Renewal action required",
      icon: FileClock,
      tone: "warning" as const,
    },
    {
      label: "Open requests",
      value: String(openRequests.length),
      detail: "Employee submissions pending",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
  ];

  const trend =
    DOCUMENT_ACTIVITY_TRENDS[selectedBranchId] ?? DOCUMENT_ACTIVITY_TRENDS.all;

  const columns = createDocumentColumns({
    onOpen: (document) => setSelectedDocumentId(document.id),
    compact: true,
  });

  function createDocument(document: DocumentRecord) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    setUploadOpen(false);
    setSelectedDocumentId(document.id);
  }

  function updateStatus(documentId: string, status: DocumentStatus) {
    const actionDate = new Date().toISOString().slice(0, 10);

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status,
              verifiedAt: status === "verified" ? actionDate : document.verifiedAt,
              verifiedBy:
                status === "verified" ? CURRENT_ADMIN.name : document.verifiedBy,
              rejectionReason:
                status === "rejected"
                  ? DOCUMENT_DEFAULT_REJECTION_REASON
                  : status === "verified"
                    ? undefined
                    : document.rejectionReason,
            }
          : document,
      ),
    );
  }

  function exportDocuments() {
    downloadCsv(
      "ams-documents.csv",
      [
        "Document number",
        "Title",
        "Category",
        "Owner type",
        "Branch",
        "Status",
        "Uploaded",
        "Expiry",
        "File name",
      ],
      scopedDocuments.map((document) => [
        document.documentNumber,
        document.title,
        document.category,
        document.ownerType,
        document.branchName,
        document.status,
        document.uploadedAt,
        document.expiryDate,
        document.fileName,
      ]),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={DOCUMENTS_COPY.eyebrow}
        title={DOCUMENTS_COPY.overview.title}
        description={DOCUMENTS_COPY.overview.description}
        actions={
          <>
            <Button variant="outline" onClick={exportDocuments}>
              <Download />
              {DOCUMENT_ACTION_LABELS.export}
            </Button>

            <Button onClick={() => setUploadOpen(true)}>
              <Upload />
              {DOCUMENT_ACTION_LABELS.upload}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <DocumentTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={DOCUMENTS_COPY.overview.chartTitle}
          description={DOCUMENTS_COPY.overview.chartDescription}
        >
          <DocumentActivityChart data={trend} />
        </ChartCard>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <IconContainer icon={AlertTriangle} tone="warning" />
            <div>
              <h2 className="text-lg font-bold">
                {DOCUMENTS_COPY.overview.attentionTitle}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {DOCUMENTS_COPY.overview.attentionDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {attentionDocuments.length > 0 ? (
              attentionDocuments.slice(0, 5).map((document) => {
                const employee = EMPLOYEES.find(
                  (item) => item.id === document.employeeId,
                );

                return (
                  <Button
                    key={document.id}
                    variant="ghost"
                    onClick={() => setSelectedDocumentId(document.id)}
                    className="h-auto w-full justify-start whitespace-normal rounded-control border border-border p-4 text-left hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {document.title}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {employee?.name ?? document.branchName ?? "Organization"}
                          </p>
                        </div>
                        <Badge
                          variant={DOCUMENT_STATUS_CONFIG[document.status].badgeVariant}
                        >
                          {DOCUMENT_STATUS_CONFIG[document.status].label}
                        </Badge>
                      </div>

                      <p className="mt-3 text-xs text-text-muted">
                        {document.expiryDate
                          ? `Expiry ${formatDate(document.expiryDate)}`
                          : `Uploaded ${formatDate(document.uploadedAt)}`}
                      </p>
                    </div>
                  </Button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No documents currently require administrator attention.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{DOCUMENTS_COPY.overview.recentTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {DOCUMENTS_COPY.overview.recentDescription}
          </p>
        </div>

        <DataTable
          rows={recentDocuments}
          columns={columns}
          getRowKey={(document) => document.id}
          onRowClick={(document) => setSelectedDocumentId(document.id)}
          emptyState={
            <EmptyState
              icon={Files}
              title={DOCUMENTS_COPY.overview.emptyTitle}
              description={DOCUMENTS_COPY.overview.emptyDescription}
            />
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedDocument)}
        onClose={() => setSelectedDocumentId(null)}
        title="Document record"
        description={selectedDocument?.documentNumber}
        footer={
          selectedDocument ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedDocument.status === "pending_verification" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedDocument.id, "rejected")}
                  >
                    {DOCUMENT_ACTION_LABELS.reject}
                  </Button>
                  <Button onClick={() => updateStatus(selectedDocument.id, "verified")}>
                    {DOCUMENT_ACTION_LABELS.verify}
                  </Button>
                </>
              )}

              {selectedDocument.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedDocument.id, "archived")}
                >
                  {DOCUMENT_ACTION_LABELS.archive}
                </Button>
              )}

              {selectedDocument.status === "archived" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedDocument.id, "draft")}
                >
                  {DOCUMENT_ACTION_LABELS.restore}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedDocument && <DocumentDetails document={selectedDocument} />}
      </Drawer>

      <Drawer
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload document"
        description="Add an employee, branch or organization document to the central library."
      >
        <DocumentUploadForm
          selectedBranchId={selectedBranchId}
          maximumUploadMb={effectiveSettings?.maximumUploadMb ?? 25}
          allowedFileExtensions={
            effectiveSettings?.allowedFileExtensions ?? [
              ".pdf",
              ".doc",
              ".docx",
              ".jpg",
              ".jpeg",
              ".png",
            ]
          }
          verificationRequired={effectiveSettings?.verificationRequired ?? true}
          onCancel={() => setUploadOpen(false)}
          onCreate={createDocument}
        />
      </Drawer>
    </div>
  );
}
