"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { AttendanceTrendChart } from "@/components/dashboard/attendance-trend-chart";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ComparisonBarChart } from "@/components/dashboard/comparison-bar-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WorkforceDistributionChart } from "@/components/dashboard/workforce-distribution-chart";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UI_COPY } from "@/config/ui";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { DASHBOARD_DATA } from "@/data/dashboard";

export function DashboardOverview() {
  const { selectedBranch } = useBranchScope();

  const dashboardData = DASHBOARD_DATA[selectedBranch.id] ?? DASHBOARD_DATA.all;

  return (
    <div className="mx-auto max-w-360">
      <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">
            {UI_COPY.dashboard.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {UI_COPY.dashboard.title}, {CURRENT_ADMIN.name}
          </h1>

          <p className="mt-3 text-sm text-text-muted md:text-base">
            {selectedBranch.isAggregate
              ? UI_COPY.dashboard.aggregateDescription
              : UI_COPY.dashboard.branchDescription}
          </p>

          <p className="mt-2 inline-flex rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted">
            Viewing: {selectedBranch.name}
          </p>
        </div>

        <Button>
          <Plus />
          Quick create
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <ChartCard
          title="Attendance trend"
          description="Present, late and absent employees during the last seven days"
          action={
            <Button variant="ghost" size="sm">
              View report
              <ArrowRight />
            </Button>
          }
        >
          <AttendanceTrendChart data={dashboardData.attendanceTrend} />
        </ChartCard>

        <ChartCard
          title="TodayÃ¢â‚¬â„¢s workforce"
          description="Current employee attendance distribution"
        >
          <WorkforceDistributionChart data={dashboardData.distribution} />
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard
          title={dashboardData.comparisonTitle}
          description={dashboardData.comparisonDescription}
        >
          <ComparisonBarChart data={dashboardData.comparisonData} />
        </ChartCard>

        <Card className="p-6">
          <div>
            <h2 className="text-lg font-bold">Attention required</h2>

            <p className="mt-1 text-sm text-text-muted">
              Items waiting for an administrator
            </p>
          </div>

          <div className="mt-6 divide-y divide-border">
            {dashboardData.attentionItems.map((item) => (
              <button
                type="button"
                key={item.label}
                className="group flex w-full items-center justify-between gap-4 py-4 text-left first:pt-0"
              >
                <span className="text-sm font-semibold transition group-hover:text-primary">
                  {item.label}
                </span>

                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          <Link
            href="/approvals"
            className={`${buttonVariants({
              variant: "outline",
            })} w-full`}
          >
            Open approval inbox
            <ArrowRight size={17} />
          </Link>
        </Card>
      </section>
    </div>
  );
}
