import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  PERFORMANCE_CYCLE_SCOPE_CONFIG,
  PERFORMANCE_CYCLE_STATUS_CONFIG,
  PERFORMANCE_GOAL_LEVEL_CONFIG,
  PERFORMANCE_GOAL_STATUS_CONFIG,
  PERFORMANCE_RATING_LABELS,
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

export function PerformanceCycleDetails({ cycle }: { cycle: PerformanceCycle }) {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{cycle.name}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Updated {formatDate(cycle.updatedAt)} by {cycle.createdBy}
            </p>
          </div>
          <Badge variant={PERFORMANCE_CYCLE_STATUS_CONFIG[cycle.status].badgeVariant}>
            {PERFORMANCE_CYCLE_STATUS_CONFIG[cycle.status].label}
          </Badge>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <Detail label="Scope">
            <Badge variant={PERFORMANCE_CYCLE_SCOPE_CONFIG[cycle.scope].badgeVariant}>
              {PERFORMANCE_CYCLE_SCOPE_CONFIG[cycle.scope].label}
            </Badge>
          </Detail>
          <Detail label="Branch">
            {cycle.branchName || "All organization branches"}
          </Detail>
          <Detail label="Review period">
            {formatDate(cycle.startDate)} â€“ {formatDate(cycle.endDate)}
          </Detail>
          <Detail label="Completion">
            {cycle.completedReviews} of {cycle.participants} reviews (
            {getCycleCompletionRate(cycle)}%)
          </Detail>
          <Detail label="Self-review deadline">
            {formatDate(cycle.selfReviewDueDate)}
          </Detail>
          <Detail label="Manager deadline">
            {formatDate(cycle.managerReviewDueDate)}
          </Detail>
          <Detail label="Calibration date">{formatDate(cycle.calibrationDate)}</Detail>
        </dl>
      </section>
      <Note title="Cycle note" value={cycle.note} />
    </div>
  );
}

export function PerformanceReviewDetails({ review }: { review: PerformanceReview }) {
  const employee = EMPLOYEES.find((item) => item.id === review.employeeId);
  const cycle = PERFORMANCE_CYCLES.find((item) => item.id === review.cycleId);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{employee?.name || "Employee review"}</h3>
            <p className="mt-1 text-xs text-text-muted">
              {cycle?.name || review.cycleId} Â· {review.managerName}
            </p>
          </div>
          <Badge variant={PERFORMANCE_REVIEW_STATUS_CONFIG[review.status].badgeVariant}>
            {PERFORMANCE_REVIEW_STATUS_CONFIG[review.status].label}
          </Badge>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <Detail label="Employee ID">
            {employee?.employeeCode || review.employeeId}
          </Detail>
          <Detail label="Department">{employee?.department || "Not available"}</Detail>
          <Detail label="Self rating">{review.selfRating ?? "Not submitted"}</Detail>
          <Detail label="Manager rating">
            {review.managerRating ?? "Not submitted"}
          </Detail>
          <Detail label="Final rating">
            {review.finalRating
              ? `${review.finalRating} Â· ${PERFORMANCE_RATING_LABELS[review.finalRating]}`
              : "Not finalized"}
          </Detail>
          <Detail label="Overall score">
            {review.overallScore > 0 ? `${review.overallScore}%` : "Not scored"}
          </Detail>
        </dl>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreCard label="Goal score" value={review.goalScore} tone="info" />
        <ScoreCard
          label="Competency score"
          value={review.competencyScore}
          tone="success"
        />
      </div>
      <Note title="Strengths" value={review.strengths} />
      <Note title="Development areas" value={review.developmentAreas} />
      <Note title="Manager comments" value={review.managerComments} />
    </div>
  );
}

export function PerformanceGoalDetails({ goal }: { goal: PerformanceGoal }) {
  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{goal.title}</h3>
            <p className="mt-1 text-xs text-text-muted">
              {goal.ownerName} Â· Updated {formatDate(goal.updatedAt)}
            </p>
          </div>
          <Badge variant={PERFORMANCE_GOAL_STATUS_CONFIG[goal.status].badgeVariant}>
            {PERFORMANCE_GOAL_STATUS_CONFIG[goal.status].label}
          </Badge>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <Detail label="Goal level">
            <Badge variant={PERFORMANCE_GOAL_LEVEL_CONFIG[goal.level].badgeVariant}>
              {PERFORMANCE_GOAL_LEVEL_CONFIG[goal.level].label}
            </Badge>
          </Detail>
          <Detail label="Department">{goal.department}</Detail>
          <Detail label="Period">
            {formatDate(goal.startDate)} â€“ {formatDate(goal.dueDate)}
          </Detail>
          <Detail label="Weight">{goal.weight}%</Detail>
          <Detail label="Current result">
            {goal.currentValue} {goal.unit}
          </Detail>
          <Detail label="Target">
            {goal.targetValue} {goal.unit}
          </Detail>
        </dl>
      </section>
      <div className="rounded-control bg-info-muted p-5">
        <p className="text-xs text-info">Goal progress</p>
        <p className="mt-1 text-2xl font-bold text-info">{goal.progress}%</p>
      </div>
      <Note title="Goal description" value={goal.description} />
    </div>
  );
}

export function PerformanceSettingsDetails({
  settings,
}: {
  settings: PerformanceSettings;
}) {
  const controls = [
    ["Self review", settings.requireSelfReview],
    ["Manager review", settings.requireManagerReview],
    ["Calibration", settings.requireCalibration],
    ["Peer feedback", settings.allowPeerFeedback],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{settings.name}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Updated {formatDate(settings.updatedAt)} by {settings.updatedBy}
            </p>
          </div>
          <Badge
            variant={PERFORMANCE_SETTINGS_STATUS_CONFIG[settings.status].badgeVariant}
          >
            {PERFORMANCE_SETTINGS_STATUS_CONFIG[settings.status].label}
          </Badge>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <Detail label="Scope">
            <Badge
              variant={PERFORMANCE_SETTINGS_SCOPE_CONFIG[settings.scope].badgeVariant}
            >
              {PERFORMANCE_SETTINGS_SCOPE_CONFIG[settings.scope].label}
            </Badge>
          </Detail>
          <Detail label="Branch">
            {settings.branchName || "All organization branches"}
          </Detail>
          <Detail label="Review frequency">
            {PERFORMANCE_REVIEW_FREQUENCY_CONFIG[settings.reviewFrequency].label}
          </Detail>
          <Detail label="Rating scale">1â€“{settings.ratingScaleMaximum}</Detail>
          <Detail label="Goal weight">{settings.goalWeight}%</Detail>
          <Detail label="Competency weight">{settings.competencyWeight}%</Detail>
          <Detail label="Reminder lead time">
            {settings.reminderDaysBeforeDue} days
          </Detail>
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-bold">Workflow controls</h3>
        <div className="mt-3 space-y-3">
          {controls.map(([label, enabled]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-control border border-border p-4"
            >
              <span className="text-sm font-semibold">{label}</span>
              <Badge variant={enabled ? "success" : "neutral"}>
                {enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          ))}
        </div>
      </section>
      <Note title="Configuration note" value={settings.note} />
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{children}</dd>
    </div>
  );
}

function Note({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
        {value || "No information has been added."}
      </p>
    </section>
  );
}

function ScoreCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success";
}) {
  const classes =
    tone === "info" ? "bg-info-muted text-info" : "bg-success-muted text-success";

  return (
    <div className={`rounded-control p-4 ${classes}`}>
      <p className="text-xs">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}%</p>
    </div>
  );
}
