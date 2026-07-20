"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Plus, Trash2 } from "lucide-react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INVOICE_CATEGORY_CONFIG,
  INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import {
  INVOICE_SETTINGS,
} from "@/data/invoices";
import { formatPKR } from "@/lib/currency";
import {
  addDays,
  buildInvoiceNumber,
  calculateInvoiceTotals,
  getEffectiveInvoiceSettings,
} from "@/lib/invoices";
import type {
  Invoice,
  InvoiceCategory,
  InvoiceLineItem,
  InvoiceStatus,
} from "@/types/invoice";

type InvoiceFormProps = {
  invoice?: Invoice;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (invoice: Invoice) => void;
};

const BUSINESS_BRANCHES =
  BRANCH_OPTIONS.filter(
    (branch) => !branch.isAggregate,
  );

function createEmptyLineItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export function InvoiceForm({
  invoice,
  selectedBranchId,
  onCancel,
  onSave,
}: InvoiceFormProps) {
  const initialBranchId =
    invoice?.branchId ??
    (selectedBranchId === "all"
      ? BUSINESS_BRANCHES[0]?.id ?? ""
      : selectedBranchId);

  const [branchId, setBranchId] =
    useState(initialBranchId);

  const effectiveSettings = useMemo(
    () =>
      getEffectiveInvoiceSettings(
        INVOICE_SETTINGS,
        branchId,
      ),
    [branchId],
  );

  const [invoiceNumber, setInvoiceNumber] =
    useState(
      invoice?.invoiceNumber ??
        buildInvoiceNumber(
          effectiveSettings?.invoicePrefix ??
            "INV",
          effectiveSettings?.nextSequence ?? 1,
        ),
    );

  const [clientName, setClientName] =
    useState(invoice?.clientName ?? "");

  const [clientEmail, setClientEmail] =
    useState(invoice?.clientEmail ?? "");

  const [clientPhone, setClientPhone] =
    useState(invoice?.clientPhone ?? "");

  const [clientAddress, setClientAddress] =
    useState(invoice?.clientAddress ?? "");

  const [category, setCategory] =
    useState<InvoiceCategory>(
      invoice?.category ?? "subscription",
    );

  const [status, setStatus] =
    useState<InvoiceStatus>(
      invoice?.status ?? "draft",
    );

  const [issueDate, setIssueDate] =
    useState(
      invoice?.issueDate ??
        new Date().toISOString().slice(0, 10),
    );

  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ??
      addDays(
        new Date().toISOString().slice(0, 10),
        effectiveSettings?.paymentTermDays ?? 15,
      ),
  );

  const [lineItems, setLineItems] =
    useState<InvoiceLineItem[]>(
      invoice?.lineItems ?? [createEmptyLineItem()],
    );

  const [taxRate, setTaxRate] = useState(
    String(
      invoice?.taxRate ??
        effectiveSettings?.defaultTaxRate ??
        0,
    ),
  );

  const [discountAmount, setDiscountAmount] =
    useState(
      String(invoice?.discountAmount ?? 0),
    );

  const [note, setNote] = useState(
    invoice?.note ??
      effectiveSettings?.defaultNote ??
      "",
  );

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    if (invoice) {
      return;
    }

    const settings =
      getEffectiveInvoiceSettings(
        INVOICE_SETTINGS,
        branchId,
      );

    if (!settings) {
      return;
    }

    setInvoiceNumber(
      buildInvoiceNumber(
        settings.invoicePrefix,
        settings.nextSequence,
      ),
    );

    setTaxRate(
      String(settings.defaultTaxRate),
    );

    setDueDate(
      addDays(
        issueDate,
        settings.paymentTermDays,
      ),
    );

    setNote(settings.defaultNote);
  }, [branchId, invoice, issueDate]);

  const totals = calculateInvoiceTotals(
    lineItems,
    Number(taxRate) || 0,
    Number(discountAmount) || 0,
  );

  const hasValidItems =
    lineItems.length > 0 &&
    lineItems.every(
      (item) =>
        item.description.trim() &&
        item.quantity > 0 &&
        item.unitPrice >= 0,
    );

  const isValid = Boolean(
    branchId &&
      invoiceNumber.trim() &&
      clientName.trim() &&
      clientEmail.trim() &&
      issueDate &&
      dueDate &&
      hasValidItems &&
      totals.totalAmount > 0,
  );

  function updateLineItem(
    id: string,
    field: keyof Pick<
      InvoiceLineItem,
      "description" | "quantity" | "unitPrice"
    >,
    value: string,
  ) {
    setLineItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "description"
                  ? value
                  : Math.max(Number(value) || 0, 0),
            }
          : item,
      ),
    );
  }

  function removeLineItem(id: string) {
    setLineItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter(
            (item) => item.id !== id,
          ),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const currentPaidAmount =
      invoice?.paidAmount ?? 0;

    onSave({
      id: invoice?.id ?? crypto.randomUUID(),
      invoiceNumber: invoiceNumber.trim(),
      branchId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      category,
      status,
      issueDate,
      dueDate,
      lineItems,
      ...totals,
      taxRate: Math.max(Number(taxRate) || 0, 0),
      paidAmount: currentPaidAmount,
      balanceAmount: Math.max(
        totals.totalAmount - currentPaidAmount,
        0,
      ),
      paymentMethod: invoice?.paymentMethod,
      paymentReference:
        invoice?.paymentReference,
      paidAt: invoice?.paidAt,
      createdBy:
        invoice?.createdBy ?? CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Invoice number"
          htmlFor="invoiceNumber"
          error={
            submitted && !invoiceNumber.trim()
              ? "Enter an invoice number"
              : undefined
          }
        >
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(event) =>
              setInvoiceNumber(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Branch"
          htmlFor="invoiceBranch"
          error={
            submitted && !branchId
              ? "Select a branch"
              : undefined
          }
        >
          <Select
            id="invoiceBranch"
            value={branchId}
            onChange={(event) =>
              setBranchId(event.target.value)
            }
          >
            {BUSINESS_BRANCHES.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Category"
          htmlFor="invoiceCategory"
        >
          <Select
            id="invoiceCategory"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as InvoiceCategory,
              )
            }
          >
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
        </FormField>

        <FormField
          label="Invoice status"
          htmlFor="invoiceStatus"
        >
          <Select
            id="invoiceStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as InvoiceStatus,
              )
            }
          >
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
        </FormField>

        <FormField
          label="Issue date"
          htmlFor="invoiceIssueDate"
        >
          <Input
            id="invoiceIssueDate"
            type="date"
            value={issueDate}
            onChange={(event) =>
              setIssueDate(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Due date"
          htmlFor="invoiceDueDate"
        >
          <Input
            id="invoiceDueDate"
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
          />
        </FormField>
      </section>

      <section>
        <h3 className="font-bold">
          Client information
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Client name"
            htmlFor="invoiceClientName"
            error={
              submitted && !clientName.trim()
                ? "Enter the client name"
                : undefined
            }
          >
            <Input
              id="invoiceClientName"
              value={clientName}
              onChange={(event) =>
                setClientName(event.target.value)
              }
              placeholder="Client or organization name"
            />
          </FormField>

          <FormField
            label="Client email"
            htmlFor="invoiceClientEmail"
            error={
              submitted && !clientEmail.trim()
                ? "Enter the client email"
                : undefined
            }
          >
            <Input
              id="invoiceClientEmail"
              type="email"
              value={clientEmail}
              onChange={(event) =>
                setClientEmail(event.target.value)
              }
              placeholder="billing@example.com"
            />
          </FormField>

          <FormField
            label="Client phone"
            htmlFor="invoiceClientPhone"
            optional
          >
            <Input
              id="invoiceClientPhone"
              value={clientPhone}
              onChange={(event) =>
                setClientPhone(event.target.value)
              }
              placeholder="Client contact number"
            />
          </FormField>

          <FormField
            label="Billing address"
            htmlFor="invoiceClientAddress"
            optional
          >
            <Input
              id="invoiceClientAddress"
              value={clientAddress}
              onChange={(event) =>
                setClientAddress(event.target.value)
              }
              placeholder="Billing address"
            />
          </FormField>
        </div>
      </section>

      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold">
              Line items
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Add every product, service or charge included in this invoice.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setLineItems((currentItems) => [
                ...currentItems,
                createEmptyLineItem(),
              ])
            }
          >
            <Plus />
            Add item
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {lineItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-control border border-border p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold">
                  Item {index + 1}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${index + 1}`}
                  disabled={lineItems.length === 1}
                  onClick={() =>
                    removeLineItem(item.id)
                  }
                >
                  <Trash2 />
                </Button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem_10rem]">
                <FormField
                  label="Description"
                  htmlFor={`invoiceItemDescription-${item.id}`}
                >
                  <Input
                    id={`invoiceItemDescription-${item.id}`}
                    value={item.description}
                    onChange={(event) =>
                      updateLineItem(
                        item.id,
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Product or service description"
                  />
                </FormField>

                <FormField
                  label="Quantity"
                  htmlFor={`invoiceItemQuantity-${item.id}`}
                >
                  <Input
                    id={`invoiceItemQuantity-${item.id}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      updateLineItem(
                        item.id,
                        "quantity",
                        event.target.value,
                      )
                    }
                  />
                </FormField>

                <FormField
                  label="Unit price"
                  htmlFor={`invoiceItemPrice-${item.id}`}
                >
                  <Input
                    id={`invoiceItemPrice-${item.id}`}
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateLineItem(
                        item.id,
                        "unitPrice",
                        event.target.value,
                      )
                    }
                  />
                </FormField>
              </div>
            </div>
          ))}

          {submitted && !hasValidItems && (
            <p className="text-sm font-medium text-danger">
              Complete every line item with a description, quantity and price.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Totals and tax
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Tax rate"
            htmlFor="invoiceTaxRate"
          >
            <Input
              id="invoiceTaxRate"
              type="number"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(event) =>
                setTaxRate(event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Discount amount"
            htmlFor="invoiceDiscountAmount"
          >
            <Input
              id="invoiceDiscountAmount"
              type="number"
              min="0"
              value={discountAmount}
              onChange={(event) =>
                setDiscountAmount(
                  event.target.value,
                )
              }
            />
          </FormField>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-control bg-canvas p-4">
            <dt className="text-xs text-text-muted">
              Subtotal
            </dt>

            <dd className="mt-1 font-bold">
              {formatPKR(totals.subtotal)}
            </dd>
          </div>

          <div className="rounded-control bg-canvas p-4">
            <dt className="text-xs text-text-muted">
              Tax
            </dt>

            <dd className="mt-1 font-bold">
              {formatPKR(totals.taxAmount)}
            </dd>
          </div>

          <div className="rounded-control bg-canvas p-4">
            <dt className="text-xs text-text-muted">
              Discount
            </dt>

            <dd className="mt-1 font-bold">
              {formatPKR(totals.discountAmount)}
            </dd>
          </div>

          <div className="rounded-control bg-info-muted p-4">
            <dt className="text-xs text-info">
              Invoice total
            </dt>

            <dd className="mt-1 text-lg font-bold text-info">
              {formatPKR(totals.totalAmount)}
            </dd>
          </div>
        </dl>
      </section>

      <FormField
        label="Invoice note"
        htmlFor="invoiceNote"
        optional
      >
        <Textarea
          id="invoiceNote"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Payment terms, bank details or billing context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          {invoice
            ? "Save invoice"
            : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}