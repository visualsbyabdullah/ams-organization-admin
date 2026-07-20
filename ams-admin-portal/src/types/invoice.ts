export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "void";

export type InvoiceCategory =
  | "subscription"
  | "services"
  | "implementation"
  | "training"
  | "support"
  | "other";

export type InvoicePaymentMethod =
  | "bank_transfer"
  | "card"
  | "cash"
  | "cheque"
  | "other";

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  branchId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  category: InvoiceCategory;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod?: InvoicePaymentMethod;
  paymentReference?: string;
  paidAt?: string;
  createdBy: string;
  note: string;
};

export type RecurringInvoiceFrequency =
  | "monthly"
  | "quarterly"
  | "biannual"
  | "annual";

export type RecurringInvoiceStatus =
  | "active"
  | "paused"
  | "ended";

export type RecurringInvoice = {
  id: string;
  name: string;
  branchId: string;
  clientName: string;
  clientEmail: string;
  category: InvoiceCategory;
  frequency: RecurringInvoiceFrequency;
  status: RecurringInvoiceStatus;
  startDate: string;
  nextInvoiceDate: string;
  endDate?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  autoSend: boolean;
  createdBy: string;
  note: string;
};

export type InvoiceSettingsScope =
  | "organization"
  | "branch";

export type InvoiceSettingsStatus =
  | "active"
  | "draft"
  | "archived";

export type InvoiceSettings = {
  id: string;
  name: string;
  scope: InvoiceSettingsScope;
  branchId?: string;
  branchName?: string;
  status: InvoiceSettingsStatus;
  invoicePrefix: string;
  nextSequence: number;
  paymentTermDays: number;
  defaultTaxRate: number;
  allowPartialPayments: boolean;
  autoSendInvoices: boolean;
  autoMarkOverdue: boolean;
  sendDueReminders: boolean;
  reminderDaysBeforeDue: number;
  overdueReminderIntervalDays: number;
  updatedAt: string;
  updatedBy: string;
  defaultNote: string;
};

export type InvoiceTrendPoint = {
  month: string;
  billed: number;
  collected: number;
  outstanding: number;
};

export type InvoicePaymentValues = {
  amount: number;
  paymentDate: string;
  paymentMethod: InvoicePaymentMethod;
  paymentReference: string;
};