"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FilePenLine,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Unplug,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import {
  INTEGRATION_STATUS_CONFIG,
  INTEGRATION_TYPE_CONFIG,
  SETTINGS_COPY,
  SETTINGS_FIELD_CONFIG,
  SETTINGS_SCOPE_CONFIG,
  SETTINGS_SECTION_COPY,
  SETTINGS_SECTIONS,
  SETTINGS_STATUS_CONFIG,
} from "@/config/settings";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import {
  SETTINGS_AUDIT_LOG,
  SETTINGS_INTEGRATIONS,
  SETTINGS_PROFILES,
} from "@/data/settings";
import {
  createDefaultValues,
  formatSettingsDateTime,
  formatSettingsValue,
  getProfileSummary,
  resolveEffectiveProfile,
  settingsRecordIsInScope,
} from "@/lib/settings";
import type {
  IntegrationRecord,
  IntegrationStatus,
  IntegrationType,
  SettingsAuditEntry,
  SettingsCategory,
  SettingsProfile,
  SettingsScope,
  SettingsSection,
  SettingsStatus,
  SettingsValue,
} from "@/types/settings";

type EditorMode = "profile" | "integration" | null;

export function SettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [section, setSection] = useState<SettingsSection>("overview");
  const [profiles, setProfiles] = useState(SETTINGS_PROFILES);
  const [integrations, setIntegrations] = useState(SETTINGS_INTEGRATIONS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const profileSelection = useEntitySelection(profiles, (profile) => profile.id);
  const integrationSelection = useEntitySelection(
    integrations,
    (integration) => integration.id,
  );
  const auditSelection = useEntitySelection(SETTINGS_AUDIT_LOG, (entry) => entry.id);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [createCategory, setCreateCategory] = useState<SettingsCategory>("organization");

  const sectionCopy = SETTINGS_SECTION_COPY[section];

  const currentCategory =
    section === "organization" || section === "security" || section === "notifications"
      ? section
      : null;

  const scopedProfiles = useMemo(
    () =>
      profiles.filter((profile) => settingsRecordIsInScope(profile, selectedBranchId)),
    [profiles, selectedBranchId],
  );

  const scopedIntegrations = useMemo(
    () =>
      integrations.filter((integration) =>
        settingsRecordIsInScope(integration, selectedBranchId),
      ),
    [integrations, selectedBranchId],
  );

  const scopedAudit = useMemo(
    () =>
      SETTINGS_AUDIT_LOG.filter((entry) =>
        settingsRecordIsInScope(entry, selectedBranchId),
      ),
    [selectedBranchId],
  );

  const filteredProfiles = useMemo(() => {
    const search = query.trim().toLowerCase();

    return scopedProfiles.filter(
      (profile) =>
        (!currentCategory || profile.category === currentCategory) &&
        [profile.name, profile.branchName, profile.updatedBy, profile.note]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search) &&
        (statusFilter === "all" || profile.status === statusFilter),
    );
  }, [currentCategory, query, scopedProfiles, statusFilter]);

  const filteredIntegrations = useMemo(() => {
    const search = query.trim().toLowerCase();

    return scopedIntegrations.filter(
      (integration) =>
        [
          integration.name,
          integration.provider,
          integration.branchName,
          integration.endpointLabel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search) &&
        (statusFilter === "all" || integration.status === statusFilter),
    );
  }, [query, scopedIntegrations, statusFilter]);

  const filteredAudit = useMemo(() => {
    const search = query.trim().toLowerCase();

    return scopedAudit.filter((entry) =>
      [entry.entityName, entry.actorName, entry.branchName, entry.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [query, scopedAudit]);

  const selectedProfile = profileSelection.selected;
  const selectedIntegration = integrationSelection.selected;
  const selectedAudit = auditSelection.selected;

  const effectiveOrganization = resolveEffectiveProfile(
    profiles,
    "organization",
    selectedBranchId,
  );
  const effectiveSecurity = resolveEffectiveProfile(
    profiles,
    "security",
    selectedBranchId,
  );
  const effectiveNotifications = resolveEffectiveProfile(
    profiles,
    "notifications",
    selectedBranchId,
  );

  const metrics = [
    {
      label: "Active profiles",
      value: String(
        scopedProfiles.filter((profile) => profile.status === "active").length,
      ),
      detail: selectedBranch.name,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: String(
        scopedProfiles.filter((profile) => profile.scope === "branch").length,
      ),
      detail: "Custom branch settings",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Connected integrations",
      value: String(
        scopedIntegrations.filter((integration) => integration.status === "connected")
          .length,
      ),
      detail: `${scopedIntegrations.length} configured`,
      icon: Settings2,
      tone: "warning" as const,
    },
    {
      label: "Audit records",
      value: String(scopedAudit.length),
      detail: "Current activity history",
      icon: ClipboardList,
      tone: "info" as const,
    },
  ];

  const profileColumns: DataTableColumn<SettingsProfile>[] = [
    {
      id: "profile",
      header: "Settings profile",
      cell: (profile) => (
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className="mt-1 text-xs text-text-muted">
            {profile.branchName ?? "All organization branches"}
          </p>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (profile) => (
        <Badge variant={SETTINGS_SCOPE_CONFIG[profile.scope].badgeVariant}>
          {SETTINGS_SCOPE_CONFIG[profile.scope].label}
        </Badge>
      ),
    },
    {
      id: "summary",
      header: "Effective value",
      cell: (profile) => {
        const summary = getProfileSummary(profile)[0];

        return summary ? `${summary.label}: ${summary.value}` : "Not configured";
      },
    },
    {
      id: "updatedBy",
      header: "Updated by",
      cell: (profile) => profile.updatedBy,
    },
    {
      id: "status",
      header: "Status",
      cell: (profile) => (
        <Badge variant={SETTINGS_STATUS_CONFIG[profile.status].badgeVariant}>
          {SETTINGS_STATUS_CONFIG[profile.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (profile) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${profile.name}`}
          onClick={(event) => {
            event.stopPropagation();
            profileSelection.select(profile.id);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];

  const integrationColumns: DataTableColumn<IntegrationRecord>[] = [
    {
      id: "integration",
      header: "Integration",
      cell: (integration) => (
        <div>
          <p className="font-semibold">{integration.name}</p>
          <p className="mt-1 text-xs text-text-muted">
            {integration.provider} ·{" "}
            {integration.branchName ?? "All organization branches"}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (integration) => (
        <Badge variant={INTEGRATION_TYPE_CONFIG[integration.type].badgeVariant}>
          {INTEGRATION_TYPE_CONFIG[integration.type].label}
        </Badge>
      ),
    },
    {
      id: "sync",
      header: "Sync",
      cell: (integration) => integration.syncFrequency,
    },
    {
      id: "lastSync",
      header: "Last sync",
      cell: (integration) =>
        integration.lastSyncAt ? formatSettingsDateTime(integration.lastSyncAt) : "Never",
    },
    {
      id: "status",
      header: "Status",
      cell: (integration) => (
        <Badge variant={INTEGRATION_STATUS_CONFIG[integration.status].badgeVariant}>
          {INTEGRATION_STATUS_CONFIG[integration.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (integration) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${integration.name}`}
          onClick={(event) => {
            event.stopPropagation();
            integrationSelection.select(integration.id);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];

  const auditColumns: DataTableColumn<SettingsAuditEntry>[] = [
    {
      id: "activity",
      header: "Activity",
      cell: (entry) => (
        <div>
          <p className="font-semibold">{entry.entityName}</p>
          <p className="mt-1 text-xs text-text-muted capitalize">{entry.category}</p>
        </div>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: (entry) => (
        <Badge
          variant={
            entry.action === "activated" || entry.action === "connected"
              ? "success"
              : entry.action === "archived" || entry.action === "disconnected"
                ? "neutral"
                : "info"
          }
        >
          {entry.action}
        </Badge>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (entry) => entry.branchName ?? "All organization branches",
    },
    {
      id: "actor",
      header: "Actor",
      cell: (entry) => entry.actorName,
    },
    {
      id: "created",
      header: "Created",
      cell: (entry) => formatSettingsDateTime(entry.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (entry) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open audit details for ${entry.entityName}`}
          onClick={(event) => {
            event.stopPropagation();
            auditSelection.select(entry.id);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];

  function openCreateProfile(category: SettingsCategory) {
    setCreateCategory(category);
    profileSelection.clear();
    setEditorMode("profile");
  }

  function saveProfile(profile: SettingsProfile) {
    setProfiles((current) => {
      const exists = current.some((item) => item.id === profile.id);

      return exists
        ? current.map((item) => (item.id === profile.id ? profile : item))
        : [profile, ...current];
    });

    setEditorMode(null);
    profileSelection.select(profile.id);
  }

  function updateProfileStatus(status: SettingsStatus) {
    if (!selectedProfile) {
      return;
    }

    setProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedProfile.id
          ? {
              ...profile,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : profile,
      ),
    );
  }

  function saveIntegration(integration: IntegrationRecord) {
    setIntegrations((current) => {
      const exists = current.some((item) => item.id === integration.id);

      return exists
        ? current.map((item) => (item.id === integration.id ? integration : item))
        : [integration, ...current];
    });

    setEditorMode(null);
    integrationSelection.select(integration.id);
  }

  function updateIntegrationStatus(status: IntegrationStatus) {
    if (!selectedIntegration) {
      return;
    }

    setIntegrations((current) =>
      current.map((integration) =>
        integration.id === selectedIntegration.id
          ? {
              ...integration,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : integration,
      ),
    );
  }

  const headerAction = currentCategory ? (
    <Button onClick={() => openCreateProfile(currentCategory)}>
      <Plus />
      {SETTINGS_COPY.addProfile}
    </Button>
  ) : section === "integrations" ? (
    <Button
      onClick={() => {
        integrationSelection.clear();
        setEditorMode("integration");
      }}
    >
      <Plus />
      {SETTINGS_COPY.addIntegration}
    </Button>
  ) : undefined;

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SETTINGS_COPY.eyebrow}
        title={sectionCopy.title}
        description={sectionCopy.description}
        actions={headerAction}
      />

      <div className="mt-7 overflow-x-auto border-b border-border">
        <div className="flex min-w-max gap-1">
          {SETTINGS_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSection(item.id);
                setQuery("");
                setStatusFilter("all");
              }}
              className={
                section === item.id
                  ? "border-b-2 border-primary px-4 py-3 text-sm font-semibold text-primary"
                  : "border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-text-muted transition hover:text-text"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {section === "overview" && (
        <>
          <section className="mt-6 grid gap-5 xl:grid-cols-3">
            {[
              {
                title: "Organization",
                icon: Settings2,
                profile: effectiveOrganization,
              },
              {
                title: "Security",
                icon: ShieldCheck,
                profile: effectiveSecurity,
              },
              {
                title: "Notifications",
                icon: Bell,
                profile: effectiveNotifications,
              },
            ].map((item) => {
              const Icon = item.icon;
              const summary = item.profile ? getProfileSummary(item.profile) : [];

              return (
                <Card key={item.title} className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-control bg-info-muted text-info">
                      <Icon size={19} />
                    </span>
                    <div>
                      <h2 className="font-bold">{item.title}</h2>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.profile?.name ?? "No active profile"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {summary.length > 0 ? (
                      summary.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-4 rounded-control bg-canvas px-4 py-3"
                        >
                          <span className="text-sm text-text-muted">{row.label}</span>
                          <span className="text-sm font-semibold">{row.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
                        No active profile is available.
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </section>

          <Card className="mt-6 overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-bold">Recent settings activity</h2>
              <p className="mt-1 text-sm text-text-muted">
                Latest administrative changes in the selected scope.
              </p>
            </div>
            <DataTable
              rows={scopedAudit.slice(0, 6)}
              columns={auditColumns}
              getRowKey={(entry) => entry.id}
              onRowClick={(entry) => auditSelection.select(entry.id)}
              emptyState={<EmptyState />}
            />
          </Card>
        </>
      )}

      {currentCategory && (
        <Card className="mt-6 overflow-hidden">
          <TableHeader
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={Object.entries(SETTINGS_STATUS_CONFIG).map(
              ([value, config]) => ({
                value,
                label: config.label,
              }),
            )}
          />
          <DataTable
            rows={filteredProfiles}
            columns={profileColumns}
            getRowKey={(profile) => profile.id}
            onRowClick={(profile) => profileSelection.select(profile.id)}
            emptyState={<EmptyState />}
          />
        </Card>
      )}

      {section === "integrations" && (
        <Card className="mt-6 overflow-hidden">
          <TableHeader
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={Object.entries(INTEGRATION_STATUS_CONFIG).map(
              ([value, config]) => ({
                value,
                label: config.label,
              }),
            )}
          />
          <DataTable
            rows={filteredIntegrations}
            columns={integrationColumns}
            getRowKey={(integration) => integration.id}
            onRowClick={(integration) => integrationSelection.select(integration.id)}
            emptyState={<EmptyState />}
          />
        </Card>
      )}

      {section === "audit" && (
        <Card className="mt-6 overflow-hidden">
          <TableHeader query={query} setQuery={setQuery} />
          <DataTable
            rows={filteredAudit}
            columns={auditColumns}
            getRowKey={(entry) => entry.id}
            onRowClick={(entry) => auditSelection.select(entry.id)}
            emptyState={<EmptyState />}
          />
        </Card>
      )}

      <Drawer
        open={Boolean(selectedProfile && editorMode === null)}
        onClose={() => profileSelection.clear()}
        title="Settings profile"
        description={selectedProfile?.name}
        footer={
          selectedProfile ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  updateProfileStatus(
                    selectedProfile.status === "active" ? "archived" : "active",
                  )
                }
              >
                {selectedProfile.status === "active"
                  ? SETTINGS_COPY.archive
                  : SETTINGS_COPY.activate}
              </Button>
              <Button
                onClick={() => {
                  setCreateCategory(selectedProfile.category);
                  setEditorMode("profile");
                }}
              >
                <FilePenLine />
                {SETTINGS_COPY.edit}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedProfile && <ProfileDetails profile={selectedProfile} />}
      </Drawer>

      <Drawer
        open={Boolean(selectedIntegration && editorMode === null)}
        onClose={() => integrationSelection.clear()}
        title="Integration"
        description={selectedIntegration?.name}
        footer={
          selectedIntegration ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  updateIntegrationStatus(
                    selectedIntegration.status === "connected"
                      ? "disconnected"
                      : "connected",
                  )
                }
              >
                {selectedIntegration.status === "connected"
                  ? SETTINGS_COPY.disconnect
                  : SETTINGS_COPY.connect}
              </Button>
              <Button onClick={() => setEditorMode("integration")}>
                <FilePenLine />
                {SETTINGS_COPY.edit}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedIntegration && <IntegrationDetails integration={selectedIntegration} />}
      </Drawer>

      <Drawer
        open={Boolean(selectedAudit)}
        onClose={() => auditSelection.clear()}
        title="Settings audit details"
        description={selectedAudit?.entityName}
      >
        {selectedAudit && <AuditDetails entry={selectedAudit} />}
      </Drawer>

      <Drawer
        open={editorMode === "profile"}
        onClose={() => setEditorMode(null)}
        title={selectedProfile ? "Edit settings profile" : "Add settings profile"}
        description="Configure reusable organization or branch-specific settings."
      >
        <ProfileForm
          key={selectedProfile?.id ?? createCategory}
          profile={selectedProfile ?? undefined}
          category={selectedProfile?.category ?? createCategory}
          selectedBranchId={selectedBranchId}
          onCancel={() => setEditorMode(null)}
          onSave={saveProfile}
        />
      </Drawer>

      <Drawer
        open={editorMode === "integration"}
        onClose={() => setEditorMode(null)}
        title={selectedIntegration ? "Edit integration" : "Add integration"}
        description="Configure provider, scope, endpoint and synchronization."
      >
        <IntegrationForm
          key={selectedIntegration?.id ?? "new-integration"}
          integration={selectedIntegration ?? undefined}
          selectedBranchId={selectedBranchId}
          onCancel={() => setEditorMode(null)}
          onSave={saveIntegration}
        />
      </Drawer>
    </div>
  );
}

function TableHeader({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  statusOptions,
}: {
  query: string;
  setQuery: (value: string) => void;
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;
  statusOptions?: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="border-b border-border p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={SETTINGS_COPY.searchPlaceholder}
            className="pl-9"
          />
        </div>

        {setStatusFilter && statusOptions && (
          <Select
            value={statusFilter ?? "all"}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <Settings2 className="size-8 text-text-muted" />
      <h3 className="mt-4 font-bold">{SETTINGS_COPY.emptyTitle}</h3>
      <p className="mt-2 text-sm text-text-muted">{SETTINGS_COPY.emptyDescription}</p>
    </div>
  );
}

function ProfileDetails({ profile }: { profile: SettingsProfile }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-card border border-border p-5">
        <div>
          <p className="text-xs font-semibold capitalize text-primary">
            {profile.category}
          </p>
          <h3 className="mt-2 font-bold">{profile.name}</h3>
          <p className="mt-1 text-sm text-text-muted">
            {profile.branchName ?? "All organization branches"}
          </p>
        </div>
        <Badge variant={SETTINGS_STATUS_CONFIG[profile.status].badgeVariant}>
          {SETTINGS_STATUS_CONFIG[profile.status].label}
        </Badge>
      </div>

      <div className="space-y-3">
        {SETTINGS_FIELD_CONFIG[profile.category].map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between gap-4 rounded-control border border-border p-4"
          >
            <span className="text-sm text-text-muted">{field.label}</span>
            <span className="text-sm font-semibold">
              {formatSettingsValue(profile.values[field.key] ?? "Not configured")}
            </span>
          </div>
        ))}
      </div>

      <p className="rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
        {profile.note || "No internal note has been added."}
      </p>
    </div>
  );
}

function IntegrationDetails({ integration }: { integration: IntegrationRecord }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-card border border-border p-5">
        <div>
          <p className="text-xs font-semibold text-primary">
            {INTEGRATION_TYPE_CONFIG[integration.type].label}
          </p>
          <h3 className="mt-2 font-bold">{integration.name}</h3>
          <p className="mt-1 text-sm text-text-muted">{integration.provider}</p>
        </div>
        <Badge variant={INTEGRATION_STATUS_CONFIG[integration.status].badgeVariant}>
          {INTEGRATION_STATUS_CONFIG[integration.status].label}
        </Badge>
      </div>

      {[
        ["Scope", integration.branchName ?? "All organization branches"],
        ["Endpoint", integration.endpointLabel],
        ["Sync frequency", integration.syncFrequency],
        [
          "Last sync",
          integration.lastSyncAt
            ? formatSettingsDateTime(integration.lastSyncAt)
            : "Never",
        ],
        [
          "Last test",
          integration.lastTestAt
            ? formatSettingsDateTime(integration.lastTestAt)
            : "Never",
        ],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4 rounded-control border border-border p-4"
        >
          <span className="text-sm text-text-muted">{label}</span>
          <span className="text-sm font-semibold">{value}</span>
        </div>
      ))}

      <p className="rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
        {integration.note || "No integration note has been added."}
      </p>
    </div>
  );
}

function AuditDetails({ entry }: { entry: SettingsAuditEntry }) {
  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border p-5">
        <p className="text-xs font-semibold capitalize text-primary">{entry.category}</p>
        <h3 className="mt-2 font-bold">{entry.entityName}</h3>
        <p className="mt-2 text-sm text-text-muted">
          {entry.actorName} · {formatSettingsDateTime(entry.createdAt)}
        </p>
      </div>

      <p className="rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
        {entry.summary}
      </p>

      <div className="space-y-2">
        {entry.changes.map((change) => (
          <div
            key={change}
            className="rounded-control border border-border px-4 py-3 text-sm font-medium"
          >
            {change}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileForm({
  profile,
  category,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  profile?: SettingsProfile;
  category: SettingsCategory;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (profile: SettingsProfile) => void;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [scope, setScope] = useState<SettingsScope>(profile?.scope ?? "organization");
  const [branchId, setBranchId] = useState(
    profile?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SettingsStatus>(profile?.status ?? "draft");
  const [values, setValues] = useState<Record<string, SettingsValue>>(
    profile?.values ?? createDefaultValues(category),
  );
  const [note, setNote] = useState(profile?.note ?? "");
  const [submitted, setSubmitted] = useState(false);

  const fields = SETTINGS_FIELD_CONFIG[category];

  const valid = Boolean(name.trim() && (scope === "organization" || branchId));

  function setValue(key: string, value: SettingsValue) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!valid) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    onSave({
      id: profile?.id ?? crypto.randomUUID(),
      name: name.trim(),
      category,
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      values,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Profile name"
          htmlFor="settingsProfileName"
          error={submitted && !name.trim() ? "Enter a profile name" : undefined}
        >
          <Input
            id="settingsProfileName"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>

        <FormField label="Status" htmlFor="settingsProfileStatus">
          <Select
            id="settingsProfileStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as SettingsStatus)}
          >
            {Object.entries(SETTINGS_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="settingsProfileScope">
          <Select
            id="settingsProfileScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as SettingsScope)}
          >
            <option value="organization">Organization</option>
            <option value="branch">Branch</option>
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="settingsProfileBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="settingsProfileBranch"
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
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <SettingsField
            key={field.key}
            field={field}
            value={values[field.key] ?? ""}
            onChange={(value) => setValue(field.key, value)}
          />
        ))}
      </div>

      <FormField label="Internal note" htmlFor="settingsProfileNote" optional>
        <Textarea
          id="settingsProfileNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SETTINGS_COPY.cancel}
        </Button>
        <Button type="submit">
          {profile ? SETTINGS_COPY.save : SETTINGS_COPY.create}
        </Button>
      </div>
    </form>
  );
}

function SettingsField({
  field,
  value,
  onChange,
}: {
  field: (typeof SETTINGS_FIELD_CONFIG)[SettingsCategory][number];
  value: SettingsValue;
  onChange: (value: SettingsValue) => void;
}) {
  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
        <div>
          <p className="text-sm font-semibold">{field.label}</p>
          {field.description && (
            <p className="mt-1 text-xs text-text-muted">{field.description}</p>
          )}
        </div>
        <Switch
          checked={Boolean(value)}
          onCheckedChange={onChange}
          ariaLabel={field.label}
        />
      </div>
    );
  }

  return (
    <FormField
      label={field.label}
      htmlFor={`settings-field-${field.key}`}
      description={field.description}
    >
      {field.type === "select" ? (
        <Select
          id={`settings-field-${field.key}`}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id={`settings-field-${field.key}`}
          type={
            field.type === "number" ? "number" : field.type === "time" ? "time" : "text"
          }
          min={field.minimum}
          value={String(value)}
          onChange={(event) =>
            onChange(
              field.type === "number" ? Number(event.target.value) : event.target.value,
            )
          }
        />
      )}
    </FormField>
  );
}

function IntegrationForm({
  integration,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  integration?: IntegrationRecord;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (integration: IntegrationRecord) => void;
}) {
  const [name, setName] = useState(integration?.name ?? "");
  const [provider, setProvider] = useState(integration?.provider ?? "");
  const [type, setType] = useState<IntegrationType>(integration?.type ?? "email");
  const [scope, setScope] = useState<SettingsScope>(integration?.scope ?? "organization");
  const [branchId, setBranchId] = useState(
    integration?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<IntegrationStatus>(
    integration?.status ?? "disconnected",
  );
  const [syncFrequency, setSyncFrequency] = useState(
    integration?.syncFrequency ?? "Manual",
  );
  const [endpointLabel, setEndpointLabel] = useState(integration?.endpointLabel ?? "");
  const [note, setNote] = useState(integration?.note ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    if (
      !name.trim() ||
      !provider.trim() ||
      !endpointLabel.trim() ||
      (scope === "branch" && !branchId)
    ) {
      return;
    }

    onSave({
      id: integration?.id ?? crypto.randomUUID(),
      name: name.trim(),
      provider: provider.trim(),
      type,
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      syncFrequency,
      endpointLabel: endpointLabel.trim(),
      lastSyncAt: integration?.lastSyncAt,
      lastTestAt: integration?.lastTestAt,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Integration name" htmlFor="integrationName">
          <Input
            id="integrationName"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>

        <FormField label="Provider" htmlFor="integrationProvider">
          <Input
            id="integrationProvider"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          />
        </FormField>

        <FormField label="Type" htmlFor="integrationType">
          <Select
            id="integrationType"
            value={type}
            onChange={(event) => setType(event.target.value as IntegrationType)}
          >
            {Object.entries(INTEGRATION_TYPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Status" htmlFor="integrationStatus">
          <Select
            id="integrationStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as IntegrationStatus)}
          >
            {Object.entries(INTEGRATION_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="integrationScope">
          <Select
            id="integrationScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as SettingsScope)}
          >
            <option value="organization">Organization</option>
            <option value="branch">Branch</option>
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField label="Branch" htmlFor="integrationBranch">
            <Select
              id="integrationBranch"
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

        <FormField label="Sync frequency" htmlFor="integrationSync">
          <Select
            id="integrationSync"
            value={syncFrequency}
            onChange={(event) => setSyncFrequency(event.target.value)}
          >
            {["Manual", "Hourly", "Daily", "Weekly"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Endpoint label" htmlFor="integrationEndpoint">
          <Input
            id="integrationEndpoint"
            value={endpointLabel}
            onChange={(event) => setEndpointLabel(event.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Internal note" htmlFor="integrationNote" optional>
        <Textarea
          id="integrationNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SETTINGS_COPY.cancel}
        </Button>
        <Button type="submit">
          {integration ? SETTINGS_COPY.save : SETTINGS_COPY.create}
        </Button>
      </div>
    </form>
  );
}
