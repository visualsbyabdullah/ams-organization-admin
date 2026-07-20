"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Ban,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Download,
  Plus,
  ReceiptText,
  Send,
  WalletCards,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { InvoiceDetails } from "@/components/invoices/invoice-details";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoicePaymentForm } from "@/components/invoices/invoice-payment-form";
import { InvoiceRevenueChart } from "@/components/invoices/invoice-revenue-chart";
import { InvoiceTabs } from "@/components/invoices/invoice-tabs";
import { createInvoiceColumns } from "@/components/invoices/invoice-table-columns";
import { useInvoiceRecords } from "@/components/invoices/use-invoice-records";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import {
  INVOICE_COPY,
  INVOICE_REFERENCE_DATE,
  INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { useBranchScope } from "@/context/branch-scope-context";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import {
  buildInvoiceTrend,
  exportInvoicesToCsv,
  isInvoiceDueSoon,
} from "@/lib/invoices";
import type {
  Invoice,
  InvoicePaymentValues,
} from "@/types/invoice";

export function InvoiceOverview() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const {
    invoices,
    saveInvoice,
    updateInvoiceStatus,
    recordInvoicePayment,
  } = useInvoiceRecords();

  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<string | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const scopedInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          selectedBranch.isAggregate ||
          invoice.branchId === selectedBranch.id,
      ),
    [invoices, selectedBranch],
  );

  const selectedInvoice =
    invoices.find(
      (invoice) =>
        invoice.id === selectedInvoiceId,
    ) ?? null;

  const referencePeriod =
    INVOICE_REFERENCE_DATE.slice(0, 7);

  const currentPeriodInvoices =
    scopedInvoices.filter(
      (invoice) =>
        invoice.issueDate.startsWith(
          referencePeriod,
        ) && invoice.status !== "void",
    );

  const billedAmount =
    currentPeriodInvoices.reduce(
      (total, invoice) =>
        total + invoice.totalAmount,
      0,
    );

  const collectedAmount =
    currentPeriodInvoices.reduce(
      (total, invoice) =>
        total + invoice.paidAmount,
      0,
    );

  const outstandingAmount =
    scopedInvoices
      .filter(
        (invoice) =>
          !["void", "draft"].includes(
            invoice.status,
          ),
      )
      .reduce(
        (total, invoice) =>
          total + invoice.balanceAmount,
        0,
      );

  const overdueInvoices = scopedInvoices.filter(
    (invoice) => invoice.status === "overdue",
  );

  const overdueAmount = overdueInvoices.reduce(
    (total, invoice) =>
      total + invoice.balanceAmount,
    0,
  );

  const attentionInvoices = scopedInvoices
    .filter(
      (invoice) =>
        invoice.status === "overdue" ||
        (["sent", "partially_paid"].includes(
          invoice.status,
        ) &&
          isInvoiceDueSoon(
            invoice.dueDate,
            INVOICE_REFERENCE_DATE,
          )),
    )
    .sort((first, second) =>
      first.dueDate.localeCompare(
        second.dueDate,
      ),
    );

  const recentInvoices = [...scopedInvoices]
    .sort((first, second) =>
      second.issueDate.localeCompare(
        first.issueDate,
      ),
    )
    .slice(0, 5);

  const trend = buildInvoiceTrend(
    scopedInvoices,
    Number(
      INVOICE_REFERENCE_DATE.slice(0, 4),
    ),
  );

  const metrics = [
    {
      label: "Billed this month",
      value: formatPKR(billedAmount, true),
      detail: selectedBranch.name,
      icon: ReceiptText,
      tone: "info" as const,
    },
    {
      label: "Collected this month",
      value: formatPKR(
        collectedAmount,
        true,
      ),
      detail:
        billedAmount > 0
          ? `${Math.round(
              (collectedAmount /
                billedAmount) *
                100,
            )}% collection rate`
          : "No billing recorded",
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Outstanding balance",
      value: formatPKR(
        outstandingAmount,
        true,
      ),
      detail: "Open client receivables",
      icon: WalletCards,
      tone: "warning" as const,
    },
    {
      label: "Overdue invoices",
      value: formatPKR(overdueAmount, true),
      detail: `${overdueInvoices.length} invoices require action`,
      icon: CircleAlert,
      tone: "danger" as const,
    },
  ];

  const columns = useMemo(
    () =>
      createInvoiceColumns({
        onOpen: (invoice) =>
          setSelectedInvoiceId(invoice.id),
        compact: true,
      }),
    [],
  );

  function saveAndOpen(invoice: Invoice) {
    saveInvoice(invoice);
    setCreateOpen(false);
    setSelectedInvoiceId(invoice.id);
  }

  function recordPayment(
    invoiceId: string,
    values: InvoicePaymentValues,
  ) {
    recordInvoicePayment(invoiceId, values);
    setPaymentOpen(false);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={INVOICE_COPY.common.eyebrow}
        title={INVOICE_COPY.overview.title}
        description={
          INVOICE_COPY.overview.description
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                exportInvoicesToCsv(
                  scopedInvoices,
                )
              }
            >
              <Download />
              {INVOICE_COPY.common.exportAction}
            </Button>

            <Button
              onClick={() =>
                setCreateOpen(true)
              }
            >
              <Plus />
              {INVOICE_COPY.common.createAction}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <InvoiceTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={
            INVOICE_COPY.overview.chartTitle
          }
          description={
            INVOICE_COPY.overview
              .chartDescription
          }
        >
          <InvoiceRevenueChart data={trend} />
        </ChartCard>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <CircleDollarSign size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {
                  INVOICE_COPY.overview
                    .attentionTitle
                }
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {
                  INVOICE_COPY.overview
                    .attentionDescription
                }
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {attentionInvoices.length > 0 ? (
              attentionInvoices.map(
                (invoice) => (
                  <button
                    key={invoice.id}
                    type="button"
                    onClick={() =>
                      setSelectedInvoiceId(
                        invoice.id,
                      )
                    }
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {invoice.clientName}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {invoice.invoiceNumber}
                        </p>
                      </div>

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
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <strong className="text-sm">
                        {formatPKR(
                          invoice.balanceAmount,
                        )}
                      </strong>

                      <span className="text-xs text-text-muted">
                        Due {formatDate(invoice.dueDate)}
                      </span>
                    </div>
                  </button>
                ),
              )
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No invoices currently require collection follow-up.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {INVOICE_COPY.overview.recentTitle}
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              INVOICE_COPY.overview
                .recentDescription
            }
          </p>
        </div>

        <DataTable
          rows={recentInvoices}
          columns={columns}
          getRowKey={(invoice) => invoice.id}
          onRowClick={(invoice) =>
            setSelectedInvoiceId(invoice.id)
          }
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <ReceiptText className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">
                {INVOICE_COPY.common.emptyTitle}
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                {
                  INVOICE_COPY.common
                    .emptyDescription
                }
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedInvoice)}
        onClose={() => {
          setSelectedInvoiceId(null);
          setPaymentOpen(false);
        }}
        title="Client invoice"
        description={
          selectedInvoice
            ? `${selectedInvoice.clientName} Â· ${selectedInvoice.invoiceNumber}`
            : undefined
        }
        footer={
          selectedInvoice ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedInvoice.status ===
                "draft" && (
                <Button
                  onClick={() =>
                    updateInvoiceStatus(
                      selectedInvoice.id,
                      "sent",
                    )
                  }
                >
                  <Send />
                  {INVOICE_COPY.actions.send}
                </Button>
              )}

              {[
                "sent",
                "partially_paid",
                "overdue",
              ].includes(
                selectedInvoice.status,
              ) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateInvoiceStatus(
                        selectedInvoice.id,
                        "void",
                      )
                    }
                  >
                    <Ban />
                    {
                      INVOICE_COPY.actions
                        .markVoid
                    }
                  </Button>

                  <Button
                    onClick={() =>
                      setPaymentOpen(true)
                    }
                  >
                    <CircleDollarSign />
                    {
                      INVOICE_COPY.actions
                        .recordPayment
                    }
                  </Button>
                </>
              )}

              {selectedInvoice.status ===
                "void" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateInvoiceStatus(
                      selectedInvoice.id,
                      "draft",
                    )
                  }
                >
                  <ReceiptText />
                  {INVOICE_COPY.actions.reopen}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedInvoice && (
          <InvoiceDetails
            invoice={selectedInvoice}
          />
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create invoice"
        description="Create a client invoice using the effective billing settings for the selected branch."
      >
        <InvoiceForm
          selectedBranchId={selectedBranchId}
          onCancel={() =>
            setCreateOpen(false)
          }
          onSave={saveAndOpen}
        />
      </Drawer>

      <Drawer
        open={Boolean(
          paymentOpen && selectedInvoice,
        )}
        onClose={() => setPaymentOpen(false)}
        title="Record invoice payment"
        description={
          selectedInvoice
            ? `${selectedInvoice.clientName} Â· ${selectedInvoice.invoiceNumber}`
            : undefined
        }
      >
        {selectedInvoice && (
          <InvoicePaymentForm
            key={`${selectedInvoice.id}-${selectedInvoice.balanceAmount}`}
            invoice={selectedInvoice}
            onCancel={() =>
              setPaymentOpen(false)
            }
            onSubmit={recordPayment}
          />
        )}
      </Drawer>
    </div>
  );
}