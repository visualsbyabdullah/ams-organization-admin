"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  Copy,
  FilePenLine,
  FileSearch,
  PauseCircle,
  Play,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { InvoiceTabs } from "@/components/invoices/invoice-tabs";
import { RecurringInvoiceForm } from "@/components/invoices/recurring-invoice-form";
import { createRecurringInvoiceColumns } from "@/components/invoices/invoice-table-columns";
import { DataTable } from "@/components/shared/data-table";
import { DetailGrid } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  INVOICE_CATEGORY_CONFIG,
  INVOICE_COPY,
  INVOICE_REFERENCE_DATE,
  RECURRING_INVOICE_FREQUENCY_CONFIG,
  RECURRING_INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { useBranchScope } from "@/context/branch-scope-context";
import { RECURRING_INVOICES } from "@/data/invoices";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { addDays, getMonthlyEquivalent } from "@/lib/invoices";
import type { RecurringInvoice, RecurringInvoiceStatus } from "@/types/invoice";

type EditorMode = "create" | "edit" | null;

export function RecurringInvoicesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [recurringInvoices, setRecurringInvoices] =
    useState<RecurringInvoice[]>(RECURRING_INVOICES);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [frequencyFilter, setFrequencyFilter] = useState("all");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedInvoices = useMemo(
    () =>
      recurringInvoices.filter(
        (invoice) => selectedBranch.isAggregate || invoice.branchId === selectedBranch.id,
      ),
    [recurringInvoices, selectedBranch],
  );

  const visibleInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedInvoices.filter((invoice) => {
      const searchableValue = [
        invoice.name,
        invoice.clientName,
        invoice.clientEmail,
        invoice.note,
        INVOICE_CATEGORY_CONFIG[invoice.category].label,
      ]
        .join(" ")
        .toLowerCase();

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      const matchesFrequency =
        frequencyFilter === "all" || invoice.frequency === frequencyFilter;

      return searchableValue.includes(query) && matchesStatus && matchesFrequency;
    });
  }, [frequencyFilter, scopedInvoices, searchQuery, statusFilter]);

  const selectedInvoice =
    recurringInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null;

  const activeInvoices = scopedInvoices.filter((invoice) => invoice.status === "active");

  const monthlyEquivalent = activeInvoices.reduce(
    (total, invoice) =>
      total + getMonthlyEquivalent(invoice.totalAmount, invoice.frequency),
    0,
  );

  const upcomingInvoices = activeInvoices.filter(
    (invoice) =>
      invoice.nextInvoiceDate >= INVOICE_REFERENCE_DATE &&
      invoice.nextInvoiceDate <= addDays(INVOICE_REFERENCE_DATE, 30),
  );

  const pausedInvoices = scopedInvoices.filter((invoice) => invoice.status === "paused");

  const metrics = [
    {
      label: "Active schedules",
      value: String(activeInvoices.length),
      detail: selectedBranch.name,
      icon: RefreshCw,
      tone: "success" as const,
    },
    {
      label: "Monthly equivalent",
      value: formatPKR(monthlyEquivalent, true),
      detail: "Normalized recurring revenue",
      icon: CircleDollarSign,
      tone: "info" as const,
    },
    {
      label: "Due within 30 days",
      value: String(upcomingInvoices.length),
      detail: "Upcoming invoice generation",
      icon: CalendarClock,
      tone: "warning" as const,
    },
    {
      label: "Paused schedules",
      value: String(pausedInvoices.length),
      detail: "Requires billing review",
      icon: PauseCircle,
      tone: "danger" as const,
    },
  ];

  const columns = useMemo(
    () =>
      createRecurringInvoiceColumns({
        onOpen: (invoice) => setSelectedInvoiceId(invoice.id),
      }),
    [],
  );

  function saveInvoice(nextInvoice: RecurringInvoice) {
    setRecurringInvoices((currentInvoices) => {
      const exists = currentInvoices.some((invoice) => invoice.id === nextInvoice.id);

      return exists
        ? currentInvoices.map((invoice) =>
            invoice.id === nextInvoice.id ? nextInvoice : invoice,
          )
        : [nextInvoice, ...currentInvoices];
    });

    setEditorMode(null);
    setSelectedInvoiceId(nextInvoice.id);
  }

  function updateStatus(invoiceId: string, status: RecurringInvoiceStatus) {
    setRecurringInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status,
              endDate: status === "ended" ? INVOICE_REFERENCE_DATE : invoice.endDate,
            }
          : invoice,
      ),
    );
  }

  function duplicateInvoice(invoice: RecurringInvoice) {
    const duplicate: RecurringInvoice = {
      ...invoice,
      id: crypto.randomUUID(),
      name: `${invoice.name} Copy`,
      status: "paused",
    };

    setRecurringInvoices((currentInvoices) => [duplicate, ...currentInvoices]);

    setSelectedInvoiceId(duplicate.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={INVOICE_COPY.common.eyebrow}
        title={INVOICE_COPY.recurring.title}
        description={INVOICE_COPY.recurring.description}
        actions={
          <Button
            onClick={() => {
              setSelectedInvoiceId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {INVOICE_COPY.recurring.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <InvoiceTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{INVOICE_COPY.recurring.registerTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {INVOICE_COPY.recurring.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search schedule, client, email, category or note"
                  className="pl-9"
                />
              </div>

              <Select
                value={frequencyFilter}
                onChange={(event) => setFrequencyFilter(event.target.value)}
              >
                <option value="all">{INVOICE_COPY.recurring.allFrequencies}</option>

                {Object.entries(RECURRING_INVOICE_FREQUENCY_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{INVOICE_COPY.recurring.allStatuses}</option>

                {Object.entries(RECURRING_INVOICE_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </div>

          <DataTable
            rows={visibleInvoices}
            columns={columns}
            getRowKey={(invoice) => invoice.id}
            onRowClick={(invoice) => setSelectedInvoiceId(invoice.id)}
            emptyState={
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <FileSearch className="size-8 text-text-muted" />

                <h3 className="mt-4 font-bold">{INVOICE_COPY.recurring.emptyTitle}</h3>

                <p className="mt-2 text-sm text-text-muted">
                  {INVOICE_COPY.recurring.emptyDescription}
                </p>
              </div>
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              <CalendarClock size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">Upcoming generation</h2>

              <p className="mt-1 text-sm text-text-muted">
                Active schedules due within the next thirty days.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingInvoices.length > 0 ? (
              upcomingInvoices
                .sort((first, second) =>
                  first.nextInvoiceDate.localeCompare(second.nextInvoiceDate),
                )
                .map((invoice) => (
                  <button
                    key={invoice.id}
                    type="button"
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{invoice.clientName}</p>

                        <p className="mt-1 text-xs text-text-muted">{invoice.name}</p>
                      </div>

                      <Badge variant="info">
                        {RECURRING_INVOICE_FREQUENCY_CONFIG[invoice.frequency].label}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <strong className="text-sm">
                        {formatPKR(invoice.totalAmount)}
                      </strong>

                      <span className="text-xs text-text-muted">
                        {formatDate(invoice.nextInvoiceDate)}
                      </span>
                    </div>
                  </button>
                ))
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No recurring invoices are due within thirty days.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoiceId(null)}
        title="Recurring invoice"
        description={selectedInvoice?.name}
        footer={
          selectedInvoice ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => duplicateInvoice(selectedInvoice)}>
                <Copy />
                {INVOICE_COPY.actions.duplicate}
              </Button>

              <Button variant="outline" onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                {INVOICE_COPY.actions.edit}
              </Button>

              {selectedInvoice.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedInvoice.id, "paused")}
                >
                  <PauseCircle />
                  {INVOICE_COPY.actions.pause}
                </Button>
              )}

              {selectedInvoice.status === "paused" && (
                <Button onClick={() => updateStatus(selectedInvoice.id, "active")}>
                  <Play />
                  {INVOICE_COPY.actions.resume}
                </Button>
              )}

              {selectedInvoice.status !== "ended" && (
                <Button
                  variant="danger"
                  onClick={() => updateStatus(selectedInvoice.id, "ended")}
                >
                  <XCircle />
                  {INVOICE_COPY.actions.end}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedInvoice.name}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    {selectedInvoice.clientName}
                  </p>
                </div>

                <Badge
                  variant={
                    RECURRING_INVOICE_STATUS_CONFIG[selectedInvoice.status].badgeVariant
                  }
                >
                  {RECURRING_INVOICE_STATUS_CONFIG[selectedInvoice.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Frequency",
                    value:
                      RECURRING_INVOICE_FREQUENCY_CONFIG[selectedInvoice.frequency].label,
                  },
                  {
                    label: "Next invoice",
                    value: formatDate(selectedInvoice.nextInvoiceDate),
                  },
                  {
                    label: "Invoice total",
                    value: (
                      <span className="text-lg font-bold">
                        {formatPKR(selectedInvoice.totalAmount)}
                      </span>
                    ),
                  },
                  {
                    label: "Delivery",
                    value: (
                      <Badge variant={selectedInvoice.autoSend ? "success" : "neutral"}>
                        {selectedInvoice.autoSend ? "Automatic" : "Manual review"}
                      </Badge>
                    ),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Invoice item</h3>

              <div className="mt-3 rounded-control bg-canvas p-4">
                <p className="text-sm font-semibold">
                  {selectedInvoice.lineItems[0]?.description}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {selectedInvoice.lineItems[0]?.quantity} Ã—{" "}
                  {formatPKR(selectedInvoice.lineItems[0]?.unitPrice ?? 0)}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Schedule note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedInvoice.note || "No recurring billing note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add recurring invoice" : "Edit recurring invoice"
        }
        description="Configure a reusable client billing schedule and delivery workflow."
      >
        {editorMode && (
          <RecurringInvoiceForm
            key={editorMode === "create" ? "new-recurring-invoice" : selectedInvoice?.id}
            recurringInvoice={
              editorMode === "edit" ? (selectedInvoice ?? undefined) : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveInvoice}
          />
        )}
      </Drawer>
    </div>
  );
}
