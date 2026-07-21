import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
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
        <DetailGrid
          variant="none"
          items={[
            {
              label: "Scope",
              value: (
                <Badge variant={PERFORMANCE_CYCLE_SCOPE_CONFIG[cycle.scope].badgeVariant}>
                  {PERFORMANCE_CYCLE_SCOPE_CONFIG[cycle.scope].label}
                </Badge>
              ),
            },
            {
              label: "Branch",
              value: cycle.branchName || "All organization branches",
            },
            {
              label: "Review period",
              value: `${formatDate(cycle.startDate)} â€“ ${formatDate(cycle.endDate)}`,
            },
            {
              label: "Completion",
              value: `${cycle.completedReviews} of ${cycle.participants} reviews (${getCycleCompletionRate(cycle)}%)`,
            },
            {
              label: "Self-review deadline",
              value: formatDate(cycle.selfReviewDueDate),
            },
            {
              label: "Manager deadline",
              value: formatDate(cycle.managerReviewDueDate),
            },
            {
              label: "Calibration date",
              value: formatDate(cycle.calibrationDate),
            },
          ]}
        />
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
        <DetailGrid
          variant="none"
          items={[
            {
              label: "Employee ID",
              value: employee?.employeeCode || review.employeeId,
            },
            {
              label: "Department",
              value: employee?.department || "Not available",
            },
            {
              label: "Self rating",
              value: review.selfRating ?? "Not submitted",
            },
            {
              label: "Manager rating",
              value: review.managerRating ?? "Not submitted",
            },
            {
              label: "Final rating",
              value: review.finalRating
                ? `${review.finalRating} Â· ${PERFORMANCE_RATING_LABELS[review.finalRating]}`
                : "Not finalized",
            },
            {
              label: "Overall score",
              value: review.overallScore > 0 ? `${review.overallScore}%` : "Not scored",
            },
          ]}
        />
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
        <DetailGrid
          variant="none"
          items={[
            {
              label: "Goal level",
              value: (
                <Badge variant={PERFORMANCE_GOAL_LEVEL_CONFIG[goal.level].badgeVariant}>
                  {PERFORMANCE_GOAL_LEVEL_CONFIG[goal.level].label}
                </Badge>
              ),
            },
            {
              label: "Department",
              value: goal.department,
            },
            {
              label: "Period",
              value: `${formatDate(goal.startDate)} â€“ ${formatDate(goal.dueDate)}`,
            },
            {
              label: "Weight",
              value: `${goal.weight}%`,
            },
            {
              label: "Current result",
              value: `${goal.currentValue} ${goal.unit}`,
            },
            {
              label: "Target",
              value: `${goal.targetValue} ${goal.unit}`,
            },
          ]}
        />
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
        <DetailGrid
          variant="none"
          items={[
            {
              label: "Scope",
              value: (
                <Badge
                  variant={PERFORMANCE_SETTINGS_SCOPE_CONFIG[settings.scope].badgeVariant}
                >
                  {PERFORMANCE_SETTINGS_SCOPE_CONFIG[settings.scope].label}
                </Badge>
              ),
            },
            {
              label: "Branch",
              value: settings.branchName || "All organization branches",
            },
            {
              label: "Review frequency",
              value: PERFORMANCE_REVIEW_FREQUENCY_CONFIG[settings.reviewFrequency].label,
            },
            {
              label: "Rating scale",
              value: `1â€“${settings.ratingScaleMaximum}`,
            },
            {
              label: "Goal weight",
              value: `${settings.goalWeight}%`,
            },
            {
              label: "Competency weight",
              value: `${settings.competencyWeight}%`,
            },
            {
              label: "Reminder lead time",
              value: `${settings.reminderDaysBeforeDue} days`,
            },
          ]}
        />
      </section>
      <section>
        <h3 className="text-sm font-bold">Workflow controls</h3>
        <ToggleDetailList
          items={controls.map(([label, enabled]) => ({ label, enabled }))}
        />
      </section>
      <Note title="Configuration note" value={settings.note} />
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
