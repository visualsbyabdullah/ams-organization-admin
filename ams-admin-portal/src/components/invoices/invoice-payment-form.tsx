"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  INVOICE_PAYMENT_METHOD_CONFIG,
} from "@/config/invoices";
import { formatPKR } from "@/lib/currency";
import type {
  Invoice,
  InvoicePaymentMethod,
  InvoicePaymentValues,
} from "@/types/invoice";

type InvoicePaymentFormProps = {
  invoice: Invoice;
  onCancel: () => void;
  onSubmit: (
    invoiceId: string,
    values: InvoicePaymentValues,
  ) => void;
};

export function InvoicePaymentForm({
  invoice,
  onCancel,
  onSubmit,
}: InvoicePaymentFormProps) {
  const [amount, setAmount] = useState(
    String(invoice.balanceAmount),
  );

  const [paymentDate, setPaymentDate] =
    useState(
      new Date().toISOString().slice(0, 10),
    );

  const [paymentMethod, setPaymentMethod] =
    useState<InvoicePaymentMethod>(
      "bank_transfer",
    );

  const [paymentReference, setPaymentReference] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const amountValue = Math.max(
    Number(amount) || 0,
    0,
  );

  const isValid = Boolean(
    amountValue > 0 &&
      amountValue <= invoice.balanceAmount &&
      paymentDate,
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    onSubmit(invoice.id, {
      amount: amountValue,
      paymentDate,
      paymentMethod,
      paymentReference:
        paymentReference.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-control bg-canvas p-4">
          <p className="text-xs text-text-muted">
            Invoice total
          </p>

          <p className="mt-1 font-bold">
            {formatPKR(invoice.totalAmount)}
          </p>
        </div>

        <div className="rounded-control bg-success-muted p-4">
          <p className="text-xs text-success">
            Previously paid
          </p>

          <p className="mt-1 font-bold text-success">
            {formatPKR(invoice.paidAmount)}
          </p>
        </div>

        <div className="rounded-control bg-warning-muted p-4">
          <p className="text-xs text-warning">
            Balance
          </p>

          <p className="mt-1 font-bold text-warning">
            {formatPKR(invoice.balanceAmount)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Payment amount"
          htmlFor="invoicePaymentAmount"
          error={
            submitted &&
            (amountValue <= 0 ||
              amountValue > invoice.balanceAmount)
              ? `Enter an amount up to ${formatPKR(
                  invoice.balanceAmount,
                )}`
              : undefined
          }
        >
          <Input
            id="invoicePaymentAmount"
            type="number"
            min="1"
            max={invoice.balanceAmount}
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Payment date"
          htmlFor="invoicePaymentDate"
          error={
            submitted && !paymentDate
              ? "Select a payment date"
              : undefined
          }
        >
          <Input
            id="invoicePaymentDate"
            type="date"
            value={paymentDate}
            onChange={(event) =>
              setPaymentDate(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Payment method"
          htmlFor="invoicePaymentMethod"
        >
          <Select
            id="invoicePaymentMethod"
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(
                event.target
                  .value as InvoicePaymentMethod,
              )
            }
          >
            {Object.entries(
              INVOICE_PAYMENT_METHOD_CONFIG,
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
          label="Payment reference"
          htmlFor="invoicePaymentReference"
          optional
        >
          <Input
            id="invoicePaymentReference"
            value={paymentReference}
            onChange={(event) =>
              setPaymentReference(
                event.target.value,
              )
            }
            placeholder="Bank, card, cheque or receipt reference"
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          Record payment
        </Button>
      </div>
    </form>
  );
}