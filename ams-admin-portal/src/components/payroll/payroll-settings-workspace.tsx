"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Building2,
  CalendarClock,
  CheckCircle2,
  Copy,
  FilePenLine,
  Globe2,
  LockKeyhole,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PayrollSettingsForm } from "@/components/payroll/payroll-settings-form";
import { PayrollTabs } from "@/components/payroll/payroll-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PAYROLL_PAYMENT_METHOD_CONFIG } from "@/config/payroll";
import {
  PAYROLL_BANK_FILE_FORMAT_CONFIG,
  PAYROLL_PAY_DATE_RULE_CONFIG,
  PAYROLL_ROUNDING_MODE_CONFIG,
  PAYROLL_SCHEDULE_CONFIG,
  PAYROLL_SETTINGS_COPY,
  PAYROLL_SETTINGS_SCOPE_CONFIG,
  PAYROLL_SETTINGS_STATUS_CONFIG,
} from "@/config/payroll-settings";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { PAYROLL_SETTINGS } from "@/data/payroll-settings";
import { formatDate } from "@/lib/date";
import type { PayrollSettingsRecord } from "@/types/payroll-settings";

type EditorMode = "create" | "edit" | null;

function getPayDateLabel(configuration: PayrollSettingsRecord) {
  if (configuration.payDateRule === "fixed_day") {
    return `Day ${configuration.payDay}`;
  }

  return PAYROLL_PAY_DATE_RULE_CONFIG[configuration.payDateRule].label;
}

export function PayrollSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [configurations, setConfigurations] =
    useState<PayrollSettingsRecord[]>(PAYROLL_SETTINGS);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [scopeFilter, setScopeFilter] = useState("all");

  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(
    null,
  );

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedConfigurations = useMemo(
    () =>
      configurations.filter(
        (configuration) =>
          selectedBranch.isAggregate ||
          configuration.scope === "organization" ||
          configuration.branchId === selectedBranch.id,
      ),
    [configurations, selectedBranch],
  );

  const visibleConfigurations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedConfigurations.filter((configuration) => {
      const searchableValue = [
        configuration.name,
        configuration.branchName,
        PAYROLL_SCHEDULE_CONFIG[configuration.schedule].label,
        PAYROLL_PAY_DATE_RULE_CONFIG[configuration.payDateRule].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesStatus =
        statusFilter === "all" || configuration.status === statusFilter;

      const matchesScope = scopeFilter === "all" || configuration.scope === scopeFilter;

      return searchableValue.includes(query) && matchesStatus && matchesScope;
    });
  }, [scopedConfigurations, scopeFilter, searchQuery, statusFilter]);

  const selectedConfiguration =
    configurations.find(
      (configuration) => configuration.id === selectedConfigurationId,
    ) ?? null;

  const organizationDefault =
    configurations.find(
      (configuration) =>
        configuration.scope === "organization" && configuration.status === "active",
    ) ?? null;

  const branchOverride = selectedBranch.isAggregate
    ? null
    : (configurations.find(
        (configuration) =>
          configuration.scope === "branch" &&
          configuration.branchId === selectedBranch.id &&
          configuration.status === "active",
      ) ?? null);

  const effectiveConfiguration = branchOverride ?? organizationDefault;

  const activeConfigurations = scopedConfigurations.filter(
    (configuration) => configuration.status === "active",
  );

  const automationCount = effectiveConfiguration
    ? [
        effectiveConfiguration.includeAttendanceOvertime,
        effectiveConfiguration.deductUnpaidLeave,
        effectiveConfiguration.autoGeneratePayslips,
        effectiveConfiguration.emailPayslips,
        effectiveConfiguration.autoLockApprovedRuns,
      ].filter(Boolean).length
    : 0;

  const metrics = [
    {
      label: "Active configurations",
      value: activeConfigurations.length,
      detail: selectedBranch.name,
      icon: Settings2,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: scopedConfigurations.filter(
        (configuration) => configuration.scope === "branch",
      ).length,
      detail: "Custom branch rules",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Approval stages",
      value: effectiveConfiguration
        ? [
            effectiveConfiguration.requireFinanceApproval,
            effectiveConfiguration.requireAdminApproval,
          ].filter(Boolean).length
        : 0,
      detail: "Effective payroll workflow",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
    {
      label: "Automation enabled",
      value: `${automationCount}/5`,
      detail: "Effective processing controls",
      icon: Sparkles,
      tone: "info" as const,
    },
  ];

  function saveConfiguration(nextConfiguration: PayrollSettingsRecord) {
    setConfigurations((currentConfigurations) => {
      const exists = currentConfigurations.some(
        (configuration) => configuration.id === nextConfiguration.id,
      );

      return exists
        ? currentConfigurations.map((configuration) =>
            configuration.id === nextConfiguration.id ? nextConfiguration : configuration,
          )
        : [nextConfiguration, ...currentConfigurations];
    });

    setSelectedConfigurationId(nextConfiguration.id);

    setEditorMode(null);
  }

  function duplicateConfiguration(configuration: PayrollSettingsRecord) {
    const duplicate: PayrollSettingsRecord = {
      ...configuration,
      id: crypto.randomUUID(),
      name: `${configuration.name} Copy`,
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };

    setConfigurations((currentConfigurations) => [duplicate, ...currentConfigurations]);

    setSelectedConfigurationId(duplicate.id);
  }

  function archiveConfiguration(configurationId: string) {
    setConfigurations((currentConfigurations) =>
      currentConfigurations.map((configuration) =>
        configuration.id === configurationId
          ? {
              ...configuration,
              status: "archived",
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : configuration,
      ),
    );
  }

  function activateConfiguration(configurationId: string) {
    setConfigurations((currentConfigurations) =>
      currentConfigurations.map((configuration) =>
        configuration.id === configurationId
          ? {
              ...configuration,
              status: "active",
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : configuration,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PAYROLL_SETTINGS_COPY.eyebrow}
        title={PAYROLL_SETTINGS_COPY.title}
        description={PAYROLL_SETTINGS_COPY.description}
        actions={
          <Button
            onClick={() => {
              setSelectedConfigurationId(null);

              setEditorMode("create");
            }}
          >
            <Plus />
            {PAYROLL_SETTINGS_COPY.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <PayrollTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{PAYROLL_SETTINGS_COPY.settingsTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {PAYROLL_SETTINGS_COPY.settingsDescription}
            </p>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={PAYROLL_SETTINGS_COPY.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{PAYROLL_SETTINGS_COPY.allScopes}</option>

                {Object.entries(PAYROLL_SETTINGS_SCOPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{PAYROLL_SETTINGS_COPY.allStatuses}</option>

                {Object.entries(PAYROLL_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {visibleConfigurations.length > 0 ? (
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {visibleConfigurations.map((configuration) => {
                const statusConfig = PAYROLL_SETTINGS_STATUS_CONFIG[configuration.status];

                const scopeConfig = PAYROLL_SETTINGS_SCOPE_CONFIG[configuration.scope];

                return (
                  <button
                    key={configuration.id}
                    type="button"
                    onClick={() => setSelectedConfigurationId(configuration.id)}
                    className="text-left"
                  >
                    <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex size-11 items-center justify-center rounded-control bg-info-muted text-info">
                          {configuration.scope === "organization" ? (
                            <Globe2 size={20} />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </span>

                        <Badge variant={statusConfig.badgeVariant}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <h3 className="mt-5 text-base font-bold">{configuration.name}</h3>

                      <p className="mt-2 text-sm text-text-muted">
                        {configuration.scope === "organization"
                          ? "Applies as the organization-wide payroll default."
                          : configuration.branchName}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-control bg-canvas p-3">
                          <p className="text-xs text-text-muted">Schedule</p>

                          <p className="mt-1 text-sm font-bold">
                            {PAYROLL_SCHEDULE_CONFIG[configuration.schedule].label}
                          </p>
                        </div>

                        <div className="rounded-control bg-canvas p-3">
                          <p className="text-xs text-text-muted">Cutoff</p>

                          <p className="mt-1 text-sm font-bold">
                            Day {configuration.cutoffDay}
                          </p>
                        </div>

                        <div className="rounded-control bg-canvas p-3">
                          <p className="text-xs text-text-muted">Pay date</p>

                          <p className="mt-1 text-sm font-bold">
                            {getPayDateLabel(configuration)}
                          </p>
                        </div>

                        <div className="rounded-control bg-canvas p-3">
                          <p className="text-xs text-text-muted">Approvals</p>

                          <p className="mt-1 text-sm font-bold">
                            {
                              [
                                configuration.requireFinanceApproval,
                                configuration.requireAdminApproval,
                              ].filter(Boolean).length
                            }{" "}
                            stages
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-border pt-4">
                        <Badge variant={scopeConfig.badgeVariant}>
                          {scopeConfig.label}
                        </Badge>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <Settings2 className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">{PAYROLL_SETTINGS_COPY.emptyTitle}</h3>

              <p className="mt-2 text-sm text-text-muted">
                {PAYROLL_SETTINGS_COPY.emptyDescription}
              </p>
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
              <CheckCircle2 size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {PAYROLL_SETTINGS_COPY.effectiveTitle}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {PAYROLL_SETTINGS_COPY.effectiveDescription}
              </p>
            </div>
          </div>

          {effectiveConfiguration ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-control border border-border p-4">
                <p className="text-sm font-bold">{effectiveConfiguration.name}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {branchOverride ? "Active branch override" : "Organization default"}
                </p>
              </div>

              {[
                {
                  label: "Payroll schedule",
                  value: PAYROLL_SCHEDULE_CONFIG[effectiveConfiguration.schedule].label,
                  icon: CalendarClock,
                },
                {
                  label: "Payment method",
                  value:
                    PAYROLL_PAYMENT_METHOD_CONFIG[
                      effectiveConfiguration.defaultPaymentMethod
                    ].label,
                  icon: Users,
                },
                {
                  label: "Approval workflow",
                  value: `${
                    [
                      effectiveConfiguration.requireFinanceApproval,
                      effectiveConfiguration.requireAdminApproval,
                    ].filter(Boolean).length
                  } approval stages`,
                  icon: ShieldCheck,
                },
                {
                  label: "Approved-run lock",
                  value: effectiveConfiguration.autoLockApprovedRuns
                    ? "Enabled"
                    : "Disabled",
                  icon: LockKeyhole,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-control bg-canvas p-4"
                  >
                    <Icon className="size-4 text-primary" />

                    <div>
                      <p className="text-xs text-text-muted">{item.label}</p>

                      <p className="mt-1 text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
              No active organization payroll configuration is available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedConfiguration)}
        onClose={() => setSelectedConfigurationId(null)}
        title="Payroll configuration"
        description={selectedConfiguration?.name}
        footer={
          selectedConfiguration ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => duplicateConfiguration(selectedConfiguration)}
              >
                <Copy />
                Duplicate
              </Button>

              {selectedConfiguration.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => archiveConfiguration(selectedConfiguration.id)}
                >
                  <Archive />
                  Archive
                </Button>
              )}

              {selectedConfiguration.status !== "active" && (
                <Button
                  variant="outline"
                  onClick={() => activateConfiguration(selectedConfiguration.id)}
                >
                  <CheckCircle2 />
                  Activate
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit configuration
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedConfiguration && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedConfiguration.name}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Updated by {selectedConfiguration.updatedBy} on{" "}
                    {formatDate(selectedConfiguration.updatedAt)}
                  </p>
                </div>

                <Badge
                  variant={
                    PAYROLL_SETTINGS_STATUS_CONFIG[selectedConfiguration.status]
                      .badgeVariant
                  }
                >
                  {PAYROLL_SETTINGS_STATUS_CONFIG[selectedConfiguration.status].label}
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Configuration scope</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {PAYROLL_SETTINGS_SCOPE_CONFIG[selectedConfiguration.scope].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Branch</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedConfiguration.branchName || "All organization branches"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Payroll schedule</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {PAYROLL_SCHEDULE_CONFIG[selectedConfiguration.schedule].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Payroll cutoff</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    Day {selectedConfiguration.cutoffDay}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Pay-date rule</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {getPayDateLabel(selectedConfiguration)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Payment method</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {
                      PAYROLL_PAYMENT_METHOD_CONFIG[
                        selectedConfiguration.defaultPaymentMethod
                      ].label
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Working days</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedConfiguration.standardWorkingDays} days
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">Daily hours</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedConfiguration.standardDailyHours} hours
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Approval workflow</h3>

              <div className="mt-3 space-y-3">
                {[
                  {
                    label: "Finance approval",
                    enabled: selectedConfiguration.requireFinanceApproval,
                  },
                  {
                    label: "Administrator approval",
                    enabled: selectedConfiguration.requireAdminApproval,
                  },
                  {
                    label: "Lock approved runs",
                    enabled: selectedConfiguration.autoLockApprovedRuns,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-control border border-border p-4"
                  >
                    <span className="text-sm font-semibold">{item.label}</span>

                    <Badge variant={item.enabled ? "success" : "neutral"}>
                      {item.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Payroll automation</h3>

              <div className="mt-3 space-y-3">
                {[
                  {
                    label: "Attendance overtime",
                    enabled: selectedConfiguration.includeAttendanceOvertime,
                  },
                  {
                    label: "Unpaid leave deductions",
                    enabled: selectedConfiguration.deductUnpaidLeave,
                  },
                  {
                    label: "Automatic payslips",
                    enabled: selectedConfiguration.autoGeneratePayslips,
                  },
                  {
                    label: "Email payslips",
                    enabled: selectedConfiguration.emailPayslips,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-control bg-canvas p-4"
                  >
                    <span className="text-sm font-medium">{item.label}</span>

                    <Badge variant={item.enabled ? "success" : "neutral"}>
                      {item.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Output settings</h3>

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-control bg-canvas p-4">
                  <dt className="text-xs text-text-muted">Rounding</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {
                      PAYROLL_ROUNDING_MODE_CONFIG[selectedConfiguration.roundingMode]
                        .label
                    }
                  </dd>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <dt className="text-xs text-text-muted">Bank export</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {
                      PAYROLL_BANK_FILE_FORMAT_CONFIG[
                        selectedConfiguration.bankFileFormat
                      ].label
                    }
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedConfiguration.note ||
                  "No payroll configuration note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create"
            ? "Add payroll configuration"
            : "Edit payroll configuration"
        }
        description="Configure payroll schedules, processing rules, approvals and branch-level overrides."
      >
        {editorMode && (
          <PayrollSettingsForm
            key={
              editorMode === "create" ? "new-payroll-settings" : selectedConfiguration?.id
            }
            configuration={
              editorMode === "edit" ? (selectedConfiguration ?? undefined) : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveConfiguration}
          />
        )}
      </Drawer>
    </div>
  );
}
