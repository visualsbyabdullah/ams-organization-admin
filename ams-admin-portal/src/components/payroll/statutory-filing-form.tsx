"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  STATUTORY_FILING_CATEGORY_CONFIG,
  STATUTORY_FILING_STATUS_CONFIG,
} from "@/config/payroll-statutory";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  StatutoryFiling,
  StatutoryFilingCategory,
  StatutoryFilingStatus,
} from "@/types/payroll-statutory";

type StatutoryFilingFormProps = {
  selectedBranchId: string;
  filing?: StatutoryFiling;
  onCancel: () => void;
  onSave: (filing: StatutoryFiling) => void;
};

export function StatutoryFilingForm({
  selectedBranchId,
  filing,
  onCancel,
  onSave,
}: StatutoryFilingFormProps) {
  const [branchId, setBranchId] = useState(
    filing?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );

  const [period, setPeriod] = useState(filing?.period ?? "2026-07");

  const [category, setCategory] = useState<StatutoryFilingCategory>(
    filing?.category ?? "income_tax",
  );

  const [amount, setAmount] = useState(String(filing?.amount ?? 0));

  const [dueDate, setDueDate] = useState(filing?.dueDate ?? "2026-08-15");

  const [status, setStatus] = useState<StatutoryFilingStatus>(filing?.status ?? "draft");

  const [referenceNumber, setReferenceNumber] = useState(filing?.referenceNumber ?? "");

  const [note, setNote] = useState(filing?.note ?? "");

  const [submitted, setSubmitted] = useState(false);

  const branchOptions = useMemo(() => {
    const branches = new Map<string, string>();

    EMPLOYEES.forEach((employee) => {
      branches.set(employee.branchId, employee.branchName);
    });

    return Array.from(branches.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, []);

  const isValid = Boolean(branchId && period && Number(amount) > 0 && dueDate);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branchName =
      branchOptions.find((branch) => branch.id === branchId)?.name ?? "Selected Branch";

    onSave({
      id: filing?.id ?? crypto.randomUUID(),
      branchId,
      branchName,
      period,
      category,
      amount: Math.max(Number(amount) || 0, 0),
      dueDate,
      status,
      referenceNumber: referenceNumber.trim(),
      createdAt: filing?.createdAt ?? new Date().toISOString().slice(0, 10),
      createdBy: filing?.createdBy ?? CURRENT_ADMIN.name,
      submittedAt: filing?.submittedAt,
      acceptedAt: filing?.acceptedAt,
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Branch"
          htmlFor="statutoryBranch"
          error={submitted && !branchId ? "Select a branch" : undefined}
        >
          <Select
            id="statutoryBranch"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
          >
            <option value="">Select branch</option>

            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Payroll period" htmlFor="statutoryPeriod">
          <Input
            id="statutoryPeriod"
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
        </FormField>

        <FormField label="Filing category" htmlFor="statutoryCategory">
          <Select
            id="statutoryCategory"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as StatutoryFilingCategory)
            }
          >
            {Object.entries(STATUTORY_FILING_CATEGORY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Filing amount"
          htmlFor="statutoryAmount"
          error={submitted && Number(amount) <= 0 ? "Enter a valid amount" : undefined}
        >
          <Input
            id="statutoryAmount"
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </FormField>

        <FormField label="Due date" htmlFor="statutoryDueDate">
          <Input
            id="statutoryDueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </FormField>

        <FormField label="Filing status" htmlFor="statutoryStatus">
          <Select
            id="statutoryStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatutoryFilingStatus)}
          >
            {Object.entries(STATUTORY_FILING_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Reference number" htmlFor="statutoryReference" optional>
        <Input
          id="statutoryReference"
          value={referenceNumber}
          onChange={(event) => setReferenceNumber(event.target.value)}
          placeholder="Submission or acknowledgement reference..."
        />
      </FormField>

      <FormField label="Internal note" htmlFor="statutoryNote" optional>
        <Textarea
          id="statutoryNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add reconciliation, registration or filing context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{filing ? "Save filing" : "Create filing"}</Button>
      </div>
    </form>
  );
}
