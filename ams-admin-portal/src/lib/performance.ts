import type {
  PerformanceCycle,
  PerformanceGoal,
  PerformanceReview,
  PerformanceSettings,
} from "@/types/performance";

export function clampPercentage(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

export function getCycleCompletionRate(
  cycle: PerformanceCycle,
) {
  return cycle.participants > 0
    ? clampPercentage(
        (cycle.completedReviews / cycle.participants) * 100,
      )
    : 0;
}

export function getAverageReviewScore(
  reviews: readonly PerformanceReview[],
) {
  const scoredReviews = reviews.filter(
    (review) => review.overallScore > 0,
  );

  if (scoredReviews.length === 0) {
    return 0;
  }

  return Math.round(
    scoredReviews.reduce(
      (total, review) => total + review.overallScore,
      0,
    ) / scoredReviews.length,
  );
}

export function getRatingDistribution(
  reviews: readonly PerformanceReview[],
) {
  return [1, 2, 3, 4, 5].map((rating) => ({
    rating: String(rating),
    employees: reviews.filter(
      (review) => review.finalRating === rating,
    ).length,
  }));
}

export function getEffectivePerformanceSettings(
  settings: readonly PerformanceSettings[],
  branchId: string,
) {
  const organizationDefault =
    settings.find(
      (item) =>
        item.scope === "organization" &&
        item.status === "active",
    ) ?? null;

  const branchOverride =
    branchId === "all"
      ? null
      : settings.find(
          (item) =>
            item.scope === "branch" &&
            item.branchId === branchId &&
            item.status === "active",
        ) ?? null;

  return branchOverride ?? organizationDefault;
}

function escapeCsvValue(value: unknown) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function exportPerformanceToCsv(
  reviews: readonly PerformanceReview[],
  goals: readonly PerformanceGoal[],
  filename = "performance-export.csv",
) {
  const rows = [
    ["Record type", "Record ID", "Status", "Score or progress", "Branch"],
    ...reviews.map((review) => [
      "Review",
      review.id,
      review.status,
      review.overallScore,
      review.branchId,
    ]),
    ...goals.map((goal) => [
      "Goal",
      goal.id,
      goal.status,
      goal.progress,
      goal.branchId,
    ]),
  ];

  const csv = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
