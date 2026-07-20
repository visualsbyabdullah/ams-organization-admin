import type {
  SupportArticleStatus,
  SupportArticleVisibility,
  SupportCategoryStatus,
  SupportScope,
  SupportSettingsStatus,
  SupportSlaState,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support";

export const SUPPORT_REFERENCE_DATETIME = "2026-07-17T11:00:00+05:00";

export const SUPPORT_TABS = [
  { label: "Overview", href: "/support" },
  { label: "Tickets", href: "/support/tickets" },
  { label: "Categories", href: "/support/categories" },
  { label: "Knowledge Base", href: "/support/knowledge-base" },
  { label: "Settings", href: "/support/settings" },
] as const;

export const SUPPORT_TICKET_STATUS_CONFIG: Record<
  SupportTicketStatus,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "success";
  }
> = {
  open: { label: "Open", badgeVariant: "warning" },
  in_progress: { label: "In progress", badgeVariant: "info" },
  waiting_requester: {
    label: "Waiting for requester",
    badgeVariant: "neutral",
  },
  resolved: { label: "Resolved", badgeVariant: "success" },
  closed: { label: "Closed", badgeVariant: "neutral" },
};

export const SUPPORT_PRIORITY_CONFIG: Record<
  SupportTicketPriority,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "danger";
  }
> = {
  low: { label: "Low", badgeVariant: "neutral" },
  medium: { label: "Medium", badgeVariant: "info" },
  high: { label: "High", badgeVariant: "warning" },
  urgent: { label: "Urgent", badgeVariant: "danger" },
};

export const SUPPORT_CHANNEL_CONFIG: Record<
  SupportTicketChannel,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning";
  }
> = {
  portal: { label: "Employee portal", badgeVariant: "info" },
  email: { label: "Email", badgeVariant: "neutral" },
  phone: { label: "Phone", badgeVariant: "warning" },
  walk_in: { label: "Walk-in", badgeVariant: "neutral" },
};

export const SUPPORT_SLA_CONFIG: Record<
  SupportSlaState,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "danger" | "success";
  }
> = {
  on_track: { label: "On track", badgeVariant: "info" },
  at_risk: { label: "At risk", badgeVariant: "warning" },
  overdue: { label: "Overdue", badgeVariant: "danger" },
  met: { label: "SLA met", badgeVariant: "success" },
  missed: { label: "SLA missed", badgeVariant: "danger" },
};

export const SUPPORT_SCOPE_CONFIG: Record<
  SupportScope,
  {
    label: string;
    badgeVariant: "info" | "neutral";
  }
> = {
  organization: { label: "Organization default", badgeVariant: "info" },
  branch: { label: "Branch override", badgeVariant: "neutral" },
};

export const SUPPORT_CATEGORY_STATUS_CONFIG: Record<
  SupportCategoryStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  active: { label: "Active", badgeVariant: "success" },
  inactive: { label: "Inactive", badgeVariant: "warning" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const SUPPORT_ARTICLE_STATUS_CONFIG: Record<
  SupportArticleStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  draft: { label: "Draft", badgeVariant: "warning" },
  published: { label: "Published", badgeVariant: "success" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const SUPPORT_ARTICLE_VISIBILITY_CONFIG: Record<
  SupportArticleVisibility,
  {
    label: string;
    badgeVariant: "info" | "warning" | "neutral";
  }
> = {
  employees: { label: "All employees", badgeVariant: "info" },
  managers: { label: "Managers", badgeVariant: "warning" },
  administrators: { label: "Administrators", badgeVariant: "neutral" },
};

export const SUPPORT_SETTINGS_STATUS_CONFIG: Record<
  SupportSettingsStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  active: { label: "Active", badgeVariant: "success" },
  draft: { label: "Draft", badgeVariant: "warning" },
  archived: { label: "Archived", badgeVariant: "neutral" },
};

export const SUPPORT_COPY = {
  overview: {
    eyebrow: "Employee Support",
    title: "Support operations",
    description:
      "Monitor employee requests, service levels, escalations and knowledge coverage across the organization.",
    createAction: "New support ticket",
    exportAction: "Export tickets",
    chartTitle: "Support volume",
    chartDescription:
      "Created and resolved employee support tickets during the current year.",
    queueTitle: "Requires attention",
    queueDescription: "Urgent, overdue and SLA-risk tickets requiring support action.",
    tableTitle: "Recent support tickets",
    tableDescription: "Latest employee requests within the selected organization scope.",
  },
  tickets: {
    eyebrow: "Employee Support",
    title: "Support tickets",
    description:
      "Manage employee requests from initial intake through assignment, resolution and closure.",
    createAction: "New support ticket",
    exportAction: "Export tickets",
    registerTitle: "Ticket register",
    registerDescription:
      "Search and manage employee support requests across the selected scope.",
    searchPlaceholder: "Search ticket, employee, category, assignee or description",
    allStatuses: "All ticket statuses",
    allPriorities: "All priorities",
    allCategories: "All categories",
    allSlaStates: "All SLA states",
    emptyTitle: "No support tickets found",
    emptyDescription: "Change the selected filters or create a new support ticket.",
  },
  categories: {
    eyebrow: "Employee Support",
    title: "Support categories",
    description:
      "Configure request routing, default priority and service-level targets for employee support.",
    createAction: "Add category",
    registerTitle: "Category register",
    registerDescription: "Organization categories and branch-specific routing overrides.",
    searchPlaceholder: "Search category, code, assignee or description",
    allStatuses: "All category statuses",
    allScopes: "Organization and branch",
    emptyTitle: "No support categories found",
    emptyDescription: "Change the filters or add a support category.",
  },
  knowledge: {
    eyebrow: "Employee Support",
    title: "Knowledge base",
    description:
      "Publish reusable guidance that helps employees resolve common questions before opening tickets.",
    createAction: "Add article",
    registerTitle: "Knowledge article register",
    registerDescription: "Draft, published and archived employee support guidance.",
    searchPlaceholder: "Search title, summary, tag, category or author",
    allStatuses: "All article statuses",
    allVisibility: "All visibility levels",
    emptyTitle: "No knowledge articles found",
    emptyDescription: "Change the filters or add a knowledge article.",
  },
  settings: {
    eyebrow: "Employee Support",
    title: "Support settings",
    description:
      "Configure service levels, employee access, escalation and branch-specific support workflows.",
    createAction: "Add settings",
    registerTitle: "Support settings register",
    registerDescription: "Organization defaults and branch-specific support overrides.",
    effectiveTitle: "Effective support settings",
    effectiveDescription:
      "Rules currently applied within the selected organization scope.",
    searchPlaceholder: "Search settings, branch or default assignee",
    allStatuses: "All settings statuses",
    allScopes: "Organization and branch",
    emptyTitle: "No support settings found",
    emptyDescription: "Change the filters or add support settings.",
  },
} as const;

export const SUPPORT_ACTION_LABELS = {
  assignToMe: "Assign to me",
  startProgress: "Start progress",
  waitForRequester: "Wait for requester",
  resume: "Resume ticket",
  resolve: "Resolve ticket",
  close: "Close ticket",
  reopen: "Reopen ticket",
  edit: "Edit",
  duplicate: "Duplicate",
  activate: "Activate",
  deactivate: "Deactivate",
  archive: "Archive",
  publish: "Publish",
  unpublish: "Move to draft",
  cancel: "Cancel",
} as const;

export const SUPPORT_SETTINGS_CONTROLS = [
  { key: "employeePortalEnabled", label: "Employee support portal" },
  { key: "knowledgeBaseEnabled", label: "Knowledge base" },
  { key: "satisfactionSurveyEnabled", label: "Satisfaction surveys" },
  { key: "allowTicketReopen", label: "Ticket reopening" },
  { key: "attachmentsEnabled", label: "Ticket attachments" },
  { key: "escalationEnabled", label: "SLA escalation" },
] as const;
