"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  PAYROLL_ADJUSTMENT_FREQUENCY_CONFIG,
  PAYROLL_ADJUSTMENT_TYPE_CONFIG,
} from "@/config/payroll-adjustments";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  PayrollAdjustment,
  PayrollAdjustmentFrequency,
  PayrollAdjustmentType,
} from "@/types/payroll-adjustment";

type PayrollAdjustmentFormProps = {
  selectedBranchId: string;
  adjustment?: PayrollAdjustment;
  onCancel: () => void;
  onSave: (adjustment: PayrollAdjustment) => void;
};

export function PayrollAdjustmentForm({
  selectedBranchId,
  adjustment,
  onCancel,
  onSave,
}: PayrollAdjustmentFormProps) {
  const [employeeId, setEmployeeId] = useState(adjustment?.employeeId ?? "");

  const [type, setType] = useState<PayrollAdjustmentType>(adjustment?.type ?? "bonus");

  const [amount, setAmount] = useState(String(adjustment?.amount ?? 0));

  const [effectivePeriod, setEffectivePeriod] = useState(
    adjustment?.effectivePeriod ?? "2026-07",
  );

  const [frequency, setFrequency] = useState<PayrollAdjustmentFrequency>(
    adjustment?.frequency ?? "one_time",
  );

  const [taxable, setTaxable] = useState(adjustment?.taxable ?? true);

  const [reason, setReason] = useState(adjustment?.reason ?? "");

  const [internalNote, setInternalNote] = useState(adjustment?.internalNote ?? "");

  const [submitted, setSubmitted] = useState(false);

  const availableEmployees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          selectedBranchId === "all" || employee.branchId === selectedBranchId,
      ),
    [selectedBranchId],
  );

  const isValid = Boolean(
    employeeId && Number(amount) > 0 && effectivePeriod && reason.trim(),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const employee = EMPLOYEES.find((item) => item.id === employeeId);

    if (!employee) {
      return;
    }

    const typeConfig = PAYROLL_ADJUSTMENT_TYPE_CONFIG[type];

    onSave({
      id: adjustment?.id ?? crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      type,
      direction: typeConfig.direction,
      status: adjustment?.status ?? "draft",
      frequency,
      amount: Math.max(Number(amount) || 0, 0),
      effectivePeriod,
      taxable,
      reason: reason.trim(),
      internalNote: internalNote.trim(),
      createdAt: adjustment?.createdAt ?? new Date().toISOString().slice(0, 10),
      createdBy: adjustment?.createdBy ?? CURRENT_ADMIN.name,
      reviewedAt: adjustment?.reviewedAt,
      reviewedBy: adjustment?.reviewedBy,
      appliedAt: adjustment?.appliedAt,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Employee"
          htmlFor="adjustmentEmployee"
          error={submitted && !employeeId ? "Select an employee" : undefined}
        >
          <Select
            id="adjustmentEmployee"
            value={employeeId}
            disabled={Boolean(adjustment)}
            onChange={(event) => setEmployeeId(event.target.value)}
          >
            <option value="">Select employee</option>

            {availableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} — {employee.employeeCode}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Adjustment type" htmlFor="adjustmentType">
          <Select
            id="adjustmentType"
            value={type}
            onChange={(event) => setType(event.target.value as PayrollAdjustmentType)}
          >
            {Object.entries(PAYROLL_ADJUSTMENT_TYPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Amount"
          htmlFor="adjustmentAmount"
          error={submitted && Number(amount) <= 0 ? "Enter a valid amount" : undefined}
        >
          <Input
            id="adjustmentAmount"
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </FormField>

        <FormField label="Effective payroll period" htmlFor="adjustmentPeriod">
          <Input
            id="adjustmentPeriod"
            type="month"
            value={effectivePeriod}
            onChange={(event) => setEffectivePeriod(event.target.value)}
          />
        </FormField>

        <FormField label="Frequency" htmlFor="adjustmentFrequency">
          <Select
            id="adjustmentFrequency"
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as PayrollAdjustmentFrequency)
            }
          >
            {Object.entries(PAYROLL_ADJUSTMENT_FREQUENCY_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>
      </section>

      <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
        <div>
          <p className="text-sm font-semibold">Taxable adjustment</p>

          <p className="mt-1 text-xs text-text-muted">
            Include this amount in taxable employee earnings.
          </p>
        </div>

        <Switch
          checked={taxable}
          onCheckedChange={setTaxable}
          ariaLabel="Taxable adjustment"
        />
      </div>

      <FormField
        label="Adjustment reason"
        htmlFor="adjustmentReason"
        error={submitted && !reason.trim() ? "Enter an adjustment reason" : undefined}
      >
        <Textarea
          id="adjustmentReason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain why this payroll adjustment is required..."
        />
      </FormField>

      <FormField label="Internal note" htmlFor="adjustmentInternalNote" optional>
        <Textarea
          id="adjustmentInternalNote"
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          placeholder="Add finance or approval context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">
          {adjustment ? "Save adjustment" : "Create adjustment"}
        </Button>
      </div>
    </form>
  );
}
