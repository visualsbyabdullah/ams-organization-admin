export type PerformanceCycleStatus =
  | "draft"
  | "active"
  | "calibration"
  | "completed"
  | "archived";

export type PerformanceCycleScope =
  | "organization"
  | "branch";

export type PerformanceReviewStatus =
  | "not_started"
  | "self_review"
  | "manager_review"
  | "calibration"
  | "completed";

export type PerformanceGoalStatus =
  | "draft"
  | "active"
  | "at_risk"
  | "completed"
  | "cancelled";

export type PerformanceGoalLevel =
  | "individual"
  | "team"
  | "department"
  | "organization";

export type PerformanceReviewFrequency =
  | "monthly"
  | "quarterly"
  | "biannual"
  | "annual";

export type PerformanceSettingsStatus =
  | "active"
  | "draft"
  | "archived";

export type PerformanceSettingsScope =
  | "organization"
  | "branch";

export type PerformanceCycle = {
  id: string;
  name: string;
  scope: PerformanceCycleScope;
  branchId?: string;
  branchName?: string;
  status: PerformanceCycleStatus;
  startDate: string;
  endDate: string;
  selfReviewDueDate: string;
  managerReviewDueDate: string;
  calibrationDate: string;
  participants: number;
  completedReviews: number;
  createdBy: string;
  updatedAt: string;
  note: string;
};

export type PerformanceReview = {
  id: string;
  cycleId: string;
  employeeId: string;
  branchId: string;
  status: PerformanceReviewStatus;
  selfRating?: number;
  managerRating?: number;
  finalRating?: number;
  goalScore: number;
  competencyScore: number;
  overallScore: number;
  managerName: string;
  submittedAt?: string;
  completedAt?: string;
  strengths: string;
  developmentAreas: string;
  managerComments: string;
};

export type PerformanceGoal = {
  id: string;
  title: string;
  description: string;
  employeeId?: string;
  branchId: string;
  department: string;
  level: PerformanceGoalLevel;
  status: PerformanceGoalStatus;
  startDate: string;
  dueDate: string;
  progress: number;
  weight: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  ownerName: string;
  updatedAt: string;
};

export type PerformanceSettings = {
  id: string;
  name: string;
  scope: PerformanceSettingsScope;
  branchId?: string;
  branchName?: string;
  status: PerformanceSettingsStatus;
  reviewFrequency: PerformanceReviewFrequency;
  ratingScaleMaximum: number;
  goalWeight: number;
  competencyWeight: number;
  requireSelfReview: boolean;
  requireManagerReview: boolean;
  requireCalibration: boolean;
  allowPeerFeedback: boolean;
  reminderDaysBeforeDue: number;
  updatedAt: string;
  updatedBy: string;
  note: string;
};
