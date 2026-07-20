import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  INVOICE_CATEGORY_CONFIG,
  INVOICE_PAYMENT_METHOD_CONFIG,
  INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { BRANCH_OPTIONS } from "@/data/branches";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { Invoice } from "@/types/invoice";

type InvoiceDetailsProps = {
  invoice: Invoice;
};

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  const branchName =
    BRANCH_OPTIONS.find((branch) => branch.id === invoice.branchId)?.name ??
    invoice.branchId;

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{invoice.invoiceNumber}</h3>

            <p className="mt-1 text-xs text-text-muted">
              Issued {formatDate(invoice.issueDate)}
            </p>
          </div>

          <Badge variant={INVOICE_STATUS_CONFIG[invoice.status].badgeVariant}>
            {INVOICE_STATUS_CONFIG[invoice.status].label}
          </Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Client",
              value: invoice.clientName,
            },
            {
              label: "Branch",
              value: branchName,
            },
            {
              label: "Client email",
              value: invoice.clientEmail,
            },
            {
              label: "Client phone",
              value: invoice.clientPhone || "Not provided",
            },
            {
              label: "Category",
              value: (
                <Badge variant={INVOICE_CATEGORY_CONFIG[invoice.category].badgeVariant}>
                  {INVOICE_CATEGORY_CONFIG[invoice.category].label}
                </Badge>
              ),
            },
            {
              label: "Due date",
              value: formatDate(invoice.dueDate),
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Line items</h3>

        <div className="mt-3 space-y-3">
          {invoice.lineItems.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-control border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div>
                <p className="text-sm font-semibold">{item.description}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {item.quantity} Ã— {formatPKR(item.unitPrice)}
                </p>
              </div>

              <strong>{formatPKR(item.quantity * item.unitPrice)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Invoice totals</h3>

        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-control bg-canvas p-4">
            <dt className="text-xs text-text-muted">Subtotal</dt>

            <dd className="mt-1 font-bold">{formatPKR(invoice.subtotal)}</dd>
          </div>

          <div className="rounded-control bg-canvas p-4">
            <dt className="text-xs text-text-muted">Discount</dt>

            <dd className="mt-1 font-bold">{formatPKR(invoice.discountAmount)}</dd>
          </div>

          <div className="rounded-control bg-canvas p-4">
            <dt className="text-xs text-text-muted">Tax ({invoice.taxRate}%)</dt>

            <dd className="mt-1 font-bold">{formatPKR(invoice.taxAmount)}</dd>
          </div>

          <div className="rounded-control bg-info-muted p-4">
            <dt className="text-xs text-info">Invoice total</dt>

            <dd className="mt-1 font-bold text-info">{formatPKR(invoice.totalAmount)}</dd>
          </div>

          <div className="rounded-control bg-success-muted p-4">
            <dt className="text-xs text-success">Paid</dt>

            <dd className="mt-1 font-bold text-success">
              {formatPKR(invoice.paidAmount)}
            </dd>
          </div>

          <div className="rounded-control bg-warning-muted p-4">
            <dt className="text-xs text-warning">Balance</dt>

            <dd className="mt-1 font-bold text-warning">
              {formatPKR(invoice.balanceAmount)}
            </dd>
          </div>
        </dl>
      </section>

      {invoice.paymentMethod && (
        <section>
          <h3 className="text-sm font-bold">Payment information</h3>

          <DetailGrid
            variant="outline"
            items={[
              {
                label: "Method",
                value: (
                  <Badge
                    variant={
                      INVOICE_PAYMENT_METHOD_CONFIG[invoice.paymentMethod].badgeVariant
                    }
                  >
                    {INVOICE_PAYMENT_METHOD_CONFIG[invoice.paymentMethod].label}
                  </Badge>
                ),
              },
              {
                label: "Reference",
                value: invoice.paymentReference || "Not provided",
              },
              {
                label: "Payment date",
                value: invoice.paidAt ? formatDate(invoice.paidAt) : "Not recorded",
              },
              {
                label: "Created by",
                value: invoice.createdBy,
              },
            ]}
          />
        </section>
      )}

      <section>
        <h3 className="text-sm font-bold">Billing note</h3>

        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {invoice.note || "No invoice note has been added."}
        </p>
      </section>
    </div>
  );
}
