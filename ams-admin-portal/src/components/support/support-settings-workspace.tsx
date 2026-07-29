"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
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
import { FormField } from "@/components/forms/form-field";
import { SupportTabs } from "@/components/support/support-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_ACTION_LABELS,
  SUPPORT_COPY,
  SUPPORT_PRIORITY_CONFIG,
  SUPPORT_SCOPE_CONFIG,
  SUPPORT_SETTINGS_CONTROLS,
  SUPPORT_SETTINGS_STATUS_CONFIG,
} from "@/config/support";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { SUPPORT_SETTINGS } from "@/data/support";
import { formatDate } from "@/lib/date";
import type {
  SupportScope,
  SupportSettings,
  SupportSettingsStatus,
  SupportTicketPriority,
} from "@/types/support";

function SettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  settings?: SupportSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (settings: SupportSettings) => void;
}) {
  const [name, setName] = useState(settings?.name ?? "");
  const [scope, setScope] = useState<SupportScope>(settings?.scope ?? "organization");
  const [branchId, setBranchId] = useState(
    settings?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SupportSettingsStatus>(
    settings?.status ?? "draft",
  );
  const [defaultPriority, setDefaultPriority] = useState<SupportTicketPriority>(
    settings?.defaultPriority ?? "medium",
  );
  const [defaultAssignee, setDefaultAssignee] = useState(settings?.defaultAssignee ?? "");
  const [firstResponseHours, setFirstResponseHours] = useState(
    String(settings?.firstResponseHours ?? 4),
  );
  const [resolutionHours, setResolutionHours] = useState(
    String(settings?.resolutionHours ?? 24),
  );
  const [escalationEnabled, setEscalationEnabled] = useState(
    settings?.escalationEnabled ?? true,
  );
  const [escalationAfterHours, setEscalationAfterHours] = useState(
    String(settings?.escalationAfterHours ?? 8),
  );
  const [employeePortalEnabled, setEmployeePortalEnabled] = useState(
    settings?.employeePortalEnabled ?? true,
  );
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(
    settings?.knowledgeBaseEnabled ?? true,
  );
  const [satisfactionSurveyEnabled, setSatisfactionSurveyEnabled] = useState(
    settings?.satisfactionSurveyEnabled ?? true,
  );
  const [allowTicketReopen, setAllowTicketReopen] = useState(
    settings?.allowTicketReopen ?? true,
  );
  const [autoCloseResolvedDays, setAutoCloseResolvedDays] = useState(
    String(settings?.autoCloseResolvedDays ?? 3),
  );
  const [attachmentsEnabled, setAttachmentsEnabled] = useState(
    settings?.attachmentsEnabled ?? true,
  );
  const [maximumAttachmentMb, setMaximumAttachmentMb] = useState(
    String(settings?.maximumAttachmentMb ?? 10),
  );
  const [note, setNote] = useState(settings?.note ?? "");
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !name.trim() ||
      (scope === "branch" && !branchId) ||
      Number(firstResponseHours) <= 0 ||
      Number(resolutionHours) <= 0 ||
      Number(autoCloseResolvedDays) <= 0 ||
      Number(maximumAttachmentMb) <= 0 ||
      (escalationEnabled && Number(escalationAfterHours) <= 0)
    ) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    onSave({
      id: settings?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      defaultPriority,
      defaultAssignee: defaultAssignee.trim() || undefined,
      firstResponseHours: Number(firstResponseHours),
      resolutionHours: Number(resolutionHours),
      escalationEnabled,
      escalationAfterHours: escalationEnabled ? Number(escalationAfterHours) : 0,
      employeePortalEnabled,
      knowledgeBaseEnabled,
      satisfactionSurveyEnabled,
      allowTicketReopen,
      autoCloseResolvedDays: Number(autoCloseResolvedDays),
      attachmentsEnabled,
      maximumAttachmentMb: Number(maximumAttachmentMb),
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const controls = [
    {
      label: "Employee support portal",
      description: "Allow employees to create and track support tickets.",
      checked: employeePortalEnabled,
      setChecked: setEmployeePortalEnabled,
    },
    {
      label: "Knowledge base",
      description: "Show published guidance in the employee support experience.",
      checked: knowledgeBaseEnabled,
      setChecked: setKnowledgeBaseEnabled,
    },
    {
      label: "Satisfaction surveys",
      description: "Request a rating after a ticket is resolved.",
      checked: satisfactionSurveyEnabled,
      setChecked: setSatisfactionSurveyEnabled,
    },
    {
      label: "Allow ticket reopening",
      description: "Permit resolved tickets to be reopened.",
      checked: allowTicketReopen,
      setChecked: setAllowTicketReopen,
    },
    {
      label: "Ticket attachments",
      description: "Allow supporting files on employee requests.",
      checked: attachmentsEnabled,
      setChecked: setAttachmentsEnabled,
    },
    {
      label: "SLA escalation",
      description: "Escalate unresolved tickets before targets are missed.",
      checked: escalationEnabled,
      setChecked: setEscalationEnabled,
    },
  ];

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Settings name"
          htmlFor="supportSettingsName"
          error={submitted && !name.trim() ? "Enter a settings name" : undefined}
        >
          <Input
            id="supportSettingsName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Organization Support Policy"
          />
        </FormField>

        <FormField label="Status" htmlFor="supportSettingsStatus">
          <Select
            id="supportSettingsStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as SupportSettingsStatus)}
          >
            {Object.entries(SUPPORT_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="supportSettingsScope">
          <Select
            id="supportSettingsScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as SupportScope)}
          >
            {Object.entries(SUPPORT_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="supportSettingsBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="supportSettingsBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Default priority" htmlFor="supportSettingsPriority">
          <Select
            id="supportSettingsPriority"
            value={defaultPriority}
            onChange={(event) =>
              setDefaultPriority(event.target.value as SupportTicketPriority)
            }
          >
            {Object.entries(SUPPORT_PRIORITY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Default assignee" htmlFor="supportSettingsAssignee" optional>
          <Input
            id="supportSettingsAssignee"
            value={defaultAssignee}
            onChange={(event) => setDefaultAssignee(event.target.value)}
            placeholder="Example: People Operations"
          />
        </FormField>

        <FormField
          label="First response target"
          htmlFor="supportSettingsResponse"
          description="Target time in hours."
        >
          <Input
            id="supportSettingsResponse"
            type="number"
            min="1"
            value={firstResponseHours}
            onChange={(event) => setFirstResponseHours(event.target.value)}
          />
        </FormField>

        <FormField
          label="Resolution target"
          htmlFor="supportSettingsResolution"
          description="Target time in hours."
        >
          <Input
            id="supportSettingsResolution"
            type="number"
            min="1"
            value={resolutionHours}
            onChange={(event) => setResolutionHours(event.target.value)}
          />
        </FormField>

        {escalationEnabled && (
          <FormField
            label="Escalate after"
            htmlFor="supportSettingsEscalation"
            description="Hours before escalation."
          >
            <Input
              id="supportSettingsEscalation"
              type="number"
              min="1"
              value={escalationAfterHours}
              onChange={(event) => setEscalationAfterHours(event.target.value)}
            />
          </FormField>
        )}

        <FormField
          label="Auto-close resolved tickets"
          htmlFor="supportSettingsAutoClose"
          description="Days after resolution."
        >
          <Input
            id="supportSettingsAutoClose"
            type="number"
            min="1"
            value={autoCloseResolvedDays}
            onChange={(event) => setAutoCloseResolvedDays(event.target.value)}
          />
        </FormField>

        {attachmentsEnabled && (
          <FormField
            label="Maximum attachment size"
            htmlFor="supportSettingsAttachment"
            description="Maximum file size in MB."
          >
            <Input
              id="supportSettingsAttachment"
              type="number"
              min="1"
              value={maximumAttachmentMb}
              onChange={(event) => setMaximumAttachmentMb(event.target.value)}
            />
          </FormField>
        )}
      </div>

      <div className="space-y-3">
        {controls.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
          >
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-text-muted">{item.description}</p>
            </div>
            <Switch
              checked={item.checked}
              onCheckedChange={item.setChecked}
              ariaLabel={item.label}
            />
          </div>
        ))}
      </div>

      <FormField label="Internal note" htmlFor="supportSettingsNote" optional>
        <Textarea
          id="supportSettingsNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add service-level or branch workflow context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SUPPORT_ACTION_LABELS.cancel}
        </Button>
        <Button type="submit">{settings ? "Save settings" : "Create settings"}</Button>
      </div>
    </form>
  );
}

export function SupportSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [settings, setSettings] = useState<SupportSettings[]>(SUPPORT_SETTINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const settingsSelection = useEntitySelection(settings, (item) => item.id);
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
      const searchable = [item.name, item.branchName, item.defaultAssignee]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (scopeFilter === "all" || item.scope === scopeFilter)
      );
    });
  }, [scopedSettings, scopeFilter, searchQuery, statusFilter]);

  const selectedSettings = settingsSelection.selected;

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
  const portalEnabled = scopedSettings.filter((item) => item.employeePortalEnabled);
  const averageResolution = activeSettings.length
    ? Math.round(
        activeSettings.reduce((total, item) => total + item.resolutionHours, 0) /
          activeSettings.length,
      )
    : 0;

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
      detail: "Custom branch workflows",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Portal enabled",
      value: String(portalEnabled.length),
      detail: "Settings with employee access",
      icon: Globe2,
      tone: "info" as const,
    },
    {
      label: "Average resolution",
      value: `${averageResolution}h`,
      detail: "Across active settings",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<SupportSettings>[]>(
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
          <Badge variant={SUPPORT_SCOPE_CONFIG[item.scope].badgeVariant}>
            {SUPPORT_SCOPE_CONFIG[item.scope].label}
          </Badge>
        ),
      },
      {
        id: "priority",
        header: "Default priority",
        cell: (item) => (
          <Badge variant={SUPPORT_PRIORITY_CONFIG[item.defaultPriority].badgeVariant}>
            {SUPPORT_PRIORITY_CONFIG[item.defaultPriority].label}
          </Badge>
        ),
      },
      {
        id: "assignee",
        header: "Default assignee",
        cell: (item) => item.defaultAssignee ?? "Unassigned",
      },
      {
        id: "response",
        header: "First response",
        cell: (item) => `${item.firstResponseHours} hours`,
      },
      {
        id: "resolution",
        header: "Resolution",
        cell: (item) => `${item.resolutionHours} hours`,
      },
      {
        id: "status",
        header: "Status",
        cell: (item) => (
          <Badge variant={SUPPORT_SETTINGS_STATUS_CONFIG[item.status].badgeVariant}>
            {SUPPORT_SETTINGS_STATUS_CONFIG[item.status].label}
          </Badge>
        ),
      },
    ],
    [],
  );

  function saveSettings(nextSettings: SupportSettings) {
    setSettings((current) => {
      const exists = current.some((item) => item.id === nextSettings.id);
      return exists
        ? current.map((item) => (item.id === nextSettings.id ? nextSettings : item))
        : [nextSettings, ...current];
    });
    setEditorMode(null);
    settingsSelection.select(nextSettings.id);
  }

  function updateStatus(status: SupportSettings["status"]) {
    if (!selectedSettings) return;
    setSettings((current) =>
      current.map((item) =>
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

  function duplicateSettings() {
    if (!selectedSettings) return;
    const duplicate: SupportSettings = {
      ...selectedSettings,
      id: crypto.randomUUID(),
      name: `${selectedSettings.name} Copy`,
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };
    setSettings((current) => [duplicate, ...current]);
    settingsSelection.select(duplicate.id);
  }

  const effectiveControls = effectiveSettings
    ? SUPPORT_SETTINGS_CONTROLS.map((control) => ({
        label: control.label,
        enabled: Boolean(effectiveSettings[control.key]),
      }))
    : [];

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.settings.eyebrow}
        title={SUPPORT_COPY.settings.title}
        description={SUPPORT_COPY.settings.description}
        actions={
          <Button
            onClick={() => {
              settingsSelection.clear();
              setEditorMode("create");
            }}
          >
            <Plus />
            {SUPPORT_COPY.settings.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <SupportTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{SUPPORT_COPY.settings.registerTitle}</h2>
            <p className="mt-1 text-sm text-text-muted">
              {SUPPORT_COPY.settings.registerDescription}
            </p>
            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={SUPPORT_COPY.settings.searchPlaceholder}
                  className="pl-9"
                />
              </div>
              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{SUPPORT_COPY.settings.allScopes}</option>
                {Object.entries(SUPPORT_SCOPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{SUPPORT_COPY.settings.allStatuses}</option>
                {Object.entries(SUPPORT_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
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
            onRowClick={(item) => settingsSelection.select(item.id)}
            emptyState={
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <Settings2 className="size-8 text-text-muted" />
                <h3 className="mt-4 font-bold">{SUPPORT_COPY.settings.emptyTitle}</h3>
                <p className="mt-2 text-sm text-text-muted">
                  {SUPPORT_COPY.settings.emptyDescription}
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
                {SUPPORT_COPY.settings.effectiveTitle}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {SUPPORT_COPY.settings.effectiveDescription}
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
                  <p className="text-xs text-text-muted">First response</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.firstResponseHours} hours
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Resolution</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.resolutionHours} hours
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Auto-close</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.autoCloseResolvedDays} days
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Attachment limit</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.maximumAttachmentMb} MB
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
              No active organization support settings are available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedSettings)}
        onClose={() => settingsSelection.clear()}
        title="Support settings"
        description={selectedSettings?.name}
        footer={
          selectedSettings ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateSettings}>
                <Copy />
                {SUPPORT_ACTION_LABELS.duplicate}
              </Button>
              {selectedSettings.status === "active" && (
                <Button variant="outline" onClick={() => updateStatus("archived")}>
                  <Archive />
                  {SUPPORT_ACTION_LABELS.archive}
                </Button>
              )}
              {selectedSettings.status !== "active" && (
                <Button variant="outline" onClick={() => updateStatus("active")}>
                  <CheckCircle2 />
                  {SUPPORT_ACTION_LABELS.activate}
                </Button>
              )}
              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                {SUPPORT_ACTION_LABELS.edit}
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
                    SUPPORT_SETTINGS_STATUS_CONFIG[selectedSettings.status].badgeVariant
                  }
                >
                  {SUPPORT_SETTINGS_STATUS_CONFIG[selectedSettings.status].label}
                </Badge>
              </div>
              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Scope",
                    value: SUPPORT_SCOPE_CONFIG[selectedSettings.scope].label,
                  },
                  {
                    label: "Branch",
                    value: selectedSettings.branchName ?? "All organization branches",
                  },
                  {
                    label: "Default assignee",
                    value: selectedSettings.defaultAssignee ?? "Unassigned",
                  },
                  {
                    label: "Resolution",
                    value: `${selectedSettings.resolutionHours} hours`,
                  },
                ]}
              />
            </section>
            <section>
              <h3 className="text-sm font-bold">Support controls</h3>
              <ToggleDetailList
                items={SUPPORT_SETTINGS_CONTROLS.map((control) => ({
                  label: control.label,
                  enabled: Boolean(selectedSettings[control.key]),
                }))}
              />
            </section>
            <section>
              <h3 className="text-sm font-bold">Internal note</h3>
              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedSettings.note || "No support settings note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add support settings" : "Edit support settings"}
        description="Configure service levels, employee access and branch support workflows."
      >
        {editorMode && (
          <SettingsForm
            key={editorMode === "create" ? "new-support-settings" : selectedSettings?.id}
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
