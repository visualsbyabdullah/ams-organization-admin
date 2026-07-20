"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  INVOICE_CATEGORY_CONFIG,
  RECURRING_INVOICE_FREQUENCY_CONFIG,
  RECURRING_INVOICE_STATUS_CONFIG,
} from "@/config/invoices";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { formatPKR } from "@/lib/currency";
import {
  addMonths,
  calculateInvoiceTotals,
} from "@/lib/invoices";
import type {
  InvoiceCategory,
  RecurringInvoice,
  RecurringInvoiceFrequency,
  RecurringInvoiceStatus,
} from "@/types/invoice";

type RecurringInvoiceFormProps = {
  recurringInvoice?: RecurringInvoice;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (
    recurringInvoice: RecurringInvoice,
  ) => void;
};

const BUSINESS_BRANCHES =
  BRANCH_OPTIONS.filter(
    (branch) => !branch.isAggregate,
  );

export function RecurringInvoiceForm({
  recurringInvoice,
  selectedBranchId,
  onCancel,
  onSave,
}: RecurringInvoiceFormProps) {
  const [name, setName] = useState(
    recurringInvoice?.name ?? "",
  );

  const [branchId, setBranchId] = useState(
    recurringInvoice?.branchId ??
      (selectedBranchId === "all"
        ? BUSINESS_BRANCHES[0]?.id ?? ""
        : selectedBranchId),
  );

  const [clientName, setClientName] =
    useState(
      recurringInvoice?.clientName ?? "",
    );

  const [clientEmail, setClientEmail] =
    useState(
      recurringInvoice?.clientEmail ?? "",
    );

  const [category, setCategory] =
    useState<InvoiceCategory>(
      recurringInvoice?.category ??
        "subscription",
    );

  const [frequency, setFrequency] =
    useState<RecurringInvoiceFrequency>(
      recurringInvoice?.frequency ?? "monthly",
    );

  const [status, setStatus] =
    useState<RecurringInvoiceStatus>(
      recurringInvoice?.status ?? "active",
    );

  const [startDate, setStartDate] = useState(
    recurringInvoice?.startDate ??
      new Date().toISOString().slice(0, 10),
  );

  const [nextInvoiceDate, setNextInvoiceDate] =
    useState(
      recurringInvoice?.nextInvoiceDate ??
        new Date().toISOString().slice(0, 10),
    );

  const [endDate, setEndDate] = useState(
    recurringInvoice?.endDate ?? "",
  );

  const [description, setDescription] =
    useState(
      recurringInvoice?.lineItems[0]
        ?.description ?? "",
    );

  const [quantity, setQuantity] = useState(
    String(
      recurringInvoice?.lineItems[0]
        ?.quantity ?? 1,
    ),
  );

  const [unitPrice, setUnitPrice] = useState(
    String(
      recurringInvoice?.lineItems[0]
        ?.unitPrice ?? 0,
    ),
  );

  const [taxRate, setTaxRate] = useState(
    String(recurringInvoice?.taxRate ?? 15),
  );

  const [discountAmount, setDiscountAmount] =
    useState(
      String(
        recurringInvoice?.discountAmount ?? 0,
      ),
    );

  const [autoSend, setAutoSend] = useState(
    recurringInvoice?.autoSend ?? false,
  );

  const [note, setNote] = useState(
    recurringInvoice?.note ?? "",
  );

  const [submitted, setSubmitted] =
    useState(false);

  const lineItems = useMemo(
    () => [
      {
        id:
          recurringInvoice?.lineItems[0]?.id ??
          "recurring-line-item",
        description: description.trim(),
        quantity: Math.max(
          Number(quantity) || 0,
          0,
        ),
        unitPrice: Math.max(
          Number(unitPrice) || 0,
          0,
        ),
      },
    ],
    [
      description,
      quantity,
      recurringInvoice,
      unitPrice,
    ],
  );

  const totals = calculateInvoiceTotals(
    lineItems,
    Number(taxRate) || 0,
    Number(discountAmount) || 0,
  );

  const isValid = Boolean(
    name.trim() &&
      branchId &&
      clientName.trim() &&
      clientEmail.trim() &&
      startDate &&
      nextInvoiceDate &&
      description.trim() &&
      lineItems[0].quantity > 0 &&
      lineItems[0].unitPrice > 0,
  );

  function handleFrequencyChange(
    nextFrequency: RecurringInvoiceFrequency,
  ) {
    setFrequency(nextFrequency);

    if (!recurringInvoice) {
      setNextInvoiceDate(
        addMonths(
          startDate,
          RECURRING_INVOICE_FREQUENCY_CONFIG[
            nextFrequency
          ].months,
        ),
      );
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    onSave({
      id:
        recurringInvoice?.id ??
        crypto.randomUUID(),
      name: name.trim(),
      branchId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      category,
      frequency,
      status,
      startDate,
      nextInvoiceDate,
      endDate: endDate || undefined,
      lineItems,
      ...totals,
      taxRate: Math.max(
        Number(taxRate) || 0,
        0,
      ),
      autoSend,
      createdBy:
        recurringInvoice?.createdBy ??
        CURRENT_ADMIN.name,
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
          label="Schedule name"
          htmlFor="recurringInvoiceName"
          error={
            submitted && !name.trim()
              ? "Enter a schedule name"
              : undefined
          }
        >
          <Input
            id="recurringInvoiceName"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Example: Monthly platform subscription"
          />
        </FormField>

        <FormField
          label="Branch"
          htmlFor="recurringInvoiceBranch"
        >
          <Select
            id="recurringInvoiceBranch"
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
          label="Status"
          htmlFor="recurringInvoiceStatus"
        >
          <Select
            id="recurringInvoiceStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as RecurringInvoiceStatus,
              )
            }
          >
            {Object.entries(
              RECURRING_INVOICE_STATUS_CONFIG,
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
          label="Category"
          htmlFor="recurringInvoiceCategory"
        >
          <Select
            id="recurringInvoiceCategory"
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
      </section>

      <section>
        <h3 className="font-bold">
          Client information
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Client name"
            htmlFor="recurringInvoiceClientName"
            error={
              submitted && !clientName.trim()
                ? "Enter the client name"
                : undefined
            }
          >
            <Input
              id="recurringInvoiceClientName"
              value={clientName}
              onChange={(event) =>
                setClientName(event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Client email"
            htmlFor="recurringInvoiceClientEmail"
            error={
              submitted && !clientEmail.trim()
                ? "Enter the client email"
                : undefined
            }
          >
            <Input
              id="recurringInvoiceClientEmail"
              type="email"
              value={clientEmail}
              onChange={(event) =>
                setClientEmail(event.target.value)
              }
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Billing schedule
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Frequency"
            htmlFor="recurringInvoiceFrequency"
          >
            <Select
              id="recurringInvoiceFrequency"
              value={frequency}
              onChange={(event) =>
                handleFrequencyChange(
                  event.target
                    .value as RecurringInvoiceFrequency,
                )
              }
            >
              {Object.entries(
                RECURRING_INVOICE_FREQUENCY_CONFIG,
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
            label="Start date"
            htmlFor="recurringInvoiceStartDate"
          >
            <Input
              id="recurringInvoiceStartDate"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Next invoice date"
            htmlFor="recurringInvoiceNextDate"
          >
            <Input
              id="recurringInvoiceNextDate"
              type="date"
              value={nextInvoiceDate}
              onChange={(event) =>
                setNextInvoiceDate(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="End date"
            htmlFor="recurringInvoiceEndDate"
            optional
          >
            <Input
              id="recurringInvoiceEndDate"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Invoice item
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_8rem_12rem]">
          <FormField
            label="Description"
            htmlFor="recurringInvoiceDescription"
            error={
              submitted && !description.trim()
                ? "Enter an item description"
                : undefined
            }
          >
            <Input
              id="recurringInvoiceDescription"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Quantity"
            htmlFor="recurringInvoiceQuantity"
          >
            <Input
              id="recurringInvoiceQuantity"
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
            />
          </FormField>

          <FormField
            label="Unit price"
            htmlFor="recurringInvoiceUnitPrice"
          >
            <Input
              id="recurringInvoiceUnitPrice"
              type="number"
              min="1"
              value={unitPrice}
              onChange={(event) =>
                setUnitPrice(event.target.value)
              }
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Totals and automation
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Tax rate"
            htmlFor="recurringInvoiceTaxRate"
          >
            <Input
              id="recurringInvoiceTaxRate"
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
            htmlFor="recurringInvoiceDiscount"
          >
            <Input
              id="recurringInvoiceDiscount"
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

        <div className="mt-4 rounded-control bg-info-muted p-4">
          <p className="text-xs text-info">
            Generated invoice total
          </p>

          <p className="mt-1 text-xl font-bold text-info">
            {formatPKR(totals.totalAmount)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-5 rounded-control border border-border p-4">
          <div>
            <p className="text-sm font-semibold">
              Send generated invoices automatically
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Deliver each generated invoice without manual finance review.
            </p>
          </div>

          <Switch
            checked={autoSend}
            onCheckedChange={setAutoSend}
            ariaLabel="Automatically send recurring invoices"
          />
        </div>
      </section>

      <FormField
        label="Schedule note"
        htmlFor="recurringInvoiceNote"
        optional
      >
        <Textarea
          id="recurringInvoiceNote"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Add billing, approval or delivery context..."
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
          {recurringInvoice
            ? "Save schedule"
            : "Create schedule"}
        </Button>
      </div>
    </form>
  );
}