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
import { Textarea } from "@/components/ui/textarea";
import {
  LOAN_REPAYMENT_METHOD_CONFIG,
  LOAN_TYPE_CONFIG,
} from "@/config/loans";
import { EMPLOYEES } from "@/data/employees";
import { formatPKR } from "@/lib/currency";
import type {
  EmployeeLoan,
  EmployeeLoanType,
  LoanRepaymentMethod,
} from "@/types/loan";

type LoanApplicationFormProps = {
  selectedBranchId: string;
  onCancel: () => void;
  onCreate: (
    loan: EmployeeLoan,
  ) => void;
};

export function LoanApplicationForm({
  selectedBranchId,
  onCancel,
  onCreate,
}: LoanApplicationFormProps) {
  const [employeeId, setEmployeeId] =
    useState("");

  const [type, setType] =
    useState<EmployeeLoanType>(
      "personal",
    );

  const [amount, setAmount] =
    useState("100000");

  const [
    installmentCount,
    setInstallmentCount,
  ] = useState("10");

  const [
    repaymentMethod,
    setRepaymentMethod,
  ] = useState<LoanRepaymentMethod>(
    "payroll_deduction",
  );

  const [
    repaymentStartDate,
    setRepaymentStartDate,
  ] = useState("2026-08-01");

  const [purpose, setPurpose] =
    useState("");

  const [note, setNote] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const availableEmployees =
    useMemo(
      () =>
        EMPLOYEES.filter(
          (employee) =>
            selectedBranchId === "all" ||
            employee.branchId ===
              selectedBranchId,
        ),
      [selectedBranchId],
    );

  const amountValue = Math.max(
    Number(amount) || 0,
    0,
  );

  const installmentCountValue =
    Math.max(
      Number(installmentCount) || 0,
      0,
    );

  const installmentAmount =
    installmentCountValue > 0
      ? Math.ceil(
          amountValue /
            installmentCountValue,
        )
      : 0;

  const isValid = Boolean(
    employeeId &&
      amountValue > 0 &&
      installmentCountValue > 0 &&
      repaymentStartDate &&
      purpose.trim(),
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const employee =
      EMPLOYEES.find(
        (item) =>
          item.id === employeeId,
      );

    if (!employee) {
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      type,
      status: "pending_approval",
      requestedAmount: amountValue,
      approvedAmount: 0,
      installmentCount:
        installmentCountValue,
      installmentAmount,
      paidAmount: 0,
      outstandingBalance: 0,
      overdueAmount: 0,
      repaymentMethod,
      repaymentStartDate,
      nextDueDate:
        repaymentStartDate,
      requestDate: new Date()
        .toISOString()
        .slice(0, 10),
      purpose: purpose.trim(),
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Employee"
          htmlFor="loanEmployee"
          error={
            submitted && !employeeId
              ? "Select an employee"
              : undefined
          }
        >
          <Select
            id="loanEmployee"
            value={employeeId}
            onChange={(event) =>
              setEmployeeId(
                event.target.value,
              )
            }
          >
            <option value="">
              Select employee
            </option>

            {availableEmployees.map(
              (employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name} —{" "}
                  {employee.employeeCode}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField
          label="Loan type"
          htmlFor="loanType"
        >
          <Select
            id="loanType"
            value={type}
            onChange={(event) =>
              setType(
                event.target
                  .value as EmployeeLoanType,
              )
            }
          >
            {Object.entries(
              LOAN_TYPE_CONFIG,
            ).map(
              ([value, config]) => (
                <option
                  key={value}
                  value={value}
                >
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField
          label="Requested amount"
          htmlFor="loanAmount"
          error={
            submitted &&
            amountValue <= 0
              ? "Enter a valid amount"
              : undefined
          }
        >
          <Input
            id="loanAmount"
            type="number"
            min="1"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Installments"
          htmlFor="loanInstallments"
          error={
            submitted &&
            installmentCountValue <= 0
              ? "Enter installment count"
              : undefined
          }
        >
          <Input
            id="loanInstallments"
            type="number"
            min="1"
            max="60"
            value={installmentCount}
            onChange={(event) =>
              setInstallmentCount(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Repayment method"
          htmlFor="loanRepaymentMethod"
        >
          <Select
            id="loanRepaymentMethod"
            value={repaymentMethod}
            onChange={(event) =>
              setRepaymentMethod(
                event.target
                  .value as LoanRepaymentMethod,
              )
            }
          >
            {Object.entries(
              LOAN_REPAYMENT_METHOD_CONFIG,
            ).map(
              ([value, config]) => (
                <option
                  key={value}
                  value={value}
                >
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField
          label="Repayment start"
          htmlFor="loanRepaymentStart"
        >
          <Input
            id="loanRepaymentStart"
            type="date"
            value={repaymentStartDate}
            onChange={(event) =>
              setRepaymentStartDate(
                event.target.value,
              )
            }
          />
        </FormField>
      </div>

      <div className="rounded-control bg-info-muted p-4">
        <p className="text-xs font-medium text-info">
          Estimated installment
        </p>

        <p className="mt-1 text-xl font-bold text-info">
          {formatPKR(
            installmentAmount,
          )}
        </p>

        <p className="mt-1 text-xs text-info">
          Per installment across{" "}
          {installmentCountValue || 0}{" "}
          payments
        </p>
      </div>

      <FormField
        label="Loan purpose"
        htmlFor="loanPurpose"
        error={
          submitted && !purpose.trim()
            ? "Enter the loan purpose"
            : undefined
        }
      >
        <Textarea
          id="loanPurpose"
          value={purpose}
          onChange={(event) =>
            setPurpose(
              event.target.value,
            )
          }
          placeholder="Explain why this employee loan or salary advance is required..."
        />
      </FormField>

      <FormField
        label="Internal note"
        htmlFor="loanNote"
        optional
      >
        <Textarea
          id="loanNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
          placeholder="Add manager, finance or repayment context..."
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
          Submit loan request
        </Button>
      </div>
    </form>
  );
}
