import type {
  PerformanceCycleScope,
  PerformanceCycleStatus,
  PerformanceGoalLevel,
  PerformanceGoalStatus,
  PerformanceReviewFrequency,
  PerformanceReviewStatus,
  PerformanceSettingsScope,
  PerformanceSettingsStatus,
} from "@/types/performance";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

export const PERFORMANCE_REFERENCE_DATE = "2026-07-16";

export const PERFORMANCE_TABS = [
  { label: "Overview", href: "/performance" },
  { label: "Cycles", href: "/performance/cycles" },
  { label: "Reviews", href: "/performance/reviews" },
  { label: "Goals", href: "/performance/goals" },
  { label: "Settings", href: "/performance/settings" },
] as const;

export const PERFORMANCE_CYCLE_STATUS_CONFIG: Record<
  PerformanceCycleStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  draft: { label: "Draft", badgeVariant: "neutral" },
  active: { label: "Active", badgeVariant: "info" },
  calibration: { label: "Calibration", badgeVariant: "warning" },
  completed: { label: "Completed", badgeVariant: "success" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const PERFORMANCE_CYCLE_SCOPE_CONFIG: Record<
  PerformanceCycleScope,
  { label: string; badgeVariant: BadgeVariant }
> = {
  organization: {
    label: "Organization-wide",
    badgeVariant: "info",
  },
  branch: {
    label: "Branch-specific",
    badgeVariant: "neutral",
  },
};

export const PERFORMANCE_REVIEW_STATUS_CONFIG: Record<
  PerformanceReviewStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  not_started: { label: "Not started", badgeVariant: "neutral" },
  self_review: { label: "Self review", badgeVariant: "info" },
  manager_review: { label: "Manager review", badgeVariant: "warning" },
  calibration: { label: "Calibration", badgeVariant: "warning" },
  completed: { label: "Completed", badgeVariant: "success" },
};

export const PERFORMANCE_GOAL_STATUS_CONFIG: Record<
  PerformanceGoalStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  draft: { label: "Draft", badgeVariant: "neutral" },
  active: { label: "On track", badgeVariant: "info" },
  at_risk: { label: "At risk", badgeVariant: "danger" },
  completed: { label: "Completed", badgeVariant: "success" },
  cancelled: { label: "Cancelled", badgeVariant: "neutral" },
};

export const PERFORMANCE_GOAL_LEVEL_CONFIG: Record<
  PerformanceGoalLevel,
  { label: string; badgeVariant: BadgeVariant }
> = {
  individual: { label: "Individual", badgeVariant: "info" },
  team: { label: "Team", badgeVariant: "success" },
  department: { label: "Department", badgeVariant: "warning" },
  organization: { label: "Organization", badgeVariant: "neutral" },
};

export const PERFORMANCE_REVIEW_FREQUENCY_CONFIG: Record<
  PerformanceReviewFrequency,
  { label: string; periodsPerYear: number }
> = {
  monthly: { label: "Monthly", periodsPerYear: 12 },
  quarterly: { label: "Quarterly", periodsPerYear: 4 },
  biannual: { label: "Twice a year", periodsPerYear: 2 },
  annual: { label: "Annual", periodsPerYear: 1 },
};

export const PERFORMANCE_SETTINGS_STATUS_CONFIG: Record<
  PerformanceSettingsStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  active: { label: "Active", badgeVariant: "success" },
  draft: { label: "Draft", badgeVariant: "warning" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const PERFORMANCE_SETTINGS_SCOPE_CONFIG: Record<
  PerformanceSettingsScope,
  { label: string; badgeVariant: BadgeVariant }
> = {
  organization: {
    label: "Organization default",
    badgeVariant: "info",
  },
  branch: {
    label: "Branch override",
    badgeVariant: "neutral",
  },
};

export const PERFORMANCE_RATING_LABELS: Record<number, string> = {
  1: "Needs improvement",
  2: "Developing",
  3: "Meets expectations",
  4: "Exceeds expectations",
  5: "Exceptional",
};

export const PERFORMANCE_COPY = {
  common: {
    eyebrow: "Talent Management",
    exportAction: "Export performance",
    searchPlaceholder: "Search employee, cycle, department, manager or goal",
  },
  actions: {
    addCycle: "Add review cycle",
    editCycle: "Edit cycle",
    startCycle: "Start cycle",
    moveToCalibration: "Start calibration",
    completeCycle: "Complete cycle",
    archive: "Archive",
    editReview: "Update review",
    completeReview: "Complete review",
    addGoal: "Add goal",
    editGoal: "Edit goal",
    markAtRisk: "Mark at risk",
    markComplete: "Mark complete",
    addSettings: "Add settings",
    editSettings: "Edit settings",
    activate: "Activate",
    save: "Save changes",
    cancel: "Cancel",
  },
  overview: {
    title: "Performance overview",
    description:
      "Track review-cycle progress, employee ratings, goals and development priorities across the organization.",
    chartTitle: "Rating distribution",
    chartDescription:
      "Completed performance-review ratings for the selected organization scope.",
    attentionTitle: "Requires attention",
    attentionDescription: "Reviews waiting for action and goals currently at risk.",
    recentTitle: "Recent performance reviews",
    recentDescription: "Latest review activity within the selected organization scope.",
  },
  cycles: {
    title: "Review cycles",
    description:
      "Create and manage performance-review periods, deadlines, participation and calibration stages.",
    registerTitle: "Cycle register",
    registerDescription: "Organization-wide and branch-specific performance cycles.",
    emptyTitle: "No review cycles found",
    emptyDescription: "Change the filters or create a new performance cycle.",
  },
  reviews: {
    title: "Employee reviews",
    description:
      "Track self reviews, manager assessments, calibration and completed employee ratings.",
    registerTitle: "Review register",
    registerDescription:
      "Employee-review progress and scores across active and historical cycles.",
    emptyTitle: "No performance reviews found",
    emptyDescription: "Change the selected filters or review cycle.",
  },
  goals: {
    title: "Goals and objectives",
    description:
      "Manage employee, team, department and organization goals with measurable progress.",
    registerTitle: "Goal register",
    registerDescription:
      "Performance objectives and progress within the selected organization scope.",
    emptyTitle: "No performance goals found",
    emptyDescription: "Change the filters or add a new performance goal.",
  },
  settings: {
    title: "Performance settings",
    description:
      "Configure review frequency, scoring weights, approvals and feedback rules by organization or branch.",
    registerTitle: "Settings register",
    registerDescription: "Organization defaults and branch-level performance overrides.",
    effectiveTitle: "Effective configuration",
    effectiveDescription:
      "Performance rules currently applied to the selected branch scope.",
    emptyTitle: "No performance settings found",
    emptyDescription: "Change the filters or create a new performance configuration.",
  },
} as const;
