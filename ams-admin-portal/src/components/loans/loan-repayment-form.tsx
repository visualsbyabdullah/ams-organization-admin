"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOAN_REPAYMENT_SOURCE_CONFIG } from "@/config/loan-repayments";
import { formatPKR } from "@/lib/currency";
import type {
  LoanRepayment,
  LoanRepaymentPaymentValues,
  LoanRepaymentSource,
} from "@/types/loan-repayment";

type LoanRepaymentFormProps = {
  repayment: LoanRepayment;
  onCancel: () => void;
  onSubmit: (repaymentId: string, values: LoanRepaymentPaymentValues) => void;
};

export function LoanRepaymentForm({
  repayment,
  onCancel,
  onSubmit,
}: LoanRepaymentFormProps) {
  const [paidAmount, setPaidAmount] = useState(String(repayment.balanceAmount));

  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));

  const [source, setSource] = useState<LoanRepaymentSource>(repayment.source);

  const [referenceNumber, setReferenceNumber] = useState(repayment.referenceNumber);

  const [note, setNote] = useState(repayment.note);

  const [submitted, setSubmitted] = useState(false);

  const paymentValue = Math.max(Number(paidAmount) || 0, 0);

  const isValid = Boolean(
    paymentValue > 0 && paymentValue <= repayment.balanceAmount && paidDate,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    onSubmit(repayment.id, {
      paidAmount: paymentValue,
      paidDate,
      source,
      referenceNumber: referenceNumber.trim(),
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-control bg-canvas p-4">
          <p className="text-xs text-text-muted">Installment</p>

          <p className="mt-1 font-bold">{formatPKR(repayment.amount)}</p>
        </div>

        <div className="rounded-control bg-info-muted p-4">
          <p className="text-xs text-info">Previously paid</p>

          <p className="mt-1 font-bold text-info">{formatPKR(repayment.paidAmount)}</p>
        </div>

        <div className="rounded-control bg-warning-muted p-4">
          <p className="text-xs text-warning">Remaining</p>

          <p className="mt-1 font-bold text-warning">
            {formatPKR(repayment.balanceAmount)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Payment amount"
          htmlFor="repaymentPaidAmount"
          error={
            submitted && (paymentValue <= 0 || paymentValue > repayment.balanceAmount)
              ? `Enter an amount up to ${formatPKR(repayment.balanceAmount)}`
              : undefined
          }
        >
          <Input
            id="repaymentPaidAmount"
            type="number"
            min="1"
            max={repayment.balanceAmount}
            value={paidAmount}
            onChange={(event) => setPaidAmount(event.target.value)}
          />
        </FormField>

        <FormField
          label="Payment date"
          htmlFor="repaymentPaidDate"
          error={submitted && !paidDate ? "Select a payment date" : undefined}
        >
          <Input
            id="repaymentPaidDate"
            type="date"
            value={paidDate}
            onChange={(event) => setPaidDate(event.target.value)}
          />
        </FormField>

        <FormField label="Payment source" htmlFor="repaymentSource">
          <Select
            id="repaymentSource"
            value={source}
            onChange={(event) => setSource(event.target.value as LoanRepaymentSource)}
          >
            {Object.entries(LOAN_REPAYMENT_SOURCE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Reference number" htmlFor="repaymentReference" optional>
          <Input
            id="repaymentReference"
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
            placeholder="Payroll, bank or receipt reference"
          />
        </FormField>
      </div>

      <FormField label="Payment note" htmlFor="repaymentNote" optional>
        <Textarea
          id="repaymentNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add collection, payroll or employee context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">Record payment</Button>
      </div>
    </form>
  );
}
