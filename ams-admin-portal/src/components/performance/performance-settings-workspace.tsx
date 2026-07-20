"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle2, FileSearch, Gauge, Plus, Search, Settings2 } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceSettingsDetails } from "@/components/performance/performance-details";
import { PerformanceSettingsForm } from "@/components/performance/performance-settings-form";
import { PerformanceTabs } from "@/components/performance/performance-tabs";
import { createSettingsColumns } from "@/components/performance/performance-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PERFORMANCE_COPY, PERFORMANCE_REVIEW_FREQUENCY_CONFIG, PERFORMANCE_SETTINGS_SCOPE_CONFIG, PERFORMANCE_SETTINGS_STATUS_CONFIG } from "@/config/performance";
import { useBranchScope } from "@/context/branch-scope-context";
import { PERFORMANCE_SETTINGS } from "@/data/performance";
import { getEffectivePerformanceSettings } from "@/lib/performance";
import type { PerformanceSettings, PerformanceSettingsStatus } from "@/types/performance";

export function PerformanceSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [settings, setSettings] = useState<PerformanceSettings[]>(PERFORMANCE_SETTINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scoped = useMemo(() => settings.filter((item) => selectedBranch.isAggregate || item.scope === "organization" || item.branchId === selectedBranch.id), [settings, selectedBranch]);
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scoped.filter((item) => [item.name, item.branchName, PERFORMANCE_REVIEW_FREQUENCY_CONFIG[item.reviewFrequency].label].filter(Boolean).join(" ").toLowerCase().includes(query) && (statusFilter === "all" || item.status === statusFilter) && (scopeFilter === "all" || item.scope === scopeFilter));
  }, [scoped, searchQuery, statusFilter, scopeFilter]);
  const selected = settings.find((item) => item.id === selectedId) ?? null;
  const effective = getEffectivePerformanceSettings(settings, selectedBranchId);
  const active = scoped.filter((item) => item.status === "active");
  const overrides = scoped.filter((item) => item.scope === "branch");
  const columns = useMemo(() => createSettingsColumns((item) => setSelectedId(item.id)), []);
  const metrics = [
    { label: "Active configurations", value: String(active.length), detail: selectedBranch.name, icon: Settings2, tone: "success" as const },
    { label: "Branch overrides", value: String(overrides.length), detail: "Custom branch rules", icon: Building2, tone: "info" as const },
    { label: "Review frequency", value: effective ? PERFORMANCE_REVIEW_FREQUENCY_CONFIG[effective.reviewFrequency].label : "â€”", detail: "Effective cadence", icon: Gauge, tone: "warning" as const },
    { label: "Rating scale", value: effective ? `1â€“${effective.ratingScaleMaximum}` : "â€”", detail: "Effective scoring model", icon: CheckCircle2, tone: "neutral" as const },
  ];

  function saveSettings(item: PerformanceSettings) {
    setSettings((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [item, ...current]);
    setSelectedId(item.id);
    setEditorMode(null);
  }
  function updateStatus(status: PerformanceSettingsStatus) {
    if (!selected) return;
    setSettings((current) => current.map((item) => item.id === selected.id ? { ...item, status, updatedAt: new Date().toISOString().slice(0, 10) } : item));
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader eyebrow={PERFORMANCE_COPY.common.eyebrow} title={PERFORMANCE_COPY.settings.title} description={PERFORMANCE_COPY.settings.description} actions={<Button onClick={() => { setSelectedId(null); setEditorMode("create"); }}><Plus />{PERFORMANCE_COPY.actions.addSettings}</Button>} />
      <div className="mt-7"><PerformanceTabs /></div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{PERFORMANCE_COPY.settings.registerTitle}</h2><p className="mt-1 text-sm text-text-muted">{PERFORMANCE_COPY.settings.registerDescription}</p>
            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search configuration, branch or frequency" className="pl-9" /></div>
              <Select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}><option value="all">All configuration scopes</option>{Object.entries(PERFORMANCE_SETTINGS_SCOPE_CONFIG).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</Select>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All configuration statuses</option>{Object.entries(PERFORMANCE_SETTINGS_STATUS_CONFIG).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</Select>
            </div>
          </div>
          <DataTable rows={visible} columns={columns} getRowKey={(item) => item.id} onRowClick={(item) => setSelectedId(item.id)} emptyState={<div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><FileSearch className="size-8 text-text-muted" /><h3 className="mt-4 font-bold">{PERFORMANCE_COPY.settings.emptyTitle}</h3><p className="mt-2 text-sm text-text-muted">{PERFORMANCE_COPY.settings.emptyDescription}</p></div>} />
        </Card>
        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success"><CheckCircle2 size={19} /></span><div><h2 className="text-lg font-bold">{PERFORMANCE_COPY.settings.effectiveTitle}</h2><p className="mt-1 text-sm text-text-muted">{PERFORMANCE_COPY.settings.effectiveDescription}</p></div></div>
          {effective ? <div className="mt-5 space-y-3"><div className="rounded-control border border-border p-4"><p className="font-bold">{effective.name}</p><p className="mt-1 text-xs text-text-muted">{effective.scope === "branch" ? "Active branch override" : "Organization default"}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-control bg-canvas p-4"><p className="text-xs text-text-muted">Frequency</p><p className="mt-1 font-bold">{PERFORMANCE_REVIEW_FREQUENCY_CONFIG[effective.reviewFrequency].label}</p></div><div className="rounded-control bg-canvas p-4"><p className="text-xs text-text-muted">Rating</p><p className="mt-1 font-bold">1â€“{effective.ratingScaleMaximum}</p></div><div className="rounded-control bg-canvas p-4"><p className="text-xs text-text-muted">Goals</p><p className="mt-1 font-bold">{effective.goalWeight}%</p></div><div className="rounded-control bg-canvas p-4"><p className="text-xs text-text-muted">Competencies</p><p className="mt-1 font-bold">{effective.competencyWeight}%</p></div></div><div className="space-y-2 pt-2">{[["Self review", effective.requireSelfReview], ["Manager review", effective.requireManagerReview], ["Calibration", effective.requireCalibration], ["Peer feedback", effective.allowPeerFeedback]].map(([label, enabled]) => <div key={String(label)} className="flex items-center justify-between rounded-control border border-border px-4 py-3"><span className="text-sm font-medium">{String(label)}</span><Badge variant={enabled ? "success" : "neutral"}>{enabled ? "Enabled" : "Disabled"}</Badge></div>)}</div></div> : <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">No active performance configuration is available.</p>}
        </Card>
      </section>
      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Performance configuration" description={selected?.name} footer={selected ? <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" onClick={() => setEditorMode("edit")}>{PERFORMANCE_COPY.actions.editSettings}</Button>{selected.status !== "active" && <Button onClick={() => updateStatus("active")}>{PERFORMANCE_COPY.actions.activate}</Button>}{selected.status === "active" && <Button variant="outline" onClick={() => updateStatus("archived")}>{PERFORMANCE_COPY.actions.archive}</Button>}</div> : undefined}>
        {selected && <PerformanceSettingsDetails settings={selected} />}
      </Drawer>
      <Drawer open={editorMode !== null} onClose={() => setEditorMode(null)} title={editorMode === "create" ? "Add performance settings" : "Edit performance settings"} description="Configure review cadence, scoring weights and workflow controls.">
        {editorMode && <PerformanceSettingsForm key={editorMode === "create" ? "new-settings" : selected?.id} settings={editorMode === "edit" ? selected ?? undefined : undefined} selectedBranchId={selectedBranchId} onCancel={() => setEditorMode(null)} onSave={saveSettings} />}
      </Drawer>
    </div>
  );
}
