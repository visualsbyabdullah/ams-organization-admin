import type {
  InvoiceCategory,
  InvoicePaymentMethod,
  InvoiceSettingsScope,
  InvoiceSettingsStatus,
  InvoiceStatus,
  RecurringInvoiceFrequency,
  RecurringInvoiceStatus,
} from "@/types/invoice";

export const INVOICE_REFERENCE_DATE = "2026-07-16";

export const INVOICE_TABS = [
  {
    label: "Overview",
    href: "/invoices",
  },
  {
    label: "All invoices",
    href: "/invoices/all",
  },
  {
    label: "Recurring",
    href: "/invoices/recurring",
  },
  {
    label: "Settings",
    href: "/invoices/settings",
  },
] as const;

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "success" | "danger";
  }
> = {
  draft: {
    label: "Draft",
    badgeVariant: "neutral",
  },
  sent: {
    label: "Sent",
    badgeVariant: "info",
  },
  partially_paid: {
    label: "Partially paid",
    badgeVariant: "warning",
  },
  paid: {
    label: "Paid",
    badgeVariant: "success",
  },
  overdue: {
    label: "Overdue",
    badgeVariant: "danger",
  },
  void: {
    label: "Void",
    badgeVariant: "neutral",
  },
};

export const INVOICE_CATEGORY_CONFIG: Record<
  InvoiceCategory,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "success" | "danger";
  }
> = {
  subscription: {
    label: "Subscription",
    badgeVariant: "info",
  },
  services: {
    label: "Professional services",
    badgeVariant: "success",
  },
  implementation: {
    label: "Implementation",
    badgeVariant: "warning",
  },
  training: {
    label: "Training",
    badgeVariant: "neutral",
  },
  support: {
    label: "Support",
    badgeVariant: "danger",
  },
  other: {
    label: "Other",
    badgeVariant: "neutral",
  },
};

export const INVOICE_PAYMENT_METHOD_CONFIG: Record<
  InvoicePaymentMethod,
  {
    label: string;
    badgeVariant: "neutral" | "info" | "warning" | "success";
  }
> = {
  bank_transfer: {
    label: "Bank transfer",
    badgeVariant: "info",
  },
  card: {
    label: "Card payment",
    badgeVariant: "success",
  },
  cash: {
    label: "Cash",
    badgeVariant: "warning",
  },
  cheque: {
    label: "Cheque",
    badgeVariant: "neutral",
  },
  other: {
    label: "Other",
    badgeVariant: "neutral",
  },
};

export const RECURRING_INVOICE_FREQUENCY_CONFIG: Record<
  RecurringInvoiceFrequency,
  {
    label: string;
    months: number;
  }
> = {
  monthly: {
    label: "Monthly",
    months: 1,
  },
  quarterly: {
    label: "Quarterly",
    months: 3,
  },
  biannual: {
    label: "Every six months",
    months: 6,
  },
  annual: {
    label: "Annual",
    months: 12,
  },
};

export const RECURRING_INVOICE_STATUS_CONFIG: Record<
  RecurringInvoiceStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  paused: {
    label: "Paused",
    badgeVariant: "warning",
  },
  ended: {
    label: "Ended",
    badgeVariant: "neutral",
  },
};

export const INVOICE_SETTINGS_SCOPE_CONFIG: Record<
  InvoiceSettingsScope,
  {
    label: string;
    badgeVariant: "info" | "neutral";
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

export const INVOICE_SETTINGS_STATUS_CONFIG: Record<
  InvoiceSettingsStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
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

export const INVOICE_COPY = {
  common: {
    eyebrow: "Billing & Revenue",
    createAction: "Create invoice",
    exportAction: "Export invoices",
    searchPlaceholder: "Search invoice, client, email, category or reference",
    allStatuses: "All invoice statuses",
    allCategories: "All categories",
    emptyTitle: "No invoices found",
    emptyDescription: "Change the filters or create a new client invoice.",
  },
  overview: {
    title: "Invoices",
    description:
      "Monitor billing, collections, outstanding balances and overdue client invoices across the organization.",
    chartTitle: "Billing and collection trend",
    chartDescription:
      "Monthly invoiced, collected and outstanding revenue for the selected scope.",
    attentionTitle: "Collection attention",
    attentionDescription: "Overdue and near-due invoices requiring finance follow-up.",
    recentTitle: "Recent invoices",
    recentDescription:
      "Latest client billing activity within the selected organization scope.",
  },
  register: {
    title: "All invoices",
    description:
      "Review, send, collect and maintain client invoices across every branch.",
    registerTitle: "Invoice register",
    registerDescription: "Complete invoice history for the selected organization scope.",
  },
  recurring: {
    title: "Recurring invoices",
    description:
      "Automate repeat billing schedules for subscriptions, retainers and ongoing client services.",
    createAction: "Add recurring invoice",
    registerTitle: "Recurring billing register",
    registerDescription: "Active, paused and completed recurring invoice schedules.",
    allStatuses: "All recurring statuses",
    allFrequencies: "All billing frequencies",
    emptyTitle: "No recurring invoices found",
    emptyDescription: "Change the filters or add a recurring billing schedule.",
  },
  settings: {
    title: "Invoice settings",
    description:
      "Configure invoice numbering, payment terms, tax defaults and collection automation by organization or branch.",
    createAction: "Add settings",
    registerTitle: "Invoice settings register",
    registerDescription: "Organization defaults and branch-specific billing controls.",
    effectiveTitle: "Effective invoice settings",
    effectiveDescription:
      "Billing rules currently applied within the selected organization scope.",
    searchPlaceholder: "Search settings, branch, prefix or payment terms",
    allScopes: "Organization and branch",
    allStatuses: "All settings statuses",
    emptyTitle: "No invoice settings found",
    emptyDescription: "Change the filters or create a billing settings profile.",
  },
  actions: {
    send: "Send invoice",
    recordPayment: "Record payment",
    markVoid: "Void invoice",
    reopen: "Reopen invoice",
    duplicate: "Duplicate",
    edit: "Edit",
    pause: "Pause",
    resume: "Resume",
    end: "End schedule",
    archive: "Archive",
    activate: "Activate",
  },
} as const;
