"use client";

import { type MouseEvent, useMemo, useState } from "react";
import {
  Archive,
  Award,
  Building2,
  CheckCircle2,
  Copy,
  FilePenLine,
  Globe2,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingSettingsForm } from "@/components/training/training-settings-form";
import { TrainingTabs } from "@/components/training/training-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TRAINING_COPY,
  TRAINING_SETTINGS_SCOPE_CONFIG,
  TRAINING_SETTINGS_STATUS_CONFIG,
} from "@/config/training";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { TRAINING_SETTINGS } from "@/data/training";
import { formatDate } from "@/lib/date";
import type { TrainingSettings, TrainingSettingsStatus } from "@/types/training";

type EditorMode = "create" | "edit" | null;

export function TrainingSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [settings, setSettings] = useState<TrainingSettings[]>(TRAINING_SETTINGS);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [scopeFilter, setScopeFilter] = useState("all");

  const [selectedSettingsId, setSelectedSettingsId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedSettings = useMemo(
    () =>
      settings.filter(
        (item) =>
          selectedBranch.isAggregate ||
          item.scope === "organization" ||
          item.branchId === selectedBranch.id,
      ),
    [selectedBranch, settings],
  );

  const visibleSettings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedSettings.filter((item) => {
      const searchableValue = [
        item.name,
        item.branchName,
        item.updatedBy,
        TRAINING_SETTINGS_SCOPE_CONFIG[item.scope].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableValue.includes(query) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (scopeFilter === "all" || item.scope === scopeFilter)
      );
    });
  }, [scopedSettings, scopeFilter, searchQuery, statusFilter]);

  const selectedSettings =
    settings.find((item) => item.id === selectedSettingsId) ?? null;

  const organizationDefault =
    settings.find((item) => item.scope === "organization" && item.status === "active") ??
    null;

  const branchOverride = selectedBranch.isAggregate
    ? null
    : (settings.find(
        (item) =>
          item.scope === "branch" &&
          item.branchId === selectedBranch.id &&
          item.status === "active",
      ) ?? null);

  const effectiveSettings = branchOverride ?? organizationDefault;

  const activeSettings = scopedSettings.filter((item) => item.status === "active");

  const branchOverrides = scopedSettings.filter((item) => item.scope === "branch");

  const metrics = [
    {
      label: "Active settings",
      value: String(activeSettings.length),
      detail: selectedBranch.name,
      icon: Settings2,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: String(branchOverrides.length),
      detail: "Custom learning rules",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Completion target",
      value: `${effectiveSettings?.mandatoryCompletionTarget ?? 0}%`,
      detail: "Effective mandatory target",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
    {
      label: "Certificate automation",
      value: effectiveSettings?.autoIssueCertificates ? "Enabled" : "Disabled",
      detail: "Effective certification rule",
      icon: Award,
      tone: effectiveSettings?.autoIssueCertificates
        ? ("success" as const)
        : ("danger" as const),
    },
  ];

  const columns = useMemo<DataTableColumn<TrainingSettings>[]>(
    () => [
      {
        id: "settings",
        header: TRAINING_COPY.settings.columns.settings,
        cell: (item) => (
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              {item.scope === "organization" ? (
                <Globe2 size={18} />
              ) : (
                <Building2 size={18} />
              )}
            </span>

            <div>
              <p className="font-semibold">{item.name}</p>

              <p className="mt-1 text-xs text-text-muted">
                {item.branchName ?? "All organization branches"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "scope",
        header: TRAINING_COPY.settings.columns.scope,
        cell: (item) => (
          <Badge variant={TRAINING_SETTINGS_SCOPE_CONFIG[item.scope].badgeVariant}>
            {TRAINING_SETTINGS_SCOPE_CONFIG[item.scope].label}
          </Badge>
        ),
      },
      {
        id: "dueDays",
        header: TRAINING_COPY.settings.columns.dueDays,
        cell: (item) => `${item.defaultDueDays} days`,
      },
      {
        id: "reminder",
        header: TRAINING_COPY.settings.columns.reminder,
        cell: (item) => `${item.reminderDaysBeforeDue} days before`,
      },
      {
        id: "completionTarget",
        header: TRAINING_COPY.settings.columns.completionTarget,
        cell: (item) => `${item.mandatoryCompletionTarget}%`,
      },
      {
        id: "certificates",
        header: TRAINING_COPY.settings.columns.certificates,
        cell: (item) => (
          <Badge variant={item.autoIssueCertificates ? "success" : "neutral"}>
            {item.autoIssueCertificates ? "Automatic" : "Manual"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: TRAINING_COPY.settings.columns.status,
        cell: (item) => (
          <Badge variant={TRAINING_SETTINGS_STATUS_CONFIG[item.status].badgeVariant}>
            {TRAINING_SETTINGS_STATUS_CONFIG[item.status].label}
          </Badge>
        ),
      },
    ],
    [],
  );

  function saveSettings(nextSettings: TrainingSettings) {
    setSettings((currentSettings) => {
      const exists = currentSettings.some((item) => item.id === nextSettings.id);

      return exists
        ? currentSettings.map((item) =>
            item.id === nextSettings.id ? nextSettings : item,
          )
        : [nextSettings, ...currentSettings];
    });

    setSelectedSettingsId(nextSettings.id);
    setEditorMode(null);
  }

  function duplicateSettings(item: TrainingSettings) {
    const duplicate: TrainingSettings = {
      ...item,
      id: crypto.randomUUID(),
      name: `${item.name} Copy`,
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };

    setSettings((currentSettings) => [duplicate, ...currentSettings]);
    setSelectedSettingsId(duplicate.id);
  }

  function updateStatus(settingsId: string, status: TrainingSettingsStatus) {
    setSettings((currentSettings) =>
      currentSettings.map((item) =>
        item.id === settingsId
          ? {
              ...item,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : item,
      ),
    );
  }

  const effectiveControls = effectiveSettings
    ? [
        {
          label: "Self-enrollment",
          enabled: effectiveSettings.allowSelfEnrollment,
        },
        {
          label: "Manager approval",
          enabled: effectiveSettings.managerApprovalRequired,
        },
        {
          label: "Automatic certificates",
          enabled: effectiveSettings.autoIssueCertificates,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={TRAINING_COPY.eyebrow}
        title={TRAINING_COPY.settings.title}
        description={TRAINING_COPY.settings.description}
        actions={
          <Button
            onClick={() => {
              setSelectedSettingsId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {TRAINING_COPY.settings.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <TrainingTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{TRAINING_COPY.settings.registerTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {TRAINING_COPY.settings.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={TRAINING_COPY.settings.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{TRAINING_COPY.settings.allScopes}</option>

                {Object.entries(TRAINING_SETTINGS_SCOPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{TRAINING_COPY.settings.allStatuses}</option>

                {Object.entries(TRAINING_SETTINGS_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
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
            getRowKey={(item) => item.id}
            onRowClick={(item) => setSelectedSettingsId(item.id)}
            emptyState={
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <Settings2 className="size-8 text-text-muted" />

                <h3 className="mt-4 font-bold">{TRAINING_COPY.settings.emptyTitle}</h3>

                <p className="mt-2 text-sm text-text-muted">
                  {TRAINING_COPY.settings.emptyDescription}
                </p>
              </div>
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
              <CheckCircle2 size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {TRAINING_COPY.settings.effectiveTitle}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {TRAINING_COPY.settings.effectiveDescription}
              </p>
            </div>
          </div>

          {effectiveSettings ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-control border border-border p-4">
                <p className="text-sm font-bold">{effectiveSettings.name}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {branchOverride ? "Active branch override" : "Organization default"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Completion window</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.defaultDueDays} days
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Reminder</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.reminderDaysBeforeDue} days
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Completion target</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.mandatoryCompletionTarget}%
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Expiry reminder</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.certificationExpiryReminderDays} days
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {effectiveControls.map((control) => (
                  <div
                    key={control.label}
                    className="flex items-center justify-between rounded-control border border-border px-4 py-3"
                  >
                    <span className="text-sm font-medium">{control.label}</span>

                    <Badge variant={control.enabled ? "success" : "neutral"}>
                      {control.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
              No active organization training settings are available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedSettings)}
        onClose={() => setSelectedSettingsId(null)}
        title="Training settings"
        description={selectedSettings?.name}
        footer={
          selectedSettings ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => duplicateSettings(selectedSettings)}
              >
                <Copy />
                Duplicate
              </Button>

              {selectedSettings.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedSettings.id, "archived")}
                >
                  <Archive />
                  Archive
                </Button>
              )}

              {selectedSettings.status !== "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedSettings.id, "active")}
                >
                  <CheckCircle2 />
                  Activate
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit settings
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedSettings && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedSettings.name}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Updated by {selectedSettings.updatedBy} on{" "}
                    {formatDate(selectedSettings.updatedAt)}
                  </p>
                </div>

                <Badge
                  variant={
                    TRAINING_SETTINGS_STATUS_CONFIG[selectedSettings.status].badgeVariant
                  }
                >
                  {TRAINING_SETTINGS_STATUS_CONFIG[selectedSettings.status].label}
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Scope</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {TRAINING_SETTINGS_SCOPE_CONFIG[selectedSettings.scope].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Branch</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.branchName ?? "All organization branches"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Default completion window</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.defaultDueDays} days
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Due-date reminder</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.reminderDaysBeforeDue} days before
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Certificate expiry reminder</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.certificationExpiryReminderDays} days before
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Mandatory completion target</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.mandatoryCompletionTarget}%
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Learning controls</h3>

              <div className="mt-3 space-y-3">
                {[
                  {
                    label: "Self-enrollment",
                    enabled: selectedSettings.allowSelfEnrollment,
                  },
                  {
                    label: "Manager approval",
                    enabled: selectedSettings.managerApprovalRequired,
                  },
                  {
                    label: "Automatic certificates",
                    enabled: selectedSettings.autoIssueCertificates,
                  },
                ].map((control) => (
                  <div
                    key={control.label}
                    className="flex items-center justify-between rounded-control border border-border p-4"
                  >
                    <span className="text-sm font-semibold">{control.label}</span>

                    <Badge variant={control.enabled ? "success" : "neutral"}>
                      {control.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedSettings.note || "No training settings note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add training settings" : "Edit training settings"
        }
        description="Configure assignment windows, reminders, approvals and certification rules."
      >
        {editorMode && (
          <TrainingSettingsForm
            key={editorMode === "create" ? "new-training-settings" : selectedSettings?.id}
            settings={editorMode === "edit" ? (selectedSettings ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveSettings}
          />
        )}
      </Drawer>
    </div>
  );
}
