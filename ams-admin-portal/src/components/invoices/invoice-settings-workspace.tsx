"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Building2,
  CheckCircle2,
  Copy,
  FilePenLine,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { InvoiceSettingsForm } from "@/components/invoices/invoice-settings-form";
import { InvoiceTabs } from "@/components/invoices/invoice-tabs";
import { createInvoiceSettingsColumns } from "@/components/invoices/invoice-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  INVOICE_COPY,
  INVOICE_SETTINGS_SCOPE_CONFIG,
  INVOICE_SETTINGS_STATUS_CONFIG,
} from "@/config/invoices";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { INVOICE_SETTINGS } from "@/data/invoices";
import { formatDate } from "@/lib/date";
import { getEffectiveInvoiceSettings } from "@/lib/invoices";
import type { InvoiceSettings, InvoiceSettingsStatus } from "@/types/invoice";

type EditorMode = "create" | "edit" | null;

export function InvoiceSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [settings, setSettings] = useState<InvoiceSettings[]>(INVOICE_SETTINGS);

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
        item.invoicePrefix,
        `${item.paymentTermDays} days`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      const matchesScope = scopeFilter === "all" || item.scope === scopeFilter;

      return searchableValue.includes(query) && matchesStatus && matchesScope;
    });
  }, [scopedSettings, scopeFilter, searchQuery, statusFilter]);

  const selectedSettings =
    settings.find((item) => item.id === selectedSettingsId) ?? null;

  const effectiveSettings = getEffectiveInvoiceSettings(settings, selectedBranchId);

  const activeSettings = scopedSettings.filter((item) => item.status === "active");

  const branchOverrides = scopedSettings.filter((item) => item.scope === "branch");

  const automatedProfiles = scopedSettings.filter(
    (item) =>
      item.status === "active" && (item.autoSendInvoices || item.sendDueReminders),
  );

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
      detail: "Custom branch billing rules",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Payment terms",
      value: `${effectiveSettings?.paymentTermDays ?? 0} days`,
      detail: "Effective billing deadline",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
    {
      label: "Automated profiles",
      value: String(automatedProfiles.length),
      detail: "Auto-send or reminder enabled",
      icon: Send,
      tone: "info" as const,
    },
  ];

  const columns = useMemo(
    () =>
      createInvoiceSettingsColumns({
        onOpen: (item) => setSelectedSettingsId(item.id),
      }),
    [],
  );

  function saveSettings(nextSettings: InvoiceSettings) {
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

  function updateStatus(settingsId: string, status: InvoiceSettingsStatus) {
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

  function duplicateSettings(item: InvoiceSettings) {
    const duplicate: InvoiceSettings = {
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

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={INVOICE_COPY.common.eyebrow}
        title={INVOICE_COPY.settings.title}
        description={INVOICE_COPY.settings.description}
        actions={
          <Button
            onClick={() => {
              setSelectedSettingsId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {INVOICE_COPY.settings.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <InvoiceTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{INVOICE_COPY.settings.registerTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {INVOICE_COPY.settings.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={INVOICE_COPY.settings.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{INVOICE_COPY.settings.allScopes}</option>

                {Object.entries(INVOICE_SETTINGS_SCOPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{INVOICE_COPY.settings.allStatuses}</option>

                {Object.entries(INVOICE_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
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

                <h3 className="mt-4 font-bold">{INVOICE_COPY.settings.emptyTitle}</h3>

                <p className="mt-2 text-sm text-text-muted">
                  {INVOICE_COPY.settings.emptyDescription}
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
                {INVOICE_COPY.settings.effectiveTitle}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {INVOICE_COPY.settings.effectiveDescription}
              </p>
            </div>
          </div>

          {effectiveSettings ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-control border border-border p-4">
                <p className="text-sm font-bold">{effectiveSettings.name}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {effectiveSettings.scope === "branch"
                    ? "Active branch override"
                    : "Organization default"}
                </p>
              </div>

              <div className="rounded-control bg-canvas p-4">
                <p className="text-xs text-text-muted">Invoice number preview</p>

                <p className="mt-1 text-lg font-bold">
                  {effectiveSettings.invoicePrefix}-
                  {String(effectiveSettings.nextSequence).padStart(5, "0")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Payment terms</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.paymentTermDays} days
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Tax rate</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.defaultTaxRate}%
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Partial payments</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.allowPartialPayments ? "Allowed" : "Disabled"}
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Reminders</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.sendDueReminders ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
              No active invoice settings are available for this scope.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedSettings)}
        onClose={() => setSelectedSettingsId(null)}
        title="Invoice settings"
        description={selectedSettings?.name}
        footer={
          selectedSettings ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => duplicateSettings(selectedSettings)}
              >
                <Copy />
                {INVOICE_COPY.actions.duplicate}
              </Button>

              {selectedSettings.status === "active" ? (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedSettings.id, "archived")}
                >
                  <Archive />
                  {INVOICE_COPY.actions.archive}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedSettings.id, "active")}
                >
                  <CheckCircle2 />
                  {INVOICE_COPY.actions.activate}
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                {INVOICE_COPY.actions.edit}
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
                    INVOICE_SETTINGS_STATUS_CONFIG[selectedSettings.status].badgeVariant
                  }
                >
                  {INVOICE_SETTINGS_STATUS_CONFIG[selectedSettings.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Scope",
                    value: INVOICE_SETTINGS_SCOPE_CONFIG[selectedSettings.scope].label,
                  },
                  {
                    label: "Branch",
                    value: selectedSettings.branchName ?? "All organization branches",
                  },
                  {
                    label: "Invoice prefix",
                    value: selectedSettings.invoicePrefix,
                  },
                  {
                    label: "Next sequence",
                    value: selectedSettings.nextSequence,
                  },
                  {
                    label: "Payment terms",
                    value: `${selectedSettings.paymentTermDays} days`,
                  },
                  {
                    label: "Default tax",
                    value: `${selectedSettings.defaultTaxRate}%`,
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Billing controls</h3>

              <ToggleDetailList
                items={[
                  {
                    label: "Partial payments",
                    enabled: selectedSettings.allowPartialPayments,
                  },
                  {
                    label: "Automatic delivery",
                    enabled: selectedSettings.autoSendInvoices,
                  },
                  {
                    label: "Automatic overdue status",
                    enabled: selectedSettings.autoMarkOverdue,
                  },
                  {
                    label: "Payment reminders",
                    enabled: selectedSettings.sendDueReminders,
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Default invoice note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedSettings.defaultNote ||
                  "No default invoice note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add invoice settings" : "Edit invoice settings"}
        description="Configure numbering, payment terms, tax and collection automation."
      >
        {editorMode && (
          <InvoiceSettingsForm
            key={editorMode === "create" ? "new-invoice-settings" : selectedSettings?.id}
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
