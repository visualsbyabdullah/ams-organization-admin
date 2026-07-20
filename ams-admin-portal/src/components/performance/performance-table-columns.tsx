import { MoreHorizontal } from "lucide-react";

import type { DataTableColumn } from "@/components/shared/data-table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PERFORMANCE_CYCLE_SCOPE_CONFIG,
  PERFORMANCE_CYCLE_STATUS_CONFIG,
  PERFORMANCE_GOAL_LEVEL_CONFIG,
  PERFORMANCE_GOAL_STATUS_CONFIG,
  PERFORMANCE_REVIEW_FREQUENCY_CONFIG,
  PERFORMANCE_REVIEW_STATUS_CONFIG,
  PERFORMANCE_SETTINGS_SCOPE_CONFIG,
  PERFORMANCE_SETTINGS_STATUS_CONFIG,
} from "@/config/performance";
import { EMPLOYEES } from "@/data/employees";
import { PERFORMANCE_CYCLES } from "@/data/performance";
import { formatDate } from "@/lib/date";
import { getCycleCompletionRate } from "@/lib/performance";
import type {
  PerformanceCycle,
  PerformanceGoal,
  PerformanceReview,
  PerformanceSettings,
} from "@/types/performance";

export function createCycleColumns(
  onOpen: (cycle: PerformanceCycle) => void,
): DataTableColumn<PerformanceCycle>[] {
  return [
    {
      id: "cycle",
      header: "Review cycle",
      cell: (cycle) => (
        <div>
          <p className="font-semibold">{cycle.name}</p>
          <p className="mt-1 text-xs text-text-muted">
            {cycle.branchName || "All organization branches"}
          </p>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (cycle) => (
        <Badge variant={PERFORMANCE_CYCLE_SCOPE_CONFIG[cycle.scope].badgeVariant}>
          {PERFORMANCE_CYCLE_SCOPE_CONFIG[cycle.scope].label}
        </Badge>
      ),
    },
    {
      id: "period",
      header: "Period",
      cell: (cycle) => (
        <span>
          {formatDate(cycle.startDate)} â€“ {formatDate(cycle.endDate)}
        </span>
      ),
    },
    {
      id: "participants",
      header: "Participants",
      cell: (cycle) => cycle.participants,
    },
    {
      id: "completion",
      header: "Completion",
      cell: (cycle) => `${getCycleCompletionRate(cycle)}%`,
    },
    {
      id: "status",
      header: "Status",
      cell: (cycle) => (
        <Badge variant={PERFORMANCE_CYCLE_STATUS_CONFIG[cycle.status].badgeVariant}>
          {PERFORMANCE_CYCLE_STATUS_CONFIG[cycle.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (cycle) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${cycle.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(cycle);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}

export function createReviewColumns(
  onOpen: (review: PerformanceReview) => void,
): DataTableColumn<PerformanceReview>[] {
  return [
    {
      id: "employee",
      header: "Employee",
      cell: (review) => {
        const employee = EMPLOYEES.find((item) => item.id === review.employeeId);
        return employee ? (
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} initials={employee.initials} />
            <div>
              <p className="font-semibold">{employee.name}</p>
              <p className="mt-1 text-xs text-text-muted">
                {employee.employeeCode} Â· {employee.department}
              </p>
            </div>
          </div>
        ) : (
          "Employee unavailable"
        );
      },
    },
    {
      id: "cycle",
      header: "Cycle",
      cell: (review) =>
        PERFORMANCE_CYCLES.find((cycle) => cycle.id === review.cycleId)?.name ??
        review.cycleId,
    },
    {
      id: "manager",
      header: "Manager",
      cell: (review) => review.managerName,
    },
    {
      id: "goalScore",
      header: "Goal score",
      cell: (review) => `${review.goalScore}%`,
    },
    {
      id: "overallScore",
      header: "Overall score",
      cell: (review) => (
        <strong>{review.overallScore > 0 ? `${review.overallScore}%` : "â€”"}</strong>
      ),
    },
    {
      id: "rating",
      header: "Final rating",
      cell: (review) => review.finalRating ?? "â€”",
    },
    {
      id: "status",
      header: "Status",
      cell: (review) => (
        <Badge variant={PERFORMANCE_REVIEW_STATUS_CONFIG[review.status].badgeVariant}>
          {PERFORMANCE_REVIEW_STATUS_CONFIG[review.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (review) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open performance review"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(review);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}

export function createGoalColumns(
  onOpen: (goal: PerformanceGoal) => void,
): DataTableColumn<PerformanceGoal>[] {
  return [
    {
      id: "goal",
      header: "Goal",
      cell: (goal) => (
        <div>
          <p className="max-w-xs whitespace-normal font-semibold">{goal.title}</p>
          <p className="mt-1 text-xs text-text-muted">
            {goal.ownerName} Â· {goal.department}
          </p>
        </div>
      ),
    },
    {
      id: "level",
      header: "Level",
      cell: (goal) => (
        <Badge variant={PERFORMANCE_GOAL_LEVEL_CONFIG[goal.level].badgeVariant}>
          {PERFORMANCE_GOAL_LEVEL_CONFIG[goal.level].label}
        </Badge>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      cell: (goal) => <strong>{goal.progress}%</strong>,
    },
    {
      id: "weight",
      header: "Weight",
      cell: (goal) => `${goal.weight}%`,
    },
    {
      id: "due",
      header: "Due date",
      cell: (goal) => formatDate(goal.dueDate),
    },
    {
      id: "status",
      header: "Status",
      cell: (goal) => (
        <Badge variant={PERFORMANCE_GOAL_STATUS_CONFIG[goal.status].badgeVariant}>
          {PERFORMANCE_GOAL_STATUS_CONFIG[goal.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (goal) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${goal.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(goal);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}

export function createSettingsColumns(
  onOpen: (settings: PerformanceSettings) => void,
): DataTableColumn<PerformanceSettings>[] {
  return [
    {
      id: "settings",
      header: "Configuration",
      cell: (settings) => (
        <div>
          <p className="font-semibold">{settings.name}</p>
          <p className="mt-1 text-xs text-text-muted">
            {settings.branchName || "All organization branches"}
          </p>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (settings) => (
        <Badge variant={PERFORMANCE_SETTINGS_SCOPE_CONFIG[settings.scope].badgeVariant}>
          {PERFORMANCE_SETTINGS_SCOPE_CONFIG[settings.scope].label}
        </Badge>
      ),
    },
    {
      id: "frequency",
      header: "Frequency",
      cell: (settings) =>
        PERFORMANCE_REVIEW_FREQUENCY_CONFIG[settings.reviewFrequency].label,
    },
    {
      id: "weights",
      header: "Goal / competency",
      cell: (settings) => `${settings.goalWeight}% / ${settings.competencyWeight}%`,
    },
    {
      id: "rating",
      header: "Rating scale",
      cell: (settings) => `1â€“${settings.ratingScaleMaximum}`,
    },
    {
      id: "status",
      header: "Status",
      cell: (settings) => (
        <Badge variant={PERFORMANCE_SETTINGS_STATUS_CONFIG[settings.status].badgeVariant}>
          {PERFORMANCE_SETTINGS_STATUS_CONFIG[settings.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (settings) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${settings.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(settings);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}
