import { FileText } from "lucide-react";

import { IconContainer } from "@/components/shared/icon-container";
import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_OWNER_TYPE_CONFIG,
  DOCUMENT_STATUS_CONFIG,
  DOCUMENT_VISIBILITY_CONFIG,
} from "@/config/documents";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import { formatFileSize } from "@/lib/documents";
import type { DocumentRecord } from "@/types/document";

type DocumentDetailsProps = {
  document: DocumentRecord;
};

export function DocumentDetails({ document }: DocumentDetailsProps) {
  const employee = EMPLOYEES.find((item) => item.id === document.employeeId);

  const ownerName =
    document.ownerType === "employee"
      ? (employee?.name ?? "Employee unavailable")
      : document.ownerType === "branch"
        ? (document.branchName ?? "Branch unavailable")
        : "Organization";

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <IconContainer
              icon={FileText}
              tone={
                document.status === "verified"
                  ? "success"
                  : document.status === "expired" || document.status === "rejected"
                    ? "danger"
                    : document.status === "pending_verification" ||
                        document.status === "expiring"
                      ? "warning"
                      : "neutral"
              }
            />

            <div>
              <h3 className="font-bold">{document.title}</h3>
              <p className="mt-1 text-xs text-text-muted">
                {document.documentNumber} Â· v{document.version}
              </p>
            </div>
          </div>

          <Badge variant={DOCUMENT_STATUS_CONFIG[document.status].badgeVariant}>
            {DOCUMENT_STATUS_CONFIG[document.status].label}
          </Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Owner",
              value: ownerName,
            },
            {
              label: "Owner type",
              value: (
                <Badge
                  variant={DOCUMENT_OWNER_TYPE_CONFIG[document.ownerType].badgeVariant}
                >
                  {DOCUMENT_OWNER_TYPE_CONFIG[document.ownerType].label}
                </Badge>
              ),
            },
            {
              label: "Category",
              value: (
                <Badge variant={DOCUMENT_CATEGORY_CONFIG[document.category].badgeVariant}>
                  {DOCUMENT_CATEGORY_CONFIG[document.category].label}
                </Badge>
              ),
            },
            {
              label: "Visibility",
              value: DOCUMENT_VISIBILITY_CONFIG[document.visibility].label,
            },
            {
              label: "Branch",
              value: document.branchName ?? "All organization branches",
            },
            {
              label: "Uploaded",
              value: `${formatDate(document.uploadedAt)} by ${document.uploadedBy}`,
            },
            {
              label: "Issue date",
              value: document.issueDate ? formatDate(document.issueDate) : "Not recorded",
            },
            {
              label: "Expiry date",
              value: document.expiryDate ? formatDate(document.expiryDate) : "No expiry",
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">File information</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-control bg-canvas p-4">
            <p className="text-xs text-text-muted">File name</p>
            <p className="mt-1 break-all text-sm font-semibold">{document.fileName}</p>
          </div>
          <div className="rounded-control bg-canvas p-4">
            <p className="text-xs text-text-muted">File size</p>
            <p className="mt-1 text-sm font-semibold">
              {formatFileSize(document.fileSizeBytes)}
            </p>
          </div>
          <div className="rounded-control bg-canvas p-4">
            <p className="text-xs text-text-muted">MIME type</p>
            <p className="mt-1 break-all text-sm font-semibold">{document.mimeType}</p>
          </div>
          <div className="rounded-control bg-canvas p-4">
            <p className="text-xs text-text-muted">Verified by</p>
            <p className="mt-1 text-sm font-semibold">
              {document.verifiedBy ?? "Not verified"}
            </p>
          </div>
        </div>
      </section>

      {document.rejectionReason && (
        <section className="rounded-control bg-danger-muted p-4">
          <h3 className="text-sm font-bold text-danger">Rejection reason</h3>
          <p className="mt-2 text-sm leading-6 text-danger">{document.rejectionReason}</p>
        </section>
      )}

      <section>
        <h3 className="text-sm font-bold">Tags</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {document.tags.length > 0 ? (
            document.tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-text-muted">No tags have been added.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Internal note</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {document.note || "No document note has been added."}
        </p>
      </section>
    </div>
  );
}
