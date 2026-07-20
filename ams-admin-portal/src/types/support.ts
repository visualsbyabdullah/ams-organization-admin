export type SupportTicketStatus =
  "open" | "in_progress" | "waiting_requester" | "resolved" | "closed";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketChannel = "portal" | "email" | "phone" | "walk_in";

export type SupportSlaState =
  "on_track" | "at_risk" | "overdue" | "met" | "missed";

export type SupportScope = "organization" | "branch";

export type SupportCategoryStatus = "active" | "inactive" | "archived";

export type SupportArticleStatus = "draft" | "published" | "archived";

export type SupportArticleVisibility =
  "employees" | "managers" | "administrators";

export type SupportSettingsStatus = "active" | "draft" | "archived";

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  employeeId: string;
  branchId: string;
  categoryId: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  channel: SupportTicketChannel;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  firstRespondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  satisfactionRating?: number;
  tags: string[];
  internalNote: string;
};

export type SupportCategory = {
  id: string;
  name: string;
  code: string;
  description: string;
  scope: SupportScope;
  branchId?: string;
  branchName?: string;
  status: SupportCategoryStatus;
  defaultPriority: SupportTicketPriority;
  defaultAssignee?: string;
  firstResponseHours: number;
  resolutionHours: number;
  employeeVisible: boolean;
  allowAttachments: boolean;
  updatedAt: string;
  updatedBy: string;
};

export type SupportArticle = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  scope: SupportScope;
  branchId?: string;
  branchName?: string;
  status: SupportArticleStatus;
  visibility: SupportArticleVisibility;
  summary: string;
  content: string;
  tags: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  publishedAt?: string;
  updatedAt: string;
  updatedBy: string;
};

export type SupportSettings = {
  id: string;
  name: string;
  scope: SupportScope;
  branchId?: string;
  branchName?: string;
  status: SupportSettingsStatus;
  defaultPriority: SupportTicketPriority;
  defaultAssignee?: string;
  firstResponseHours: number;
  resolutionHours: number;
  escalationEnabled: boolean;
  escalationAfterHours: number;
  employeePortalEnabled: boolean;
  knowledgeBaseEnabled: boolean;
  satisfactionSurveyEnabled: boolean;
  allowTicketReopen: boolean;
  autoCloseResolvedDays: number;
  attachmentsEnabled: boolean;
  maximumAttachmentMb: number;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

export type SupportVolumePoint = {
  month: string;
  created: number;
  resolved: number;
};
