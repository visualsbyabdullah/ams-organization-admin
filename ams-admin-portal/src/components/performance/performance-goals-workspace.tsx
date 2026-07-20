"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Plus,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceGoalDetails } from "@/components/performance/performance-details";
import { PerformanceGoalForm } from "@/components/performance/performance-goal-form";
import { PerformanceTabs } from "@/components/performance/performance-tabs";
import { createGoalColumns } from "@/components/performance/performance-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_GOAL_LEVEL_CONFIG,
  PERFORMANCE_GOAL_STATUS_CONFIG,
} from "@/config/performance";
import { useBranchScope } from "@/context/branch-scope-context";
import { PERFORMANCE_GOALS } from "@/data/performance";
import type { PerformanceGoal, PerformanceGoalStatus } from "@/types/performance";

export function PerformanceGoalsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [goals, setGoals] = useState<PerformanceGoal[]>(PERFORMANCE_GOALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scoped = useMemo(
    () =>
      goals.filter(
        (goal) => selectedBranch.isAggregate || goal.branchId === selectedBranch.id,
      ),
    [goals, selectedBranch],
  );
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scoped.filter(
      (goal) =>
        [goal.title, goal.description, goal.ownerName, goal.department, goal.unit]
          .join(" ")
          .toLowerCase()
          .includes(query) &&
        (statusFilter === "all" || goal.status === statusFilter) &&
        (levelFilter === "all" || goal.level === levelFilter),
    );
  }, [scoped, searchQuery, statusFilter, levelFilter]);
  const selected = goals.find((goal) => goal.id === selectedId) ?? null;
  const active = scoped.filter((goal) => ["active", "at_risk"].includes(goal.status));
  const atRisk = scoped.filter((goal) => goal.status === "at_risk");
  const completed = scoped.filter((goal) => goal.status === "completed");
  const averageProgress =
    active.length > 0
      ? Math.round(
          active.reduce((total, goal) => total + goal.progress, 0) / active.length,
        )
      : 0;
  const columns = useMemo(() => createGoalColumns((goal) => setSelectedId(goal.id)), []);
  const metrics = [
    {
      label: "Active goals",
      value: String(active.length),
      detail: selectedBranch.name,
      icon: Target,
      tone: "info" as const,
    },
    {
      label: "Average progress",
      value: `${averageProgress}%`,
      detail: "Active goal portfolio",
      icon: TrendingUp,
      tone: "success" as const,
    },
    {
      label: "At-risk goals",
      value: String(atRisk.length),
      detail: "Requires owner action",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
    {
      label: "Completed goals",
      value: String(completed.length),
      detail: "Historical achievements",
      icon: CheckCircle2,
      tone: "warning" as const,
    },
  ];

  function saveGoal(goal: PerformanceGoal) {
    setGoals((current) =>
      current.some((item) => item.id === goal.id)
        ? current.map((item) => (item.id === goal.id ? goal : item))
        : [goal, ...current],
    );
    setSelectedId(goal.id);
    setEditorMode(null);
  }
  function updateStatus(status: PerformanceGoalStatus) {
    if (!selected) return;
    setGoals((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status,
              progress: status === "completed" ? 100 : item.progress,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : item,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PERFORMANCE_COPY.common.eyebrow}
        title={PERFORMANCE_COPY.goals.title}
        description={PERFORMANCE_COPY.goals.description}
        actions={
          <Button
            onClick={() => {
              setSelectedId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {PERFORMANCE_COPY.actions.addGoal}
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
          <h2 className="text-lg font-bold">{PERFORMANCE_COPY.goals.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {PERFORMANCE_COPY.goals.registerDescription}
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search goal, owner, department or unit"
                className="pl-9"
              />
            </div>
            <Select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option value="all">All goal levels</option>
              {Object.entries(PERFORMANCE_GOAL_LEVEL_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All goal statuses</option>
              {Object.entries(PERFORMANCE_GOAL_STATUS_CONFIG).map(([value, config]) => (
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
          getRowKey={(goal) => goal.id}
          onRowClick={(goal) => setSelectedId(goal.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{PERFORMANCE_COPY.goals.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {PERFORMANCE_COPY.goals.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Performance goal"
        description={selected?.ownerName}
        footer={
          selected ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => setEditorMode("edit")}>
                {PERFORMANCE_COPY.actions.editGoal}
              </Button>
              {selected.status !== "at_risk" && selected.status !== "completed" && (
                <Button variant="outline" onClick={() => updateStatus("at_risk")}>
                  {PERFORMANCE_COPY.actions.markAtRisk}
                </Button>
              )}
              {selected.status !== "completed" && (
                <Button onClick={() => updateStatus("completed")}>
                  {PERFORMANCE_COPY.actions.markComplete}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selected && <PerformanceGoalDetails goal={selected} />}
      </Drawer>
      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add performance goal" : "Edit performance goal"}
        description="Define ownership, measurement, weighting and progress for a performance objective."
      >
        {editorMode && (
          <PerformanceGoalForm
            key={editorMode === "create" ? "new-goal" : selected?.id}
            goal={editorMode === "edit" ? (selected ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveGoal}
          />
        )}
      </Drawer>
    </div>
  );
}
