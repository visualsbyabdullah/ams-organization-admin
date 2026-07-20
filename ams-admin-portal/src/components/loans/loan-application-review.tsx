"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LOAN_REPAYMENT_METHOD_CONFIG,
  LOAN_STATUS_CONFIG,
  LOAN_TYPE_CONFIG,
} from "@/config/loans";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { EmployeeLoan } from "@/types/loan";

type LoanApplicationReviewProps = {
  loan: EmployeeLoan;
  employeeName: string;
  employeeCode: string;
  branchName: string;
  designation: string;
  onApprove: (
    loanId: string,
    values: {
      approvedAmount: number;
      installmentCount: number;
      repaymentStartDate: string;
      note: string;
    },
  ) => void;
  onReject: (loanId: string, note: string) => void;
  onReopen: (loanId: string) => void;
};

export function LoanApplicationReview({
  loan,
  employeeName,
  employeeCode,
  branchName,
  designation,
  onApprove,
  onReject,
  onReopen,
}: LoanApplicationReviewProps) {
  const [approvedAmount, setApprovedAmount] = useState(
    String(loan.approvedAmount || loan.requestedAmount),
  );

  const [installmentCount, setInstallmentCount] = useState(String(loan.installmentCount));

  const [repaymentStartDate, setRepaymentStartDate] = useState(loan.repaymentStartDate);

  const [reviewNote, setReviewNote] = useState(loan.note);

  const [submitted, setSubmitted] = useState(false);

  const amountValue = Math.max(Number(approvedAmount) || 0, 0);

  const installmentCountValue = Math.max(Number(installmentCount) || 0, 0);

  const installmentAmount =
    installmentCountValue > 0 ? Math.ceil(amountValue / installmentCountValue) : 0;

  const validApproval = Boolean(
    amountValue > 0 && installmentCountValue > 0 && repaymentStartDate,
  );

  function handleApprove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!validApproval) {
      return;
    }

    onApprove(loan.id, {
      approvedAmount: amountValue,
      installmentCount: installmentCountValue,
      repaymentStartDate,
      note: reviewNote.trim(),
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{employeeName}</h3>

            <p className="mt-1 text-xs text-text-muted">
              {employeeCode} · {designation}
            </p>
          </div>

          <Badge variant={LOAN_STATUS_CONFIG[loan.status].badgeVariant}>
            {LOAN_STATUS_CONFIG[loan.status].label}
          </Badge>
        </div>

        <DetailGrid
          bordered={false}
          items={[
            {
              label: "Loan type",
              value: (
                <Badge variant={LOAN_TYPE_CONFIG[loan.type].badgeVariant}>
                  {LOAN_TYPE_CONFIG[loan.type].label}
                </Badge>
              ),
            },
            {
              label: "Branch",
              value: branchName,
            },
            {
              label: "Requested amount",
              value: (
                <span className="text-lg font-bold">
                  {formatPKR(loan.requestedAmount)}
                </span>
              ),
            },
            {
              label: "Request date",
              value: formatDate(loan.requestDate),
            },
            {
              label: "Repayment method",
              value: (
                <Badge
                  variant={
                    LOAN_REPAYMENT_METHOD_CONFIG[loan.repaymentMethod].badgeVariant
                  }
                >
                  {LOAN_REPAYMENT_METHOD_CONFIG[loan.repaymentMethod].label}
                </Badge>
              ),
            },
            {
              label: "Requested installments",
              value: loan.installmentCount,
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Loan purpose</h3>

        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {loan.purpose}
        </p>
      </section>

      {loan.status === "pending_approval" && (
        <form onSubmit={handleApprove} className="space-y-5">
          <div>
            <h3 className="font-bold">Approval configuration</h3>

            <p className="mt-1 text-sm text-text-muted">
              Confirm the approved amount, installment plan and repayment start.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Approved amount"
              htmlFor="approvedLoanAmount"
              error={
                submitted && amountValue <= 0
                  ? "Enter a valid approved amount"
                  : undefined
              }
            >
              <Input
                id="approvedLoanAmount"
                type="number"
                min="1"
                max={loan.requestedAmount}
                value={approvedAmount}
                onChange={(event) => setApprovedAmount(event.target.value)}
              />
            </FormField>

            <FormField
              label="Installments"
              htmlFor="approvedInstallments"
              error={
                submitted && installmentCountValue <= 0
                  ? "Enter installment count"
                  : undefined
              }
            >
              <Input
                id="approvedInstallments"
                type="number"
                min="1"
                max="60"
                value={installmentCount}
                onChange={(event) => setInstallmentCount(event.target.value)}
              />
            </FormField>

            <FormField
              label="Repayment start"
              htmlFor="approvedRepaymentStart"
              error={
                submitted && !repaymentStartDate ? "Select a repayment date" : undefined
              }
            >
              <Input
                id="approvedRepaymentStart"
                type="date"
                value={repaymentStartDate}
                onChange={(event) => setRepaymentStartDate(event.target.value)}
              />
            </FormField>
          </div>

          <div className="rounded-control bg-info-muted p-4">
            <p className="text-xs font-medium text-info">Calculated installment</p>

            <p className="mt-1 text-xl font-bold text-info">
              {formatPKR(installmentAmount)}
            </p>

            <p className="mt-1 text-xs text-info">
              Per installment across {installmentCountValue} payments
            </p>
          </div>

          <FormField label="Review note" htmlFor="loanReviewNote" optional>
            <Textarea
              id="loanReviewNote"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="Add approval conditions or finance notes..."
            />
          </FormField>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onReject(loan.id, reviewNote.trim())}
            >
              Reject application
            </Button>

            <Button type="submit">Approve application</Button>
          </div>
        </form>
      )}

      {loan.status === "approved" && (
        <section className="rounded-control bg-success-muted p-5">
          <h3 className="font-bold text-success">Application approved</h3>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-success">Approved amount</dt>

              <dd className="mt-1 text-sm font-bold text-success">
                {formatPKR(loan.approvedAmount)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-success">Installment</dt>

              <dd className="mt-1 text-sm font-bold text-success">
                {formatPKR(loan.installmentAmount)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-success">Approved by</dt>

              <dd className="mt-1 text-sm font-bold text-success">
                {loan.reviewedBy || "Organization admin"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-success">Approved date</dt>

              <dd className="mt-1 text-sm font-bold text-success">
                {loan.approvedAt ? formatDate(loan.approvedAt) : "Not recorded"}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {loan.status === "rejected" && (
        <section className="space-y-4">
          <div className="rounded-control bg-danger-muted p-5">
            <h3 className="font-bold text-danger">Application rejected</h3>

            <p className="mt-2 text-sm leading-6 text-danger">
              {loan.note || "No rejection note was provided."}
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onReopen(loan.id)}>
              Reopen application
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
