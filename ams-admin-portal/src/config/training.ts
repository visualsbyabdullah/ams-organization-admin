import type {
  TrainingCategory,
  TrainingCourseScope,
  TrainingCourseStatus,
  TrainingDeliveryMode,
  TrainingEnrollmentStatus,
  TrainingSessionStatus,
  TrainingSettingsScope,
  TrainingSettingsStatus,
} from "@/types/training";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

export const TRAINING_REFERENCE_DATE = "2026-07-16";

export const TRAINING_TABS = [
  { label: "Overview", href: "/training" },
  { label: "Courses", href: "/training/courses" },
  { label: "Enrollments", href: "/training/enrollments" },
  { label: "Sessions", href: "/training/sessions" },
  { label: "Settings", href: "/training/settings" },
] as const;

export const TRAINING_COURSE_STATUS_CONFIG: Record<
  TrainingCourseStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "warning",
  },
  published: {
    label: "Published",
    badgeVariant: "success",
  },
  archived: {
    label: "Archived",
    badgeVariant: "neutral",
  },
};

export const TRAINING_COURSE_SCOPE_CONFIG: Record<
  TrainingCourseScope,
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

export const TRAINING_CATEGORY_CONFIG: Record<
  TrainingCategory,
  { label: string; badgeVariant: BadgeVariant }
> = {
  onboarding: {
    label: "Onboarding",
    badgeVariant: "info",
  },
  compliance: {
    label: "Compliance",
    badgeVariant: "danger",
  },
  leadership: {
    label: "Leadership",
    badgeVariant: "warning",
  },
  technical: {
    label: "Technical skills",
    badgeVariant: "success",
  },
  safety: {
    label: "Workplace safety",
    badgeVariant: "danger",
  },
  professional_development: {
    label: "Professional development",
    badgeVariant: "neutral",
  },
};

export const TRAINING_DELIVERY_MODE_CONFIG: Record<
  TrainingDeliveryMode,
  { label: string; badgeVariant: BadgeVariant }
> = {
  onsite: {
    label: "On-site",
    badgeVariant: "warning",
  },
  virtual: {
    label: "Virtual",
    badgeVariant: "info",
  },
  self_paced: {
    label: "Self-paced",
    badgeVariant: "success",
  },
  hybrid: {
    label: "Hybrid",
    badgeVariant: "neutral",
  },
};

export const TRAINING_ENROLLMENT_STATUS_CONFIG: Record<
  TrainingEnrollmentStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  assigned: {
    label: "Assigned",
    badgeVariant: "neutral",
  },
  in_progress: {
    label: "In progress",
    badgeVariant: "info",
  },
  completed: {
    label: "Completed",
    badgeVariant: "success",
  },
  overdue: {
    label: "Overdue",
    badgeVariant: "danger",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "neutral",
  },
};

export const TRAINING_SESSION_STATUS_CONFIG: Record<
  TrainingSessionStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  scheduled: {
    label: "Scheduled",
    badgeVariant: "info",
  },
  in_progress: {
    label: "In progress",
    badgeVariant: "warning",
  },
  completed: {
    label: "Completed",
    badgeVariant: "success",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "neutral",
  },
};

export const TRAINING_SETTINGS_SCOPE_CONFIG: Record<
  TrainingSettingsScope,
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

export const TRAINING_SETTINGS_STATUS_CONFIG: Record<
  TrainingSettingsStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  draft: {
    label: "Draft",
    badgeVariant: "warning",
  },
  archived: {
    label: "Archived",
    badgeVariant: "neutral",
  },
};

export const TRAINING_COPY = {
  eyebrow: "Learning & Development",
  overview: {
    title: "Training overview",
    description:
      "Manage employee learning, mandatory training, course completion and upcoming instructor-led sessions.",
    exportAction: "Export training data",
    createAction: "Add course",
    chartTitle: "Learning activity",
    chartDescription:
      "Assigned, completed and overdue enrollments during the current year.",
    upcomingTitle: "Upcoming sessions",
    upcomingDescription:
      "Next scheduled instructor-led training sessions in the selected scope.",
    registerTitle: "Active enrollments",
    registerDescription: "Employee training currently assigned, underway or overdue.",
    emptyTitle: "No active enrollments",
    emptyDescription: "Assign a published course to begin tracking employee progress.",
  },
  courses: {
    title: "Training courses",
    description:
      "Create and maintain reusable organization-wide and branch-specific learning content.",
    createAction: "Add course",
    exportAction: "Export courses",
    registerTitle: "Course catalogue",
    registerDescription:
      "Published, draft and archived training courses available across the organization.",
    searchPlaceholder: "Search title, code, category, provider or owner",
    allStatuses: "All course statuses",
    allCategories: "All categories",
    allModes: "All delivery modes",
    emptyTitle: "No courses found",
    emptyDescription: "Change the filters or add a new training course.",
    columns: {
      course: "Course",
      category: "Category",
      delivery: "Delivery",
      duration: "Duration",
      passingScore: "Passing score",
      scope: "Scope",
      status: "Status",
      actions: "Actions",
    },
  },
  enrollments: {
    title: "Training enrollments",
    description:
      "Assign courses, monitor employee progress and issue completion records.",
    createAction: "Assign course",
    exportAction: "Export enrollments",
    registerTitle: "Enrollment register",
    registerDescription:
      "Employee learning assignments within the selected organization scope.",
    attentionTitle: "Completion queue",
    attentionDescription:
      "Overdue and near-due training requiring employee or manager follow-up.",
    searchPlaceholder: "Search employee, ID, department, course or certificate",
    allStatuses: "All enrollment statuses",
    allCourses: "All courses",
    emptyTitle: "No enrollments found",
    emptyDescription: "Change the filters or assign a course to an employee.",
    columns: {
      employee: "Employee",
      course: "Course",
      assigned: "Assigned",
      due: "Due date",
      progress: "Progress",
      score: "Score",
      status: "Status",
      actions: "Actions",
    },
  },
  sessions: {
    title: "Training sessions",
    description:
      "Schedule instructor-led training, manage capacity and record attendance.",
    createAction: "Schedule session",
    exportAction: "Export sessions",
    registerTitle: "Session calendar",
    registerDescription: "Upcoming and historical instructor-led training sessions.",
    upcomingTitle: "Next sessions",
    upcomingDescription: "Scheduled sessions ordered by date within the selected scope.",
    searchPlaceholder: "Search course, facilitator, venue or branch",
    allStatuses: "All session statuses",
    allModes: "All delivery modes",
    emptyTitle: "No sessions found",
    emptyDescription: "Change the filters or schedule a new training session.",
    columns: {
      course: "Course",
      date: "Date and time",
      facilitator: "Facilitator",
      venue: "Venue",
      capacity: "Capacity",
      attendance: "Attendance",
      status: "Status",
      actions: "Actions",
    },
  },
  settings: {
    title: "Training settings",
    description:
      "Configure assignment deadlines, reminders, certificates and branch-level learning rules.",
    createAction: "Add settings",
    registerTitle: "Settings register",
    registerDescription:
      "Organization defaults and active branch-specific training overrides.",
    effectiveTitle: "Effective settings",
    effectiveDescription:
      "Training rules currently applied within the selected organization scope.",
    searchPlaceholder: "Search settings name, branch or updated administrator",
    allStatuses: "All settings statuses",
    allScopes: "Organization and branch",
    emptyTitle: "No training settings found",
    emptyDescription: "Change the filters or create a training settings record.",
    columns: {
      settings: "Settings",
      scope: "Scope",
      dueDays: "Default due",
      reminder: "Reminder",
      completionTarget: "Completion target",
      certificates: "Certificates",
      status: "Status",
    },
  },
} as const;
