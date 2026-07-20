import type { MouseEvent } from "react";

import {
  Building2,
  Globe2,
  MoreHorizontal,
} from "lucide-react";

import type {
  DataTableColumn,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  INVOICE_CATEGORY_CONFIG,
  INVOICE_SETTINGS_SCOPE_CONFIG,
  INVOICE_SETTINGS_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  RECURRING_INVOICE_FREQUENCY_CONFIG,
  RECURRING_INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { BRANCH_OPTIONS } from "@/data/branches";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  Invoice,
  InvoiceSettings,
  RecurringInvoice,
} from "@/types/invoice";

function getBranchName(branchId?: string) {
  return (
    BRANCH_OPTIONS.find(
      (branch) => branch.id === branchId,
    )?.name ?? "Organization"
  );
}

type InvoiceColumnOptions = {
  onOpen: (invoice: Invoice) => void;
  compact?: boolean;
};

export function createInvoiceColumns({
  onOpen,
  compact = false,
}: InvoiceColumnOptions): DataTableColumn<Invoice>[] {
  const columns: DataTableColumn<Invoice>[] = [
    {
      id: "invoice",
      header: "Invoice",
      cell: (invoice) => (
        <div>
          <p className="font-semibold">
            {invoice.invoiceNumber}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {getBranchName(invoice.branchId)}
          </p>
        </div>
      ),
    },
    {
      id: "client",
      header: "Client",
      cell: (invoice) => (
        <div>
          <p className="font-semibold">
            {invoice.clientName}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {invoice.clientEmail}
          </p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (invoice) => (
        <Badge
          variant={
            INVOICE_CATEGORY_CONFIG[
              invoice.category
            ].badgeVariant
          }
        >
          {
            INVOICE_CATEGORY_CONFIG[
              invoice.category
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (invoice) => (
        <strong>
          {formatPKR(invoice.totalAmount)}
        </strong>
      ),
    },
    {
      id: "balance",
      header: "Balance",
      cell: (invoice) =>
        formatPKR(invoice.balanceAmount),
    },
    {
      id: "dueDate",
      header: "Due date",
      cell: (invoice) =>
        formatDate(invoice.dueDate),
    },
    {
      id: "status",
      header: "Status",
      cell: (invoice) => (
        <Badge
          variant={
            INVOICE_STATUS_CONFIG[
              invoice.status
            ].badgeVariant
          }
        >
          {
            INVOICE_STATUS_CONFIG[
              invoice.status
            ].label
          }
        </Badge>
      ),
    },
  ];

  if (!compact) {
    columns.splice(4, 0, {
      id: "paid",
      header: "Paid",
      cell: (invoice) =>
        formatPKR(invoice.paidAmount),
    });

    columns.splice(5, 0, {
      id: "issueDate",
      header: "Issued",
      cell: (invoice) =>
        formatDate(invoice.issueDate),
    });
  }

  columns.push({
    id: "actions",
    header: "Actions",
    headClassName: "w-16",
    className: "w-16",
    cell: (invoice) => (
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Open ${invoice.invoiceNumber}`}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onOpen(invoice);
        }}
      >
        <MoreHorizontal />
      </Button>
    ),
  });

  return columns;
}

type RecurringColumnOptions = {
  onOpen: (invoice: RecurringInvoice) => void;
};

export function createRecurringInvoiceColumns({
  onOpen,
}: RecurringColumnOptions): DataTableColumn<RecurringInvoice>[] {
  return [
    {
      id: "schedule",
      header: "Schedule",
      cell: (invoice) => (
        <div>
          <p className="font-semibold">
            {invoice.name}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {getBranchName(invoice.branchId)}
          </p>
        </div>
      ),
    },
    {
      id: "client",
      header: "Client",
      cell: (invoice) => (
        <div>
          <p className="font-semibold">
            {invoice.clientName}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {invoice.clientEmail}
          </p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (invoice) => (
        <Badge
          variant={
            INVOICE_CATEGORY_CONFIG[
              invoice.category
            ].badgeVariant
          }
        >
          {
            INVOICE_CATEGORY_CONFIG[
              invoice.category
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "frequency",
      header: "Frequency",
      cell: (invoice) =>
        RECURRING_INVOICE_FREQUENCY_CONFIG[
          invoice.frequency
        ].label,
    },
    {
      id: "amount",
      header: "Invoice amount",
      cell: (invoice) => (
        <strong>
          {formatPKR(invoice.totalAmount)}
        </strong>
      ),
    },
    {
      id: "nextInvoiceDate",
      header: "Next invoice",
      cell: (invoice) =>
        formatDate(invoice.nextInvoiceDate),
    },
    {
      id: "autoSend",
      header: "Delivery",
      cell: (invoice) => (
        <Badge
          variant={
            invoice.autoSend
              ? "success"
              : "neutral"
          }
        >
          {invoice.autoSend
            ? "Automatic"
            : "Manual review"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (invoice) => (
        <Badge
          variant={
            RECURRING_INVOICE_STATUS_CONFIG[
              invoice.status
            ].badgeVariant
          }
        >
          {
            RECURRING_INVOICE_STATUS_CONFIG[
              invoice.status
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      className: "w-16",
      cell: (invoice) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${invoice.name}`}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onOpen(invoice);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}

type SettingsColumnOptions = {
  onOpen: (settings: InvoiceSettings) => void;
};

export function createInvoiceSettingsColumns({
  onOpen,
}: SettingsColumnOptions): DataTableColumn<InvoiceSettings>[] {
  return [
    {
      id: "settings",
      header: "Settings",
      cell: (settings) => (
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
            {settings.scope ===
            "organization" ? (
              <Globe2 size={18} />
            ) : (
              <Building2 size={18} />
            )}
          </span>

          <div>
            <p className="font-semibold">
              {settings.name}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              {settings.branchName ??
                "All organization branches"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (settings) => (
        <Badge
          variant={
            INVOICE_SETTINGS_SCOPE_CONFIG[
              settings.scope
            ].badgeVariant
          }
        >
          {
            INVOICE_SETTINGS_SCOPE_CONFIG[
              settings.scope
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "prefix",
      header: "Prefix",
      cell: (settings) => (
        <strong>{settings.invoicePrefix}</strong>
      ),
    },
    {
      id: "sequence",
      header: "Next sequence",
      cell: (settings) =>
        String(settings.nextSequence),
    },
    {
      id: "terms",
      header: "Payment terms",
      cell: (settings) =>
        `${settings.paymentTermDays} days`,
    },
    {
      id: "tax",
      header: "Default tax",
      cell: (settings) =>
        `${settings.defaultTaxRate}%`,
    },
    {
      id: "status",
      header: "Status",
      cell: (settings) => (
        <Badge
          variant={
            INVOICE_SETTINGS_STATUS_CONFIG[
              settings.status
            ].badgeVariant
          }
        >
          {
            INVOICE_SETTINGS_STATUS_CONFIG[
              settings.status
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      className: "w-16",
      cell: (settings) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${settings.name}`}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onOpen(settings);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}