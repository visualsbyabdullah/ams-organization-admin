"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Download,
  Files,
  Search,
  Upload,
} from "lucide-react";

import { DocumentDetails } from "@/components/documents/document-details";
import { DocumentTabs } from "@/components/documents/document-tabs";
import { createDocumentColumns } from "@/components/documents/document-table-columns";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DOCUMENT_ACTION_LABELS,
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_DEFAULT_REJECTION_REASON,
  DOCUMENT_OWNER_TYPE_CONFIG,
  DOCUMENT_STATUS_CONFIG,
  DOCUMENTS_COPY,
} from "@/config/documents";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import {
  DOCUMENT_RECORDS,
  DOCUMENT_SETTINGS,
} from "@/data/documents";
import { EMPLOYEES } from "@/data/employees";
import {
  documentIsInScope,
  downloadCsv,
  resolveDocumentSettings,
} from "@/lib/documents";
import type {
  DocumentRecord,
  DocumentStatus,
} from "@/types/document";

export function DocumentLibraryWorkspace() {
  const {
    selectedBranchId,
  } = useBranchScope();

  const [
    documents,
    setDocuments,
  ] = useState<DocumentRecord[]>(
    DOCUMENT_RECORDS,
  );

  const [searchQuery, setSearchQuery] =
    useState("");
  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");
  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");
  const [
    ownerFilter,
    setOwnerFilter,
  ] = useState("all");
  const [
    selectedDocumentId,
    setSelectedDocumentId,
  ] = useState<string | null>(
    null,
  );
  const [uploadOpen, setUploadOpen] =
    useState(false);

  const effectiveSettings =
    resolveDocumentSettings(
      DOCUMENT_SETTINGS,
      selectedBranchId,
    );

  const scopedDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          documentIsInScope(
            document,
            selectedBranchId,
          ),
      ),
    [
      documents,
      selectedBranchId,
    ],
  );

  const visibleDocuments =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return scopedDocuments.filter(
        (document) => {
          const employee =
            EMPLOYEES.find(
              (item) =>
                item.id ===
                document.employeeId,
            );

          const searchableValue = [
            document.title,
            document.documentNumber,
            document.fileName,
            document.branchName,
            employee?.name,
            employee?.employeeCode,
            document.tags.join(" "),
            document.note,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return (
            searchableValue.includes(
              query,
            ) &&
            (statusFilter === "all" ||
              document.status ===
                statusFilter) &&
            (categoryFilter ===
              "all" ||
              document.category ===
                categoryFilter) &&
            (ownerFilter === "all" ||
              document.ownerType ===
                ownerFilter)
          );
        },
      );
    }, [
      categoryFilter,
      ownerFilter,
      scopedDocuments,
      searchQuery,
      statusFilter,
    ]);

  const selectedDocument =
    documents.find(
      (document) =>
        document.id ===
        selectedDocumentId,
    ) ?? null;

  const columns =
    createDocumentColumns({
      onOpen: (document) =>
        setSelectedDocumentId(
          document.id,
        ),
    });

  function createDocument(
    document: DocumentRecord,
  ) {
    setDocuments(
      (currentDocuments) => [
        document,
        ...currentDocuments,
      ],
    );
    setUploadOpen(false);
    setSelectedDocumentId(
      document.id,
    );
  }

  function updateStatus(
    documentId: string,
    status: DocumentStatus,
  ) {
    const actionDate = new Date()
      .toISOString()
      .slice(0, 10);

    setDocuments(
      (currentDocuments) =>
        currentDocuments.map(
          (document) =>
            document.id ===
            documentId
              ? {
                  ...document,
                  status,
                  verifiedAt:
                    status ===
                    "verified"
                      ? actionDate
                      : document.verifiedAt,
                  verifiedBy:
                    status ===
                    "verified"
                      ? CURRENT_ADMIN.name
                      : document.verifiedBy,
                  rejectionReason:
                    status ===
                    "rejected"
                      ? DOCUMENT_DEFAULT_REJECTION_REASON
                      : status ===
                          "verified"
                        ? undefined
                        : document.rejectionReason,
                }
              : document,
        ),
    );
  }

  function exportDocuments() {
    downloadCsv(
      "ams-document-library.csv",
      [
        "Document number",
        "Title",
        "Category",
        "Owner",
        "Branch",
        "Visibility",
        "Status",
        "Version",
        "Uploaded",
        "Expiry",
        "File",
      ],
      visibleDocuments.map(
        (document) => [
          document.documentNumber,
          document.title,
          document.category,
          document.ownerType,
          document.branchName,
          document.visibility,
          document.status,
          document.version,
          document.uploadedAt,
          document.expiryDate,
          document.fileName,
        ],
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          DOCUMENTS_COPY.eyebrow
        }
        title={
          DOCUMENTS_COPY.library
            .title
        }
        description={
          DOCUMENTS_COPY.library
            .description
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={
                exportDocuments
              }
            >
              <Download />
              {
                DOCUMENT_ACTION_LABELS.export
              }
            </Button>
            <Button
              onClick={() =>
                setUploadOpen(true)
              }
            >
              <Upload />
              {
                DOCUMENT_ACTION_LABELS.upload
              }
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <DocumentTabs />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {
              DOCUMENTS_COPY.library
                .registerTitle
            }
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {
              DOCUMENTS_COPY.library
                .registerDescription
            }
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_13rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder={
                  DOCUMENTS_COPY.library
                    .searchPlaceholder
                }
                className="pl-9"
              />
            </div>

            <Select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  DOCUMENTS_COPY.library
                    .allCategories
                }
              </option>
              {Object.entries(
                DOCUMENT_CATEGORY_CONFIG,
              ).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={ownerFilter}
              onChange={(event) =>
                setOwnerFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  DOCUMENTS_COPY.library
                    .allOwners
                }
              </option>
              {Object.entries(
                DOCUMENT_OWNER_TYPE_CONFIG,
              ).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  DOCUMENTS_COPY.library
                    .allStatuses
                }
              </option>
              {Object.entries(
                DOCUMENT_STATUS_CONFIG,
              ).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleDocuments}
          columns={columns}
          getRowKey={(document) =>
            document.id
          }
          onRowClick={(document) =>
            setSelectedDocumentId(
              document.id,
            )
          }
          emptyState={
            <EmptyState
              icon={Files}
              title={
                DOCUMENTS_COPY.library
                  .emptyTitle
              }
              description={
                DOCUMENTS_COPY.library
                  .emptyDescription
              }
              action={
                <Button
                  onClick={() =>
                    setUploadOpen(true)
                  }
                >
                  <Upload />
                  {
                    DOCUMENT_ACTION_LABELS.upload
                  }
                </Button>
              }
            />
          }
        />
      </Card>

      <Drawer
        open={Boolean(
          selectedDocument,
        )}
        onClose={() =>
          setSelectedDocumentId(
            null,
          )
        }
        title="Document record"
        description={
          selectedDocument
            ?.documentNumber
        }
        footer={
          selectedDocument ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedDocument.status ===
                "pending_verification" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateStatus(
                        selectedDocument.id,
                        "rejected",
                      )
                    }
                  >
                    {
                      DOCUMENT_ACTION_LABELS.reject
                    }
                  </Button>
                  <Button
                    onClick={() =>
                      updateStatus(
                        selectedDocument.id,
                        "verified",
                      )
                    }
                  >
                    {
                      DOCUMENT_ACTION_LABELS.verify
                    }
                  </Button>
                </>
              )}

              {selectedDocument.status !==
                "archived" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(
                      selectedDocument.id,
                      "archived",
                    )
                  }
                >
                  {
                    DOCUMENT_ACTION_LABELS.archive
                  }
                </Button>
              )}

              {selectedDocument.status ===
                "archived" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(
                      selectedDocument.id,
                      "draft",
                    )
                  }
                >
                  {
                    DOCUMENT_ACTION_LABELS.restore
                  }
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedDocument && (
          <DocumentDetails
            document={
              selectedDocument
            }
          />
        )}
      </Drawer>

      <Drawer
        open={uploadOpen}
        onClose={() =>
          setUploadOpen(false)
        }
        title="Upload document"
        description="Add an employee, branch or organization document to the central library."
      >
        <DocumentUploadForm
          selectedBranchId={
            selectedBranchId
          }
          maximumUploadMb={
            effectiveSettings
              ?.maximumUploadMb ??
            25
          }
          allowedFileExtensions={
            effectiveSettings
              ?.allowedFileExtensions ??
            [
              ".pdf",
              ".doc",
              ".docx",
              ".jpg",
              ".jpeg",
              ".png",
            ]
          }
          verificationRequired={
            effectiveSettings
              ?.verificationRequired ??
            true
          }
          onCancel={() =>
            setUploadOpen(false)
          }
          onCreate={
            createDocument
          }
        />
      </Drawer>
    </div>
  );
}
