"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Ban,
  CircleDollarSign,
  Copy,
  Download,
  FilePenLine,
  FileSearch,
  Plus,
  Search,
  Send,
} from "lucide-react";

import { InvoiceDetails } from "@/components/invoices/invoice-details";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoicePaymentForm } from "@/components/invoices/invoice-payment-form";
import { InvoiceTabs } from "@/components/invoices/invoice-tabs";
import { createInvoiceColumns } from "@/components/invoices/invoice-table-columns";
import { useInvoiceRecords } from "@/components/invoices/use-invoice-records";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  INVOICE_CATEGORY_CONFIG,
  INVOICE_COPY,
  INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { useBranchScope } from "@/context/branch-scope-context";
import {
  exportInvoicesToCsv,
} from "@/lib/invoices";
import type {
  Invoice,
  InvoicePaymentValues,
} from "@/types/invoice";

type EditorMode =
  | "create"
  | "edit"
  | null;

export function InvoiceRegisterWorkspace() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const {
    invoices,
    saveInvoice,
    updateInvoiceStatus,
    recordInvoicePayment,
    duplicateInvoice,
  } = useInvoiceRecords();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<string | null>(null);

  const [editorMode, setEditorMode] =
    useState<EditorMode>(null);

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

  const visibleInvoices = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return scopedInvoices.filter((invoice) => {
      const searchableValue = [
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.clientEmail,
        invoice.clientPhone,
        invoice.paymentReference,
        invoice.note,
        INVOICE_CATEGORY_CONFIG[
          invoice.category
        ].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        invoice.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        invoice.category === categoryFilter;

      return (
        searchableValue.includes(query) &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    categoryFilter,
    scopedInvoices,
    searchQuery,
    statusFilter,
  ]);

  const selectedInvoice =
    invoices.find(
      (invoice) =>
        invoice.id === selectedInvoiceId,
    ) ?? null;

  const columns = useMemo(
    () =>
      createInvoiceColumns({
        onOpen: (invoice) =>
          setSelectedInvoiceId(invoice.id),
      }),
    [],
  );

  function saveAndOpen(invoice: Invoice) {
    saveInvoice(invoice);
    setEditorMode(null);
    setSelectedInvoiceId(invoice.id);
  }

  function duplicateAndOpen(invoice: Invoice) {
    const duplicate = duplicateInvoice(invoice);
    setSelectedInvoiceId(duplicate.id);
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
        title={INVOICE_COPY.register.title}
        description={
          INVOICE_COPY.register.description
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                exportInvoicesToCsv(
                  visibleInvoices,
                )
              }
            >
              <Download />
              {INVOICE_COPY.common.exportAction}
            </Button>

            <Button
              onClick={() => {
                setSelectedInvoiceId(null);
                setEditorMode("create");
              }}
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

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {INVOICE_COPY.register.registerTitle}
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              INVOICE_COPY.register
                .registerDescription
            }
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder={
                  INVOICE_COPY.common
                    .searchPlaceholder
                }
                className="pl-9"
              />
            </div>

            <Select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  INVOICE_COPY.common
                    .allCategories
                }
              </option>

              {Object.entries(
                INVOICE_CATEGORY_CONFIG,
              ).map(([value, config]) => (
                <option
                  key={value}
                  value={value}
                >
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  INVOICE_COPY.common
                    .allStatuses
                }
              </option>

              {Object.entries(
                INVOICE_STATUS_CONFIG,
              ).map(([value, config]) => (
                <option
                  key={value}
                  value={value}
                >
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleInvoices}
          columns={columns}
          getRowKey={(invoice) => invoice.id}
          onRowClick={(invoice) =>
            setSelectedInvoiceId(invoice.id)
          }
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />

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
              <Button
                variant="outline"
                onClick={() =>
                  duplicateAndOpen(selectedInvoice)
                }
              >
                <Copy />
                {INVOICE_COPY.actions.duplicate}
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setEditorMode("edit")
                }
              >
                <FilePenLine />
                {INVOICE_COPY.actions.edit}
              </Button>

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
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create"
            ? "Create invoice"
            : "Edit invoice"
        }
        description="Create or update client billing using the effective branch settings."
      >
        {editorMode && (
          <InvoiceForm
            key={
              editorMode === "create"
                ? "new-invoice"
                : selectedInvoice?.id
            }
            invoice={
              editorMode === "edit"
                ? selectedInvoice ?? undefined
                : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() =>
              setEditorMode(null)
            }
            onSave={saveAndOpen}
          />
        )}
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