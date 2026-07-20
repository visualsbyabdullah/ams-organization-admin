import type {
  DocumentCategory,
  DocumentOwnerType,
  DocumentRequestStatus,
  DocumentSettingsScope,
  DocumentSettingsStatus,
  DocumentStatus,
  DocumentTemplateOutput,
  DocumentTemplateScope,
  DocumentTemplateStatus,
  DocumentVisibility,
} from "@/types/document";

type BadgeVariant = "neutral" | "info" | "warning" | "success" | "danger";

export const DOCUMENT_REFERENCE_DATE = "2026-07-16";

export const DOCUMENT_NUMBER_PREFIX = "DOC";

export const DOCUMENT_DEFAULT_REJECTION_REASON =
  "Verification was rejected by the organization administrator.";

export const DOCUMENT_TABS = [
  {
    label: "Overview",
    href: "/documents",
  },
  {
    label: "Library",
    href: "/documents/library",
  },
  {
    label: "Requests",
    href: "/documents/requests",
  },
  {
    label: "Templates",
    href: "/documents/templates",
  },
  {
    label: "Settings",
    href: "/documents/settings",
  },
] as const;

export const DOCUMENT_STATUS_CONFIG: Record<
  DocumentStatus,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  pending_verification: {
    label: "Pending verification",
    badgeVariant: "warning",
  },
  verified: {
    label: "Verified",
    badgeVariant: "success",
  },
  rejected: {
    label: "Rejected",
    badgeVariant: "danger",
  },
  expiring: {
    label: "Expiring soon",
    badgeVariant: "warning",
  },
  expired: {
    label: "Expired",
    badgeVariant: "danger",
  },
  archived: {
    label: "Archived",
    badgeVariant: "neutral",
  },
};

export const DOCUMENT_CATEGORY_CONFIG: Record<
  DocumentCategory,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
> = {
  identity: {
    label: "Identity",
    badgeVariant: "info",
  },
  employment: {
    label: "Employment",
    badgeVariant: "success",
  },
  payroll: {
    label: "Payroll",
    badgeVariant: "warning",
  },
  compliance: {
    label: "Compliance",
    badgeVariant: "danger",
  },
  legal: {
    label: "Legal",
    badgeVariant: "neutral",
  },
  finance: {
    label: "Finance",
    badgeVariant: "info",
  },
  policy: {
    label: "Policy",
    badgeVariant: "neutral",
  },
  certificate: {
    label: "Certificate",
    badgeVariant: "success",
  },
  other: {
    label: "Other",
    badgeVariant: "neutral",
  },
};

export const DOCUMENT_OWNER_TYPE_CONFIG: Record<
  DocumentOwnerType,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
> = {
  employee: {
    label: "Employee",
    badgeVariant: "info",
  },
  branch: {
    label: "Branch",
    badgeVariant: "warning",
  },
  organization: {
    label: "Organization",
    badgeVariant: "success",
  },
};

export const DOCUMENT_VISIBILITY_CONFIG: Record<
  DocumentVisibility,
  {
    label: string;
    description: string;
  }
> = {
  private: {
    label: "Administrators only",
    description: "Visible only to authorized organization administrators.",
  },
  employee: {
    label: "Employee and administrators",
    description: "Visible to the document owner and authorized administrators.",
  },
  managers: {
    label: "Employee, managers and administrators",
    description: "Visible to the employee, reporting managers and administrators.",
  },
  organization: {
    label: "Organization-wide",
    description: "Visible to all employees within the applicable organization scope.",
  },
};

export const DOCUMENT_REQUEST_STATUS_CONFIG: Record<
  DocumentRequestStatus,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
> = {
  open: {
    label: "Open",
    badgeVariant: "warning",
  },
  submitted: {
    label: "Submitted",
    badgeVariant: "info",
  },
  fulfilled: {
    label: "Fulfilled",
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

export const DOCUMENT_TEMPLATE_STATUS_CONFIG: Record<
  DocumentTemplateStatus,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
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

export const DOCUMENT_TEMPLATE_SCOPE_CONFIG: Record<
  DocumentTemplateScope,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
> = {
  organization: {
    label: "Organization template",
    badgeVariant: "info",
  },
  branch: {
    label: "Branch template",
    badgeVariant: "neutral",
  },
};

export const DOCUMENT_TEMPLATE_OUTPUT_CONFIG: Record<
  DocumentTemplateOutput,
  {
    label: string;
  }
> = {
  pdf: {
    label: "PDF document",
  },
  docx: {
    label: "Word document",
  },
};

export const DOCUMENT_SETTINGS_STATUS_CONFIG: Record<
  DocumentSettingsStatus,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
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

export const DOCUMENT_SETTINGS_SCOPE_CONFIG: Record<
  DocumentSettingsScope,
  {
    label: string;
    badgeVariant: BadgeVariant;
  }
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

export const DOCUMENT_COLUMN_LABELS = {
  document: "Document",
  owner: "Owner",
  category: "Category",
  visibility: "Visibility",
  uploaded: "Uploaded",
  expiry: "Expiry",
  version: "Version",
  status: "Status",
  actions: "Actions",
  request: "Request",
  employee: "Employee",
  dueDate: "Due date",
  mandatory: "Required",
  template: "Template",
  scope: "Scope",
  output: "Output",
  controls: "Controls",
  updated: "Updated",
  settings: "Settings",
  reminders: "Expiry reminders",
  uploadLimit: "Upload limit",
} as const;

export const DOCUMENT_ACTION_LABELS = {
  upload: "Upload document",
  export: "Export register",
  verify: "Verify document",
  reject: "Reject document",
  archive: "Archive",
  restore: "Restore",
  createRequest: "New request",
  markSubmitted: "Mark submitted",
  fulfill: "Fulfill request",
  cancel: "Cancel request",
  reopen: "Reopen request",
  createTemplate: "Add template",
  editTemplate: "Edit template",
  duplicate: "Duplicate",
  publish: "Publish",
  createSettings: "Add settings",
  editSettings: "Edit settings",
  activate: "Activate",
} as const;

export const DOCUMENT_SETTINGS_CONTROL_LABELS = {
  employeeUploadsAllowed: "Employee uploads",
  managerUploadsAllowed: "Manager uploads",
  verificationRequired: "Verification required",
  versionHistoryEnabled: "Version history",
  electronicSignatureRequired: "Electronic signatures",
  selfServiceDownloadsAllowed: "Self-service downloads",
} as const;

export const DOCUMENTS_COPY = {
  eyebrow: "People Operations",
  overview: {
    title: "Documents",
    description:
      "Manage employee, branch and organization documents, verification, expiry and document requests.",
    chartTitle: "Document activity",
    chartDescription: "Uploaded, verified and expired documents during the current year.",
    attentionTitle: "Requires attention",
    attentionDescription:
      "Documents awaiting verification or approaching an expiry deadline.",
    recentTitle: "Recent documents",
    recentDescription: "Latest documents within the selected organization scope.",
    emptyTitle: "No documents found",
    emptyDescription: "Upload a document or select another branch scope.",
  },
  library: {
    title: "Document library",
    description:
      "Search, verify and manage employee, branch and organization document records.",
    registerTitle: "Document register",
    registerDescription: "Central document index for the selected organization scope.",
    searchPlaceholder: "Search title, document number, file, employee, branch or tag",
    allStatuses: "All document statuses",
    allCategories: "All document categories",
    allOwners: "All owners",
    emptyTitle: "No documents match the filters",
    emptyDescription: "Change the filters or upload a new document.",
  },
  requests: {
    title: "Document requests",
    description:
      "Request missing employee documents, track submissions and close verification requirements.",
    registerTitle: "Request register",
    registerDescription: "Open and historical employee document requests.",
    queueTitle: "Submission queue",
    queueDescription: "Open, overdue and submitted requests requiring follow-up.",
    searchPlaceholder: "Search employee, request, category or note",
    allStatuses: "All request statuses",
    allCategories: "All request categories",
    emptyTitle: "No document requests found",
    emptyDescription: "Change the filters or create a new employee document request.",
  },
  templates: {
    title: "Document templates",
    description:
      "Manage reusable HR letters, certificates, agreements and policy document templates.",
    registerTitle: "Template library",
    registerDescription: "Organization defaults and branch-specific document templates.",
    coverageTitle: "Template coverage",
    coverageDescription:
      "Published templates available within the selected organization scope.",
    searchPlaceholder: "Search template, code, category, branch or variable",
    allStatuses: "All template statuses",
    allCategories: "All template categories",
    allScopes: "Organization and branch",
    emptyTitle: "No document templates found",
    emptyDescription: "Change the filters or add a reusable document template.",
  },
  settings: {
    title: "Document settings",
    description:
      "Configure storage limits, verification, retention, visibility and branch-level document controls.",
    registerTitle: "Document settings register",
    registerDescription:
      "Organization defaults and branch overrides for document management.",
    effectiveTitle: "Effective settings",
    effectiveDescription:
      "Controls currently applied within the selected organization scope.",
    searchPlaceholder: "Search settings, branch or file extension",
    allStatuses: "All settings statuses",
    allScopes: "Organization and branch",
    emptyTitle: "No document settings found",
    emptyDescription: "Change the filters or create document settings.",
  },
} as const;
