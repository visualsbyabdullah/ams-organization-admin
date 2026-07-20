"use client";

import { useMemo, useState } from "react";
import { CalendarRange, CheckCircle2, Gauge, Plus, Search, Users } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceCycleDetails } from "@/components/performance/performance-details";
import { PerformanceCycleForm } from "@/components/performance/performance-cycle-form";
import { PerformanceTabs } from "@/components/performance/performance-tabs";
import { createCycleColumns } from "@/components/performance/performance-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_CYCLE_SCOPE_CONFIG,
  PERFORMANCE_CYCLE_STATUS_CONFIG,
} from "@/config/performance";
import { useBranchScope } from "@/context/branch-scope-context";
import { PERFORMANCE_CYCLES } from "@/data/performance";
import { getCycleCompletionRate } from "@/lib/performance";
import type { PerformanceCycle, PerformanceCycleStatus } from "@/types/performance";

export function PerformanceCyclesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [cycles, setCycles] = useState<PerformanceCycle[]>(PERFORMANCE_CYCLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scoped = useMemo(
    () =>
      cycles.filter(
        (cycle) =>
          selectedBranch.isAggregate ||
          cycle.scope === "organization" ||
          cycle.branchId === selectedBranch.id,
      ),
    [cycles, selectedBranch],
  );
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scoped.filter(
      (cycle) =>
        [
          cycle.name,
          cycle.branchName,
          PERFORMANCE_CYCLE_STATUS_CONFIG[cycle.status].label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query) &&
        (statusFilter === "all" || cycle.status === statusFilter) &&
        (scopeFilter === "all" || cycle.scope === scopeFilter),
    );
  }, [scoped, searchQuery, statusFilter, scopeFilter]);
  const selected = cycles.find((cycle) => cycle.id === selectedId) ?? null;
  const active = scoped.filter((cycle) =>
    ["active", "calibration"].includes(cycle.status),
  );
  const totalParticipants = active.reduce(
    (total, cycle) => total + cycle.participants,
    0,
  );
  const averageCompletion =
    active.length > 0
      ? Math.round(
          active.reduce((total, cycle) => total + getCycleCompletionRate(cycle), 0) /
            active.length,
        )
      : 0;
  const columns = useMemo(
    () => createCycleColumns((cycle) => setSelectedId(cycle.id)),
    [],
  );

  const metrics = [
    {
      label: "Active cycles",
      value: String(active.length),
      detail: selectedBranch.name,
      icon: Gauge,
      tone: "info" as const,
    },
    {
      label: "Participants",
      value: String(totalParticipants),
      detail: "Across active review cycles",
      icon: Users,
      tone: "success" as const,
    },
    {
      label: "Average completion",
      value: `${averageCompletion}%`,
      detail: "Active-cycle progress",
      icon: CheckCircle2,
      tone: "warning" as const,
    },
    {
      label: "Upcoming cycles",
      value: String(scoped.filter((cycle) => cycle.status === "draft").length),
      detail: "Draft cycles awaiting launch",
      icon: CalendarRange,
      tone: "neutral" as const,
    },
  ];

  function saveCycle(cycle: PerformanceCycle) {
    setCycles((current) =>
      current.some((item) => item.id === cycle.id)
        ? current.map((item) => (item.id === cycle.id ? cycle : item))
        : [cycle, ...current],
    );
    setSelectedId(cycle.id);
    setEditorMode(null);
  }
  function updateStatus(status: PerformanceCycleStatus) {
    if (!selected) return;
    setCycles((current) =>
      current.map((item) =>
        item.id === selected.id
          ? { ...item, status, updatedAt: new Date().toISOString().slice(0, 10) }
          : item,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PERFORMANCE_COPY.common.eyebrow}
        title={PERFORMANCE_COPY.cycles.title}
        description={PERFORMANCE_COPY.cycles.description}
        actions={
          <Button
            onClick={() => {
              setSelectedId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {PERFORMANCE_COPY.actions.addCycle}
          </Button>
        }
      />
      <div className="mt-7">
        <PerformanceTabs />
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{PERFORMANCE_COPY.cycles.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {PERFORMANCE_COPY.cycles.registerDescription}
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search cycle, branch or status"
                className="pl-9"
              />
            </div>
            <Select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
            >
              <option value="all">All cycle scopes</option>
              {Object.entries(PERFORMANCE_CYCLE_SCOPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All cycle statuses</option>
              {Object.entries(PERFORMANCE_CYCLE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <DataTable
          rows={visible}
          columns={columns}
          getRowKey={(cycle) => cycle.id}
          onRowClick={(cycle) => setSelectedId(cycle.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <CalendarRange className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{PERFORMANCE_COPY.cycles.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {PERFORMANCE_COPY.cycles.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Performance cycle"
        description={selected?.name}
        footer={
          selected ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => setEditorMode("edit")}>
                {PERFORMANCE_COPY.actions.editCycle}
              </Button>
              {selected.status === "draft" && (
                <Button onClick={() => updateStatus("active")}>
                  {PERFORMANCE_COPY.actions.startCycle}
                </Button>
              )}
              {selected.status === "active" && (
                <Button onClick={() => updateStatus("calibration")}>
                  {PERFORMANCE_COPY.actions.moveToCalibration}
                </Button>
              )}
              {selected.status === "calibration" && (
                <Button onClick={() => updateStatus("completed")}>
                  {PERFORMANCE_COPY.actions.completeCycle}
                </Button>
              )}
              {selected.status === "completed" && (
                <Button variant="outline" onClick={() => updateStatus("archived")}>
                  {PERFORMANCE_COPY.actions.archive}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selected && <PerformanceCycleDetails cycle={selected} />}
      </Drawer>
      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add performance cycle" : "Edit performance cycle"
        }
        description="Configure review dates, scope, participants and calibration deadlines."
      >
        {editorMode && (
          <PerformanceCycleForm
            key={editorMode === "create" ? "new-cycle" : selected?.id}
            cycle={editorMode === "edit" ? (selected ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveCycle}
          />
        )}
      </Drawer>
    </div>
  );
}
