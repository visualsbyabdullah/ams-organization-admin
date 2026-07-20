"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Archive,
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
import { ReportSettingsForm } from "@/components/reports/report-settings-form";
import { ReportTabs } from "@/components/reports/report-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  REPORT_COPY,
  REPORT_FORMAT_CONFIG,
  REPORT_SCOPE_CONFIG,
  REPORT_SETTINGS_CONTROLS,
  REPORT_SETTINGS_STATUS_CONFIG,
} from "@/config/reports";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { REPORT_SETTINGS } from "@/data/reports";
import { formatDate } from "@/lib/date";
import type { ReportSettings } from "@/types/report";

export function ReportSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [settings, setSettings] = useState<ReportSettings[]>(REPORT_SETTINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedSettingsId, setSelectedSettingsId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

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
      const searchableValue = [item.name, item.branchName, item.note, item.defaultFormat]
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
  const scheduledEnabled = scopedSettings.filter((item) => item.scheduledReportsEnabled);
  const payrollEnabled = scopedSettings.filter((item) => item.allowPayrollDataExport);

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
      detail: "Custom reporting controls",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Scheduling enabled",
      value: String(scheduledEnabled.length),
      detail: "Settings allowing schedules",
      icon: Globe2,
      tone: "info" as const,
    },
    {
      label: "Payroll export access",
      value: String(payrollEnabled.length),
      detail: "Settings allowing payroll exports",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<ReportSettings>[]>(
    () => [
      {
        id: "settings",
        header: "Settings",
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
        header: "Scope",
        cell: (item) => (
          <Badge variant={REPORT_SCOPE_CONFIG[item.scope].badgeVariant}>
            {REPORT_SCOPE_CONFIG[item.scope].label}
          </Badge>
        ),
      },
      {
        id: "format",
        header: "Default format",
        cell: (item) => (
          <Badge variant={REPORT_FORMAT_CONFIG[item.defaultFormat].badgeVariant}>
            {REPORT_FORMAT_CONFIG[item.defaultFormat].label}
          </Badge>
        ),
      },
      {
        id: "retention",
        header: "Retention",
        cell: (item) => `${item.retentionDays} days`,
      },
      {
        id: "rows",
        header: "Maximum rows",
        cell: (item) => item.maximumRowsPerExport.toLocaleString("en-PK"),
      },
      {
        id: "payroll",
        header: "Payroll export",
        cell: (item) => (
          <Badge variant={item.allowPayrollDataExport ? "success" : "neutral"}>
            {item.allowPayrollDataExport ? "Allowed" : "Blocked"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (item) => (
          <Badge variant={REPORT_SETTINGS_STATUS_CONFIG[item.status].badgeVariant}>
            {REPORT_SETTINGS_STATUS_CONFIG[item.status].label}
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
            aria-label="Open report settings actions"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedSettingsId(item.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveSettings(nextSettings: ReportSettings) {
    setSettings((currentSettings) => {
      const exists = currentSettings.some((item) => item.id === nextSettings.id);

      return exists
        ? currentSettings.map((item) =>
            item.id === nextSettings.id ? nextSettings : item,
          )
        : [nextSettings, ...currentSettings];
    });

    setEditorMode(null);
    setSelectedSettingsId(nextSettings.id);
  }

  function duplicateSettings() {
    if (!selectedSettings) {
      return;
    }

    const duplicate: ReportSettings = {
      ...selectedSettings,
      id: crypto.randomUUID(),
      name: `${selectedSettings.name} Copy`,
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };

    setSettings((currentSettings) => [duplicate, ...currentSettings]);
    setSelectedSettingsId(duplicate.id);
  }

  function updateStatus(status: ReportSettings["status"]) {
    if (!selectedSettings) {
      return;
    }

    setSettings((currentSettings) =>
      currentSettings.map((item) =>
        item.id === selectedSettings.id
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
    ? REPORT_SETTINGS_CONTROLS.map((control) => ({
        label: control.label,
        enabled: Boolean(effectiveSettings[control.key]),
      }))
    : [];

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={REPORT_COPY.settings.eyebrow}
        title={REPORT_COPY.settings.title}
        description={REPORT_COPY.settings.description}
        actions={
          <Button
            onClick={() => {
              setSelectedSettingsId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {REPORT_COPY.settings.createAction}
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{REPORT_COPY.settings.registerTitle}</h2>
            <p className="mt-1 text-sm text-text-muted">
              {REPORT_COPY.settings.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={REPORT_COPY.settings.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{REPORT_COPY.settings.allScopes}</option>
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
                <option value="all">{REPORT_COPY.settings.allStatuses}</option>
                {Object.entries(REPORT_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
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
                <h3 className="mt-4 font-bold">{REPORT_COPY.settings.emptyTitle}</h3>
                <p className="mt-2 text-sm text-text-muted">
                  {REPORT_COPY.settings.emptyDescription}
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
              <h2 className="text-lg font-bold">{REPORT_COPY.settings.effectiveTitle}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {REPORT_COPY.settings.effectiveDescription}
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
                  <p className="text-xs text-text-muted">Default format</p>
                  <p className="mt-1 text-sm font-bold">
                    {REPORT_FORMAT_CONFIG[effectiveSettings.defaultFormat].label}
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Retention</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.retentionDays} days
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Maximum rows</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.maximumRowsPerExport.toLocaleString("en-PK")}
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Payroll exports</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.allowPayrollDataExport ? "Allowed" : "Blocked"}
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
              No active organization report settings are available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedSettings)}
        onClose={() => setSelectedSettingsId(null)}
        title="Report settings"
        description={selectedSettings?.name}
        footer={
          selectedSettings ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateSettings}>
                <Copy />
                Duplicate
              </Button>

              {selectedSettings.status === "active" ? (
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

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit
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
                    REPORT_SETTINGS_STATUS_CONFIG[selectedSettings.status].badgeVariant
                  }
                >
                  {REPORT_SETTINGS_STATUS_CONFIG[selectedSettings.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Scope",
                    value: REPORT_SCOPE_CONFIG[selectedSettings.scope].label,
                  },
                  {
                    label: "Branch",
                    value: selectedSettings.branchName ?? "All organization branches",
                  },
                  {
                    label: "Default format",
                    value: REPORT_FORMAT_CONFIG[selectedSettings.defaultFormat].label,
                  },
                  {
                    label: "Retention",
                    value: `${selectedSettings.retentionDays} days`,
                  },
                  {
                    label: "Maximum rows",
                    value: selectedSettings.maximumRowsPerExport.toLocaleString("en-PK"),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Reporting controls</h3>
              <ToggleDetailList
                items={REPORT_SETTINGS_CONTROLS.map((control) => ({
                  label: control.label,
                  enabled: Boolean(selectedSettings[control.key]),
                }))}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>
              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedSettings.note || "No report settings note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add report settings" : "Edit report settings"}
        description="Configure export limits, retention and sensitive-data controls for the selected scope."
      >
        {editorMode && (
          <ReportSettingsForm
            key={editorMode === "create" ? "new-report-settings" : selectedSettings?.id}
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
