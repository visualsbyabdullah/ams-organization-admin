"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Archive,
  Building2,
  CheckCircle2,
  Copy,
  FilePenLine,
  FileSearch,
  HardDrive,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DocumentSettingsDetails } from "@/components/documents/document-settings-details";
import { DocumentSettingsForm } from "@/components/documents/document-settings-form";
import { DocumentTabs } from "@/components/documents/document-tabs";
import { createDocumentSettingsColumns } from "@/components/documents/document-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { IconContainer } from "@/components/shared/icon-container";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DOCUMENT_ACTION_LABELS,
  DOCUMENT_SETTINGS_CONTROL_LABELS,
  DOCUMENT_SETTINGS_SCOPE_CONFIG,
  DOCUMENT_SETTINGS_STATUS_CONFIG,
  DOCUMENT_VISIBILITY_CONFIG,
  DOCUMENTS_COPY,
} from "@/config/documents";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { DOCUMENT_SETTINGS } from "@/data/documents";
import {
  resolveDocumentSettings,
  settingsAreInScope,
} from "@/lib/documents";
import type {
  DocumentSettings,
  DocumentSettingsStatus,
} from "@/types/document";

type EditorMode =
  | "create"
  | "edit"
  | null;

export function DocumentSettingsWorkspace() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [
    settings,
    setSettings,
  ] = useState<DocumentSettings[]>(
    DOCUMENT_SETTINGS,
  );

  const [searchQuery, setSearchQuery] =
    useState("");
  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");
  const [
    scopeFilter,
    setScopeFilter,
  ] = useState("all");
  const [
    selectedSettingsId,
    setSelectedSettingsId,
  ] = useState<string | null>(
    null,
  );
  const [
    editorMode,
    setEditorMode,
  ] = useState<EditorMode>(
    null,
  );

  const scopedSettings = useMemo(
    () =>
      settings.filter(
        (item) =>
          settingsAreInScope(
            item,
            selectedBranchId,
          ),
      ),
    [
      selectedBranchId,
      settings,
    ],
  );

  const visibleSettings =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return scopedSettings.filter(
        (item) => {
          const searchableValue = [
            item.name,
            item.branchName,
            item.allowedFileExtensions.join(
              " ",
            ),
            item.note,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return (
            searchableValue.includes(
              query,
            ) &&
            (statusFilter === "all" ||
              item.status ===
                statusFilter) &&
            (scopeFilter === "all" ||
              item.scope ===
                scopeFilter)
          );
        },
      );
    }, [
      scopedSettings,
      scopeFilter,
      searchQuery,
      statusFilter,
    ]);

  const selectedSettings =
    settings.find(
      (item) =>
        item.id ===
        selectedSettingsId,
    ) ?? null;

  const effectiveSettings =
    resolveDocumentSettings(
      settings,
      selectedBranchId,
    );

  const metrics = [
    {
      label: "Active settings",
      value: String(
        scopedSettings.filter(
          (item) =>
            item.status === "active",
        ).length,
      ),
      detail: selectedBranch.name,
      icon: Settings2,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: String(
        scopedSettings.filter(
          (item) =>
            item.scope === "branch",
        ).length,
      ),
      detail:
        "Custom document controls",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Upload limit",
      value:
        effectiveSettings
          ? `${effectiveSettings.maximumUploadMb} MB`
          : "Not set",
      detail:
        "Effective maximum file size",
      icon: HardDrive,
      tone: "info" as const,
    },
    {
      label: "Expiry reminder",
      value:
        effectiveSettings
          ? `${effectiveSettings.expiryReminderDays} days`
          : "Not set",
      detail:
        "Effective first reminder",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
  ];

  const columns =
    createDocumentSettingsColumns({
      onOpen: (item) =>
        setSelectedSettingsId(
          item.id,
        ),
    });

  function saveSettings(
    nextSettings: DocumentSettings,
  ) {
    setSettings(
      (currentSettings) => {
        const exists =
          currentSettings.some(
            (item) =>
              item.id ===
              nextSettings.id,
          );

        return exists
          ? currentSettings.map(
              (item) =>
                item.id ===
                nextSettings.id
                  ? nextSettings
                  : item,
            )
          : [
              nextSettings,
              ...currentSettings,
            ];
      },
    );

    setSelectedSettingsId(
      nextSettings.id,
    );
    setEditorMode(null);
  }

  function duplicateSettings(
    source: DocumentSettings,
  ) {
    const duplicate: DocumentSettings =
      {
        ...source,
        id: crypto.randomUUID(),
        name: `${source.name} Copy`,
        status: "draft",
        updatedAt: new Date()
          .toISOString()
          .slice(0, 10),
        updatedBy:
          CURRENT_ADMIN.name,
      };

    setSettings(
      (currentSettings) => [
        duplicate,
        ...currentSettings,
      ],
    );
    setSelectedSettingsId(
      duplicate.id,
    );
  }

  function updateStatus(
    settingsId: string,
    status: DocumentSettingsStatus,
  ) {
    setSettings(
      (currentSettings) =>
        currentSettings.map(
          (item) =>
            item.id === settingsId
              ? {
                  ...item,
                  status,
                  updatedAt: new Date()
                    .toISOString()
                    .slice(0, 10),
                  updatedBy:
                    CURRENT_ADMIN.name,
                }
              : item,
        ),
    );
  }

  const effectiveControls =
    effectiveSettings
      ? [
          {
            label:
              DOCUMENT_SETTINGS_CONTROL_LABELS.employeeUploadsAllowed,
            enabled:
              effectiveSettings.employeeUploadsAllowed,
          },
          {
            label:
              DOCUMENT_SETTINGS_CONTROL_LABELS.managerUploadsAllowed,
            enabled:
              effectiveSettings.managerUploadsAllowed,
          },
          {
            label:
              DOCUMENT_SETTINGS_CONTROL_LABELS.verificationRequired,
            enabled:
              effectiveSettings.verificationRequired,
          },
          {
            label:
              DOCUMENT_SETTINGS_CONTROL_LABELS.versionHistoryEnabled,
            enabled:
              effectiveSettings.versionHistoryEnabled,
          },
          {
            label:
              DOCUMENT_SETTINGS_CONTROL_LABELS.electronicSignatureRequired,
            enabled:
              effectiveSettings.electronicSignatureRequired,
          },
          {
            label:
              DOCUMENT_SETTINGS_CONTROL_LABELS.selfServiceDownloadsAllowed,
            enabled:
              effectiveSettings.selfServiceDownloadsAllowed,
          },
        ]
      : [];

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          DOCUMENTS_COPY.eyebrow
        }
        title={
          DOCUMENTS_COPY.settings
            .title
        }
        description={
          DOCUMENTS_COPY.settings
            .description
        }
        actions={
          <Button
            onClick={() => {
              setSelectedSettingsId(
                null,
              );
              setEditorMode(
                "create",
              );
            }}
          >
            <Plus />
            {
              DOCUMENT_ACTION_LABELS.createSettings
            }
          </Button>
        }
      />

      <div className="mt-7">
        <DocumentTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">
              {
                DOCUMENTS_COPY.settings
                  .registerTitle
              }
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {
                DOCUMENTS_COPY.settings
                  .registerDescription
              }
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
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
                    DOCUMENTS_COPY.settings
                      .searchPlaceholder
                  }
                  className="pl-9"
                />
              </div>

              <Select
                value={scopeFilter}
                onChange={(event) =>
                  setScopeFilter(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  {
                    DOCUMENTS_COPY.settings
                      .allScopes
                  }
                </option>
                {Object.entries(
                  DOCUMENT_SETTINGS_SCOPE_CONFIG,
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
                    DOCUMENTS_COPY.settings
                      .allStatuses
                  }
                </option>
                {Object.entries(
                  DOCUMENT_SETTINGS_STATUS_CONFIG,
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
            rows={visibleSettings}
            columns={columns}
            getRowKey={(item) =>
              item.id
            }
            onRowClick={(item) =>
              setSelectedSettingsId(
                item.id,
              )
            }
            emptyState={
              <EmptyState
                icon={FileSearch}
                title={
                  DOCUMENTS_COPY.settings
                    .emptyTitle
                }
                description={
                  DOCUMENTS_COPY.settings
                    .emptyDescription
                }
                action={
                  <Button
                    onClick={() =>
                      setEditorMode(
                        "create",
                      )
                    }
                  >
                    <Plus />
                    {
                      DOCUMENT_ACTION_LABELS.createSettings
                    }
                  </Button>
                }
              />
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <IconContainer
              icon={CheckCircle2}
              tone="success"
            />
            <div>
              <h2 className="text-lg font-bold">
                {
                  DOCUMENTS_COPY.settings
                    .effectiveTitle
                }
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {
                  DOCUMENTS_COPY.settings
                    .effectiveDescription
                }
              </p>
            </div>
          </div>

          {effectiveSettings ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-control border border-border p-4">
                <p className="text-sm font-bold">
                  {
                    effectiveSettings.name
                  }
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {effectiveSettings.scope ===
                  "branch"
                    ? "Active branch override"
                    : "Organization default"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">
                    Retention
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {
                      effectiveSettings.retentionYears
                    }{" "}
                    years
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">
                    Upload limit
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {
                      effectiveSettings.maximumUploadMb
                    }{" "}
                    MB
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">
                    Reminder
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {
                      effectiveSettings.expiryReminderDays
                    }{" "}
                    days
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">
                    Visibility
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {
                      DOCUMENT_VISIBILITY_CONFIG[
                        effectiveSettings.defaultVisibility
                      ].label
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {effectiveControls.map(
                  (control) => (
                    <div
                      key={control.label}
                      className="flex items-center justify-between rounded-control border border-border px-4 py-3"
                    >
                      <span className="text-sm font-medium">
                        {control.label}
                      </span>
                      <Badge
                        variant={
                          control.enabled
                            ? "success"
                            : "neutral"
                        }
                      >
                        {control.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
              No active organization document settings are available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(
          selectedSettings,
        )}
        onClose={() =>
          setSelectedSettingsId(
            null,
          )
        }
        title="Document settings"
        description={
          selectedSettings?.name
        }
        footer={
          selectedSettings ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  duplicateSettings(
                    selectedSettings,
                  )
                }
              >
                <Copy />
                {
                  DOCUMENT_ACTION_LABELS.duplicate
                }
              </Button>

              {selectedSettings.status ===
                "active" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(
                      selectedSettings.id,
                      "archived",
                    )
                  }
                >
                  <Archive />
                  {
                    DOCUMENT_ACTION_LABELS.archive
                  }
                </Button>
              )}

              {selectedSettings.status !==
                "active" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(
                      selectedSettings.id,
                      "active",
                    )
                  }
                >
                  <CheckCircle2 />
                  {
                    DOCUMENT_ACTION_LABELS.activate
                  }
                </Button>
              )}

              <Button
                onClick={() =>
                  setEditorMode("edit")
                }
              >
                <FilePenLine />
                {
                  DOCUMENT_ACTION_LABELS.editSettings
                }
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedSettings && (
          <DocumentSettingsDetails
            settings={
              selectedSettings
            }
          />
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() =>
          setEditorMode(null)
        }
        title={
          editorMode === "create"
            ? "Add document settings"
            : "Edit document settings"
        }
        description="Configure retention, expiry, upload, verification and access controls."
      >
        {editorMode && (
          <DocumentSettingsForm
            key={
              editorMode === "create"
                ? "new-document-settings"
                : selectedSettings?.id
            }
            settings={
              editorMode === "edit"
                ? selectedSettings ??
                  undefined
                : undefined
            }
            selectedBranchId={
              selectedBranchId
            }
            onCancel={() =>
              setEditorMode(null)
            }
            onSave={saveSettings}
          />
        )}
      </Drawer>
    </div>
  );
}
