export type TrainingCourseStatus = "draft" | "published" | "archived";

export type TrainingCourseScope = "organization" | "branch";

export type TrainingCategory =
  | "onboarding"
  | "compliance"
  | "leadership"
  | "technical"
  | "safety"
  | "professional_development";

export type TrainingDeliveryMode = "onsite" | "virtual" | "self_paced" | "hybrid";

export type TrainingEnrollmentStatus =
  "assigned" | "in_progress" | "completed" | "overdue" | "cancelled";

export type TrainingSessionStatus =
  "scheduled" | "in_progress" | "completed" | "cancelled";

export type TrainingSettingsScope = "organization" | "branch";

export type TrainingSettingsStatus = "active" | "draft" | "archived";

export type TrainingCourse = {
  id: string;
  title: string;
  code: string;
  category: TrainingCategory;
  scope: TrainingCourseScope;
  branchId?: string;
  branchName?: string;
  status: TrainingCourseStatus;
  deliveryMode: TrainingDeliveryMode;
  durationHours: number;
  passingScore: number;
  mandatory: boolean;
  certificationValidityMonths: number;
  capacity: number;
  provider: string;
  ownerName: string;
  description: string;
  updatedAt: string;
  note: string;
};

export type TrainingEnrollment = {
  id: string;
  courseId: string;
  employeeId: string;
  branchId: string;
  status: TrainingEnrollmentStatus;
  assignedDate: string;
  dueDate: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  score?: number;
  attempts: number;
  certificateId?: string;
  assignedBy: string;
  note: string;
};

export type TrainingSession = {
  id: string;
  courseId: string;
  branchId: string;
  facilitator: string;
  venue: string;
  deliveryMode: TrainingDeliveryMode;
  sessionDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledCount: number;
  attendanceCount: number;
  status: TrainingSessionStatus;
  note: string;
};

export type TrainingSettings = {
  id: string;
  name: string;
  scope: TrainingSettingsScope;
  branchId?: string;
  branchName?: string;
  status: TrainingSettingsStatus;
  defaultDueDays: number;
  reminderDaysBeforeDue: number;
  allowSelfEnrollment: boolean;
  managerApprovalRequired: boolean;
  autoIssueCertificates: boolean;
  certificationExpiryReminderDays: number;
  mandatoryCompletionTarget: number;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type TrainingTrendPoint = {
  month: string;
  assigned: number;
  completed: number;
  overdue: number;
};
