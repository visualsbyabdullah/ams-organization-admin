"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileSearch, Gauge, Search, Star, Users } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceReviewDetails } from "@/components/performance/performance-details";
import { PerformanceReviewForm } from "@/components/performance/performance-review-form";
import { PerformanceTabs } from "@/components/performance/performance-tabs";
import { createReviewColumns } from "@/components/performance/performance-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PERFORMANCE_COPY, PERFORMANCE_REVIEW_STATUS_CONFIG } from "@/config/performance";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import { PERFORMANCE_CYCLES, PERFORMANCE_REVIEWS } from "@/data/performance";
import { getAverageReviewScore } from "@/lib/performance";
import type { PerformanceReview } from "@/types/performance";

export function PerformanceReviewsWorkspace() {
  const { selectedBranch } = useBranchScope();
  const [reviews, setReviews] = useState<PerformanceReview[]>(PERFORMANCE_REVIEWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");
  const reviewSelection = useEntitySelection(reviews, (review) => review.id);
  const [editOpen, setEditOpen] = useState(false);

  const scoped = useMemo(
    () =>
      reviews.filter(
        (review) => selectedBranch.isAggregate || review.branchId === selectedBranch.id,
      ),
    [reviews, selectedBranch],
  );
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scoped.filter((review) => {
      const employee = EMPLOYEES.find((item) => item.id === review.employeeId);
      const cycle = PERFORMANCE_CYCLES.find((item) => item.id === review.cycleId);
      const searchable = [
        employee?.name,
        employee?.employeeCode,
        employee?.department,
        review.managerName,
        cycle?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        searchable.includes(query) &&
        (statusFilter === "all" || review.status === statusFilter) &&
        (cycleFilter === "all" || review.cycleId === cycleFilter)
      );
    });
  }, [scoped, searchQuery, statusFilter, cycleFilter]);
  const selected = reviewSelection.selected;
  const completed = scoped.filter((review) => review.status === "completed");
  const completionRate =
    scoped.length > 0 ? Math.round((completed.length / scoped.length) * 100) : 0;
  const averageScore = getAverageReviewScore(completed);
  const columns = useMemo(
    () => createReviewColumns((review) => reviewSelection.select(review.id)),
    [reviewSelection],
  );
  const metrics = [
    {
      label: "Employee reviews",
      value: String(scoped.length),
      detail: selectedBranch.name,
      icon: Users,
      tone: "info" as const,
    },
    {
      label: "Completed",
      value: String(completed.length),
      detail: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Average score",
      value: averageScore > 0 ? `${averageScore}%` : "â€”",
      detail: "Completed reviews",
      icon: Star,
      tone: "warning" as const,
    },
    {
      label: "Pending action",
      value: String(scoped.length - completed.length),
      detail: "Self, manager or calibration",
      icon: Gauge,
      tone: "danger" as const,
    },
  ];

  function saveReview(review: PerformanceReview) {
    setReviews((current) =>
      current.map((item) => (item.id === review.id ? review : item)),
    );
    setEditOpen(false);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PERFORMANCE_COPY.common.eyebrow}
        title={PERFORMANCE_COPY.reviews.title}
        description={PERFORMANCE_COPY.reviews.description}
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
          <h2 className="text-lg font-bold">{PERFORMANCE_COPY.reviews.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {PERFORMANCE_COPY.reviews.registerDescription}
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={PERFORMANCE_COPY.common.searchPlaceholder}
                className="pl-9"
              />
            </div>
            <Select
              value={cycleFilter}
              onChange={(event) => setCycleFilter(event.target.value)}
            >
              <option value="all">All review cycles</option>
              {PERFORMANCE_CYCLES.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All review statuses</option>
              {Object.entries(PERFORMANCE_REVIEW_STATUS_CONFIG).map(([value, config]) => (
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
          getRowKey={(review) => review.id}
          onRowClick={(review) => reviewSelection.select(review.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{PERFORMANCE_COPY.reviews.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {PERFORMANCE_COPY.reviews.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>
      <Drawer
        open={Boolean(selected)}
        onClose={() => {
          reviewSelection.clear();
          setEditOpen(false);
        }}
        title="Employee performance review"
        description={
          selected
            ? EMPLOYEES.find((item) => item.id === selected.employeeId)?.name
            : undefined
        }
        footer={
          selected ? (
            <div className="flex justify-end">
              <Button onClick={() => setEditOpen(true)}>
                {PERFORMANCE_COPY.actions.editReview}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selected && <PerformanceReviewDetails review={selected} />}
      </Drawer>
      <Drawer
        open={Boolean(editOpen && selected)}
        onClose={() => setEditOpen(false)}
        title="Update performance review"
        description={
          selected
            ? EMPLOYEES.find((item) => item.id === selected.employeeId)?.name
            : undefined
        }
      >
        {selected && (
          <PerformanceReviewForm
            key={`${selected.id}-${selected.status}`}
            review={selected}
            onCancel={() => setEditOpen(false)}
            onSave={saveReview}
          />
        )}
      </Drawer>
    </div>
  );
}
