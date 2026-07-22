"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Download, Gauge, Star, Target } from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  PerformanceGoalDetails,
  PerformanceReviewDetails,
} from "@/components/performance/performance-details";
import { PerformanceRatingChart } from "@/components/performance/performance-rating-chart";
import { PerformanceTabs } from "@/components/performance/performance-tabs";
import { createReviewColumns } from "@/components/performance/performance-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_GOAL_STATUS_CONFIG,
  PERFORMANCE_REVIEW_STATUS_CONFIG,
} from "@/config/performance";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import {
  PERFORMANCE_CYCLES,
  PERFORMANCE_GOALS,
  PERFORMANCE_REVIEWS,
} from "@/data/performance";
import {
  exportPerformanceToCsv,
  getAverageReviewScore,
  getRatingDistribution,
} from "@/lib/performance";

export function PerformanceOverview() {
  const { selectedBranch } = useBranchScope();

  const reviews = useMemo(
    () =>
      PERFORMANCE_REVIEWS.filter(
        (review) => selectedBranch.isAggregate || review.branchId === selectedBranch.id,
      ),
    [selectedBranch],
  );
  const goals = useMemo(
    () =>
      PERFORMANCE_GOALS.filter(
        (goal) => selectedBranch.isAggregate || goal.branchId === selectedBranch.id,
      ),
    [selectedBranch],
  );

  const reviewSelection = useEntitySelection(reviews, (review) => review.id);
  const goalSelection = useEntitySelection(goals, (goal) => goal.id);

  const cycles = PERFORMANCE_CYCLES.filter(
    (cycle) =>
      selectedBranch.isAggregate ||
      cycle.scope === "organization" ||
      cycle.branchId === selectedBranch.id,
  );
  const completedReviews = reviews.filter((review) => review.status === "completed");
  const activeCycles = cycles.filter((cycle) =>
    ["active", "calibration"].includes(cycle.status),
  );
  const atRiskGoals = goals.filter((goal) => goal.status === "at_risk");
  const pendingReviews = reviews.filter((review) => review.status !== "completed");
  const completionRate =
    reviews.length > 0 ? Math.round((completedReviews.length / reviews.length) * 100) : 0;
  const averageScore = getAverageReviewScore(completedReviews);
  const ratingData = getRatingDistribution(completedReviews);
  const recentReviews = [...reviews]
    .sort((a, b) =>
      (b.completedAt ?? b.submittedAt ?? "").localeCompare(
        a.completedAt ?? a.submittedAt ?? "",
      ),
    )
    .slice(0, 5);
  const selectedReview = reviewSelection.selected;
  const selectedGoal = goalSelection.selected;
  const columns = useMemo(
    () => createReviewColumns((review) => reviewSelection.select(review.id)),
    [reviewSelection],
  );

  const metrics = [
    {
      label: "Active review cycles",
      value: String(activeCycles.length),
      detail: selectedBranch.name,
      icon: Gauge,
      tone: "info" as const,
    },
    {
      label: "Review completion",
      value: `${completionRate}%`,
      detail: `${completedReviews.length} of ${reviews.length} completed`,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Average score",
      value: averageScore > 0 ? `${averageScore}%` : "â€”",
      detail: "Completed employee reviews",
      icon: Star,
      tone: "warning" as const,
    },
    {
      label: "Goals at risk",
      value: String(atRiskGoals.length),
      detail: "Requires manager follow-up",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PERFORMANCE_COPY.common.eyebrow}
        title={PERFORMANCE_COPY.overview.title}
        description={PERFORMANCE_COPY.overview.description}
        actions={
          <Button
            variant="outline"
            onClick={() => exportPerformanceToCsv(reviews, goals)}
          >
            <Download />
            {PERFORMANCE_COPY.common.exportAction}
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
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={PERFORMANCE_COPY.overview.chartTitle}
          description={PERFORMANCE_COPY.overview.chartDescription}
        >
          <PerformanceRatingChart data={ratingData} />
        </ChartCard>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <Target size={19} />
            </span>
            <div>
              <h2 className="text-lg font-bold">
                {PERFORMANCE_COPY.overview.attentionTitle}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {PERFORMANCE_COPY.overview.attentionDescription}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {atRiskGoals.map((goal) => (
              <Button
                key={goal.id}
                variant="outline"
                className="h-auto w-full justify-between p-4 text-left"
                onClick={() => goalSelection.select(goal.id)}
              >
                <span>
                  <span className="block whitespace-normal font-semibold">
                    {goal.title}
                  </span>
                  <span className="mt-1 block text-xs text-text-muted">
                    {goal.ownerName} Â· {goal.progress}% complete
                  </span>
                </span>
                <Badge variant={PERFORMANCE_GOAL_STATUS_CONFIG[goal.status].badgeVariant}>
                  {PERFORMANCE_GOAL_STATUS_CONFIG[goal.status].label}
                </Badge>
              </Button>
            ))}
            {pendingReviews.slice(0, 3).map((review) => {
              const employee = EMPLOYEES.find((item) => item.id === review.employeeId);
              return (
                <Button
                  key={review.id}
                  variant="outline"
                  className="h-auto w-full justify-between p-4 text-left"
                  onClick={() => reviewSelection.select(review.id)}
                >
                  <span>
                    <span className="block font-semibold">
                      {employee?.name ?? "Employee review"}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {review.managerName}
                    </span>
                  </span>
                  <Badge
                    variant={PERFORMANCE_REVIEW_STATUS_CONFIG[review.status].badgeVariant}
                  >
                    {PERFORMANCE_REVIEW_STATUS_CONFIG[review.status].label}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </Card>
      </section>
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{PERFORMANCE_COPY.overview.recentTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {PERFORMANCE_COPY.overview.recentDescription}
          </p>
        </div>
        <DataTable
          rows={recentReviews}
          columns={columns}
          getRowKey={(review) => review.id}
          onRowClick={(review) => reviewSelection.select(review.id)}
          emptyState={
            <div className="p-8 text-center text-sm text-text-muted">
              No recent reviews are available.
            </div>
          }
        />
      </Card>
      <Drawer
        open={Boolean(selectedReview)}
        onClose={() => reviewSelection.clear()}
        title="Performance review"
        description={
          selectedReview
            ? EMPLOYEES.find((item) => item.id === selectedReview.employeeId)?.name
            : undefined
        }
      >
        {selectedReview && <PerformanceReviewDetails review={selectedReview} />}
      </Drawer>
      <Drawer
        open={Boolean(selectedGoal)}
        onClose={() => goalSelection.clear()}
        title="Performance goal"
        description={selectedGoal?.ownerName}
      >
        {selectedGoal && <PerformanceGoalDetails goal={selectedGoal} />}
      </Drawer>
    </div>
  );
}
