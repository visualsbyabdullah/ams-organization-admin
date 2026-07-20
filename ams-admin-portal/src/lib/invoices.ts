import { RECURRING_INVOICE_FREQUENCY_CONFIG } from "@/config/invoices";
import type {
  Invoice,
  InvoiceLineItem,
  InvoiceSettings,
  InvoiceStatus,
  InvoiceTrendPoint,
  RecurringInvoiceFrequency,
} from "@/types/invoice";

export function calculateInvoiceTotals(
  lineItems: readonly InvoiceLineItem[],
  taxRate: number,
  discountAmount: number,
) {
  const subtotal = lineItems.reduce(
    (total, item) => total + Math.max(item.quantity, 0) * Math.max(item.unitPrice, 0),
    0,
  );

  const safeDiscount = Math.min(Math.max(discountAmount, 0), subtotal);

  const taxableAmount = Math.max(subtotal - safeDiscount, 0);

  const taxAmount = Math.round(taxableAmount * (Math.max(taxRate, 0) / 100));

  return {
    subtotal,
    taxAmount,
    discountAmount: safeDiscount,
    totalAmount: taxableAmount + taxAmount,
  };
}

export function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

export function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T00:00:00`);

  date.setMonth(date.getMonth() + months);

  return date.toISOString().slice(0, 10);
}

export function buildInvoiceNumber(prefix: string, sequence: number) {
  return `${prefix}-${String(sequence).padStart(5, "0")}`;
}

export function resolveInvoiceStatus(
  invoice: Pick<Invoice, "status" | "dueDate" | "paidAmount" | "totalAmount">,
  referenceDate: string,
): InvoiceStatus {
  if (invoice.status === "void" || invoice.status === "draft") {
    return invoice.status;
  }

  if (invoice.totalAmount > 0 && invoice.paidAmount >= invoice.totalAmount) {
    return "paid";
  }

  if (invoice.dueDate < referenceDate) {
    return "overdue";
  }

  if (invoice.paidAmount > 0) {
    return "partially_paid";
  }

  return "sent";
}

export function getEffectiveInvoiceSettings(
  settings: readonly InvoiceSettings[],
  branchId: string,
) {
  const organizationDefault =
    settings.find((item) => item.scope === "organization" && item.status === "active") ??
    null;

  const branchOverride =
    branchId === "all"
      ? null
      : (settings.find(
          (item) =>
            item.scope === "branch" &&
            item.branchId === branchId &&
            item.status === "active",
        ) ?? null);

  return branchOverride ?? organizationDefault;
}

export function isInvoiceDueSoon(dueDate: string, referenceDate: string, days = 7) {
  return dueDate >= referenceDate && dueDate <= addDays(referenceDate, days);
}

export function buildInvoiceTrend(
  invoices: readonly Invoice[],
  year: number,
): InvoiceTrendPoint[] {
  const formatter = new Intl.DateTimeFormat("en-GB", { month: "short" });

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthInvoices = invoices.filter((invoice) => {
      const date = new Date(`${invoice.issueDate}T00:00:00`);

      return (
        date.getFullYear() === year &&
        date.getMonth() === monthIndex &&
        invoice.status !== "void"
      );
    });

    const billed = monthInvoices.reduce(
      (total, invoice) => total + invoice.totalAmount,
      0,
    );

    const collected = monthInvoices.reduce(
      (total, invoice) => total + invoice.paidAmount,
      0,
    );

    return {
      month: formatter.format(new Date(year, monthIndex, 1)),
      billed,
      collected,
      outstanding: Math.max(billed - collected, 0),
    };
  });
}

export function getMonthlyEquivalent(
  amount: number,
  frequency: RecurringInvoiceFrequency,
) {
  const months = RECURRING_INVOICE_FREQUENCY_CONFIG[frequency].months;

  return months > 0 ? amount / months : amount;
}

function escapeCsvValue(value: unknown) {
  const stringValue = String(value ?? "");

  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function exportInvoicesToCsv(
  invoices: readonly Invoice[],
  filename = "invoices.csv",
) {
  const headers = [
    "Invoice number",
    "Client",
    "Branch",
    "Category",
    "Issue date",
    "Due date",
    "Status",
    "Subtotal",
    "Tax",
    "Discount",
    "Total",
    "Paid",
    "Balance",
  ];

  const rows = invoices.map((invoice) => [
    invoice.invoiceNumber,
    invoice.clientName,
    invoice.branchId,
    invoice.category,
    invoice.issueDate,
    invoice.dueDate,
    invoice.status,
    invoice.subtotal,
    invoice.taxAmount,
    invoice.discountAmount,
    invoice.totalAmount,
    invoice.paidAmount,
    invoice.balanceAmount,
  ]);

  const csv = [headers, ...rows]
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
