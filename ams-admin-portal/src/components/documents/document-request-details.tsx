import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_REQUEST_STATUS_CONFIG,
} from "@/config/documents";
import { DOCUMENT_RECORDS } from "@/data/documents";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import type { DocumentRequest } from "@/types/document";

type DocumentRequestDetailsProps = {
  request: DocumentRequest;
};

export function DocumentRequestDetails({ request }: DocumentRequestDetailsProps) {
  const employee = EMPLOYEES.find((item) => item.id === request.employeeId);

  const linkedDocument = DOCUMENT_RECORDS.find(
    (document) => document.id === request.linkedDocumentId,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{request.title}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Requested {formatDate(request.requestedAt)}
            </p>
          </div>

          <Badge variant={DOCUMENT_REQUEST_STATUS_CONFIG[request.status].badgeVariant}>
            {DOCUMENT_REQUEST_STATUS_CONFIG[request.status].label}
          </Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Employee",
              value: employee?.name ?? "Employee unavailable",
            },
            {
              label: "Employee ID",
              value: employee?.employeeCode ?? "Not available",
            },
            {
              label: "Branch",
              value: employee?.branchName ?? "Branch unavailable",
            },
            {
              label: "Category",
              value: (
                <Badge variant={DOCUMENT_CATEGORY_CONFIG[request.category].badgeVariant}>
                  {DOCUMENT_CATEGORY_CONFIG[request.category].label}
                </Badge>
              ),
            },
            {
              label: "Due date",
              value: formatDate(request.dueDate),
            },
            {
              label: "Requirement",
              value: (
                <Badge variant={request.mandatory ? "warning" : "neutral"}>
                  {request.mandatory ? "Mandatory" : "Optional"}
                </Badge>
              ),
            },
            {
              label: "Requested by",
              value: request.requestedBy,
            },
            {
              label: "Submitted date",
              value: request.submittedAt
                ? formatDate(request.submittedAt)
                : "Not submitted",
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Linked document</h3>
        <div className="mt-3 rounded-control bg-canvas p-4">
          <p className="text-sm font-semibold">
            {linkedDocument?.title ?? "No document linked"}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {linkedDocument?.documentNumber ??
              "The request is not linked to a submitted document."}
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Request note</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {request.note || "No request note has been added."}
        </p>
      </section>
    </div>
  );
}
