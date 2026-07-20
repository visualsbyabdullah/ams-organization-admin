import {
  Building2,
  FileText,
  Globe2,
  MoreHorizontal,
} from "lucide-react";

import type {
  DataTableColumn,
} from "@/components/shared/data-table";
import { IconContainer } from "@/components/shared/icon-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_COLUMN_LABELS,
  DOCUMENT_OWNER_TYPE_CONFIG,
  DOCUMENT_REQUEST_STATUS_CONFIG,
  DOCUMENT_SETTINGS_SCOPE_CONFIG,
  DOCUMENT_SETTINGS_STATUS_CONFIG,
  DOCUMENT_STATUS_CONFIG,
  DOCUMENT_TEMPLATE_OUTPUT_CONFIG,
  DOCUMENT_TEMPLATE_SCOPE_CONFIG,
  DOCUMENT_TEMPLATE_STATUS_CONFIG,
  DOCUMENT_VISIBILITY_CONFIG,
} from "@/config/documents";
import {
  BRANCH_OPTIONS,
} from "@/data/branches";
import {
  EMPLOYEES,
} from "@/data/employees";
import {
  formatDate,
} from "@/lib/date";
import {
  formatFileSize,
} from "@/lib/documents";
import type {
  DocumentRecord,
  DocumentRequest,
  DocumentSettings,
  DocumentTemplate,
} from "@/types/document";

type OpenAction<T> = {
  onOpen: (row: T) => void;
};

function getEmployee(
  employeeId?: string,
) {
  return EMPLOYEES.find(
    (employee) =>
      employee.id === employeeId,
  );
}

function getBranchName(
  branchId?: string,
) {
  return BRANCH_OPTIONS.find(
    (branch) =>
      branch.id === branchId,
  )?.name;
}

function actionColumn<T>({
  onOpen,
}: OpenAction<T>): DataTableColumn<T> {
  return {
    id: "actions",
    header:
      DOCUMENT_COLUMN_LABELS.actions,
    headClassName: "w-16",
    className: "w-16",
    cell: (row) => (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open record"
        onClick={(event) => {
          event.stopPropagation();
          onOpen(row);
        }}
      >
        <MoreHorizontal />
      </Button>
    ),
  };
}

export function createDocumentColumns({
  onOpen,
  compact = false,
}: OpenAction<DocumentRecord> & {
  compact?: boolean;
}): DataTableColumn<DocumentRecord>[] {
  const columns: DataTableColumn<DocumentRecord>[] =
    [
      {
        id: "document",
        header:
          DOCUMENT_COLUMN_LABELS.document,
        cell: (document) => (
          <div className="flex items-center gap-3">
            <IconContainer
              icon={FileText}
              tone={
                document.status ===
                  "expired" ||
                document.status ===
                  "rejected"
                  ? "danger"
                  : document.status ===
                        "pending_verification" ||
                      document.status ===
                        "expiring"
                    ? "warning"
                    : document.status ===
                        "verified"
                      ? "success"
                      : "neutral"
              }
            />

            <div>
              <p className="font-semibold">
                {document.title}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {
                  document.documentNumber
                }{" "}
                Â· {document.fileName}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "owner",
        header:
          DOCUMENT_COLUMN_LABELS.owner,
        cell: (document) => {
          const employee =
            getEmployee(
              document.employeeId,
            );

          if (
            document.ownerType ===
              "employee" &&
            employee
          ) {
            return (
              <div className="flex items-center gap-3">
                <Avatar
                  name={employee.name}
                  initials={
                    employee.initials
                  }
                />

                <div>
                  <p className="font-semibold">
                    {employee.name}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {
                      employee.employeeCode
                    }{" "}
                    Â· {employee.branchName}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-3">
              <IconContainer
                icon={
                  document.ownerType ===
                  "organization"
                    ? Globe2
                    : Building2
                }
                tone="info"
              />

              <div>
                <p className="font-semibold">
                  {
                    DOCUMENT_OWNER_TYPE_CONFIG[
                      document.ownerType
                    ].label
                  }
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {document.branchName ??
                    "All organization branches"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "category",
        header:
          DOCUMENT_COLUMN_LABELS.category,
        cell: (document) => (
          <Badge
            variant={
              DOCUMENT_CATEGORY_CONFIG[
                document.category
              ].badgeVariant
            }
          >
            {
              DOCUMENT_CATEGORY_CONFIG[
                document.category
              ].label
            }
          </Badge>
        ),
      },
      {
        id: "visibility",
        header:
          DOCUMENT_COLUMN_LABELS.visibility,
        cell: (document) =>
          DOCUMENT_VISIBILITY_CONFIG[
            document.visibility
          ].label,
      },
      {
        id: "uploaded",
        header:
          DOCUMENT_COLUMN_LABELS.uploaded,
        cell: (document) => (
          <div>
            <p className="font-medium">
              {formatDate(
                document.uploadedAt,
              )}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              {
                formatFileSize(
                  document.fileSizeBytes,
                )
              }
            </p>
          </div>
        ),
      },
      {
        id: "expiry",
        header:
          DOCUMENT_COLUMN_LABELS.expiry,
        cell: (document) =>
          document.expiryDate
            ? formatDate(
                document.expiryDate,
              )
            : "No expiry",
      },
      {
        id: "version",
        header:
          DOCUMENT_COLUMN_LABELS.version,
        cell: (document) =>
          `v${document.version}`,
      },
      {
        id: "status",
        header:
          DOCUMENT_COLUMN_LABELS.status,
        cell: (document) => (
          <Badge
            variant={
              DOCUMENT_STATUS_CONFIG[
                document.status
              ].badgeVariant
            }
          >
            {
              DOCUMENT_STATUS_CONFIG[
                document.status
              ].label
            }
          </Badge>
        ),
      },
      actionColumn({
        onOpen,
      }),
    ];

  if (!compact) {
    return columns;
  }

  const compactColumnIds =
    new Set([
      "document",
      "owner",
      "expiry",
      "status",
      "actions",
    ]);

  return columns.filter(
    (column) =>
      compactColumnIds.has(
        column.id,
      ),
  );
}

export function createDocumentRequestColumns({
  onOpen,
}: OpenAction<DocumentRequest>): DataTableColumn<DocumentRequest>[] {
  return [
    {
      id: "employee",
      header:
        DOCUMENT_COLUMN_LABELS.employee,
      cell: (request) => {
        const employee =
          getEmployee(
            request.employeeId,
          );

        return employee ? (
          <div className="flex items-center gap-3">
            <Avatar
              name={employee.name}
              initials={
                employee.initials
              }
            />

            <div>
              <p className="font-semibold">
                {employee.name}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {
                  employee.employeeCode
                }{" "}
                Â· {employee.branchName}
              </p>
            </div>
          </div>
        ) : (
          "Employee unavailable"
        );
      },
    },
    {
      id: "request",
      header:
        DOCUMENT_COLUMN_LABELS.request,
      cell: (request) => (
        <div>
          <p className="font-semibold">
            {request.title}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {
              DOCUMENT_CATEGORY_CONFIG[
                request.category
              ].label
            }
          </p>
        </div>
      ),
    },
    {
      id: "requested",
      header: "Requested",
      cell: (request) =>
        formatDate(
          request.requestedAt,
        ),
    },
    {
      id: "due",
      header:
        DOCUMENT_COLUMN_LABELS.dueDate,
      cell: (request) =>
        formatDate(request.dueDate),
    },
    {
      id: "mandatory",
      header:
        DOCUMENT_COLUMN_LABELS.mandatory,
      cell: (request) => (
        <Badge
          variant={
            request.mandatory
              ? "warning"
              : "neutral"
          }
        >
          {request.mandatory
            ? "Required"
            : "Optional"}
        </Badge>
      ),
    },
    {
      id: "status",
      header:
        DOCUMENT_COLUMN_LABELS.status,
      cell: (request) => (
        <Badge
          variant={
            DOCUMENT_REQUEST_STATUS_CONFIG[
              request.status
            ].badgeVariant
          }
        >
          {
            DOCUMENT_REQUEST_STATUS_CONFIG[
              request.status
            ].label
          }
        </Badge>
      ),
    },
    actionColumn({
      onOpen,
    }),
  ];
}

export function createDocumentTemplateColumns({
  onOpen,
}: OpenAction<DocumentTemplate>): DataTableColumn<DocumentTemplate>[] {
  return [
    {
      id: "template",
      header:
        DOCUMENT_COLUMN_LABELS.template,
      cell: (template) => (
        <div>
          <p className="font-semibold">
            {template.title}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {template.code} Â· v
            {template.version}
          </p>
        </div>
      ),
    },
    {
      id: "category",
      header:
        DOCUMENT_COLUMN_LABELS.category,
      cell: (template) => (
        <Badge
          variant={
            DOCUMENT_CATEGORY_CONFIG[
              template.category
            ].badgeVariant
          }
        >
          {
            DOCUMENT_CATEGORY_CONFIG[
              template.category
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "scope",
      header:
        DOCUMENT_COLUMN_LABELS.scope,
      cell: (template) => (
        <div>
          <Badge
            variant={
              DOCUMENT_TEMPLATE_SCOPE_CONFIG[
                template.scope
              ].badgeVariant
            }
          >
            {
              DOCUMENT_TEMPLATE_SCOPE_CONFIG[
                template.scope
              ].label
            }
          </Badge>

          <p className="mt-1 text-xs text-text-muted">
            {template.branchName ??
              "All branches"}
          </p>
        </div>
      ),
    },
    {
      id: "output",
      header:
        DOCUMENT_COLUMN_LABELS.output,
      cell: (template) =>
        DOCUMENT_TEMPLATE_OUTPUT_CONFIG[
          template.outputFormat
        ].label,
    },
    {
      id: "controls",
      header:
        DOCUMENT_COLUMN_LABELS.controls,
      cell: (template) => (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={
              template.selfService
                ? "success"
                : "neutral"
            }
          >
            {template.selfService
              ? "Self-service"
              : "Admin only"}
          </Badge>

          <Badge
            variant={
              template.approvalRequired
                ? "warning"
                : "neutral"
            }
          >
            {template.approvalRequired
              ? "Approval"
              : "No approval"}
          </Badge>
        </div>
      ),
    },
    {
      id: "updated",
      header:
        DOCUMENT_COLUMN_LABELS.updated,
      cell: (template) => (
        <div>
          <p className="font-medium">
            {formatDate(
              template.updatedAt,
            )}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {template.updatedBy}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header:
        DOCUMENT_COLUMN_LABELS.status,
      cell: (template) => (
        <Badge
          variant={
            DOCUMENT_TEMPLATE_STATUS_CONFIG[
              template.status
            ].badgeVariant
          }
        >
          {
            DOCUMENT_TEMPLATE_STATUS_CONFIG[
              template.status
            ].label
          }
        </Badge>
      ),
    },
    actionColumn({
      onOpen,
    }),
  ];
}

export function createDocumentSettingsColumns({
  onOpen,
}: OpenAction<DocumentSettings>): DataTableColumn<DocumentSettings>[] {
  return [
    {
      id: "settings",
      header:
        DOCUMENT_COLUMN_LABELS.settings,
      cell: (settings) => (
        <div>
          <p className="font-semibold">
            {settings.name}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {settings.branchName ??
              "All organization branches"}
          </p>
        </div>
      ),
    },
    {
      id: "scope",
      header:
        DOCUMENT_COLUMN_LABELS.scope,
      cell: (settings) => (
        <Badge
          variant={
            DOCUMENT_SETTINGS_SCOPE_CONFIG[
              settings.scope
            ].badgeVariant
          }
        >
          {
            DOCUMENT_SETTINGS_SCOPE_CONFIG[
              settings.scope
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "reminders",
      header:
        DOCUMENT_COLUMN_LABELS.reminders,
      cell: (settings) => (
        <div>
          <p className="font-medium">
            {
              settings.expiryReminderDays
            }{" "}
            days
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Second reminder{" "}
            {
              settings.secondExpiryReminderDays
            }{" "}
            days
          </p>
        </div>
      ),
    },
    {
      id: "upload",
      header:
        DOCUMENT_COLUMN_LABELS.uploadLimit,
      cell: (settings) => (
        <div>
          <p className="font-medium">
            {
              settings.maximumUploadMb
            }{" "}
            MB
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {
              settings.allowedFileExtensions
                .length
            }{" "}
            file types
          </p>
        </div>
      ),
    },
    {
      id: "retention",
      header: "Retention",
      cell: (settings) =>
        `${settings.retentionYears} years`,
    },
    {
      id: "status",
      header:
        DOCUMENT_COLUMN_LABELS.status,
      cell: (settings) => (
        <Badge
          variant={
            DOCUMENT_SETTINGS_STATUS_CONFIG[
              settings.status
            ].badgeVariant
          }
        >
          {
            DOCUMENT_SETTINGS_STATUS_CONFIG[
              settings.status
            ].label
          }
        </Badge>
      ),
    },
    actionColumn({
      onOpen,
    }),
  ];
}
