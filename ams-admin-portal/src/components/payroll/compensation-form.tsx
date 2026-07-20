"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COMPENSATION_CHANGE_REASON_CONFIG } from "@/config/compensation";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  CompensationChangeReason,
  CompensationRecord,
  CompensationStatus,
  PayFrequency,
} from "@/types/compensation";

type CompensationFormProps = {
  record?: CompensationRecord;
  selectedBranchId: string;
  assignedEmployeeIds: string[];
  onCancel: () => void;
  onSave: (record: CompensationRecord) => void;
};

export function CompensationForm({
  record,
  selectedBranchId,
  assignedEmployeeIds,
  onCancel,
  onSave,
}: CompensationFormProps) {
  const [employeeId, setEmployeeId] = useState(record?.employeeId ?? "");

  const [baseSalary, setBaseSalary] = useState(String(record?.baseSalary ?? 0));

  const [housingAllowance, setHousingAllowance] = useState(
    String(record?.housingAllowance ?? 0),
  );

  const [transportAllowance, setTransportAllowance] = useState(
    String(record?.transportAllowance ?? 0),
  );

  const [medicalAllowance, setMedicalAllowance] = useState(
    String(record?.medicalAllowance ?? 0),
  );

  const [otherAllowance, setOtherAllowance] = useState(
    String(record?.otherAllowance ?? 0),
  );

  const [bonusTargetPercentage, setBonusTargetPercentage] = useState(
    String(record?.bonusTargetPercentage ?? 0),
  );

  const [payFrequency, setPayFrequency] = useState<PayFrequency>(
    record?.payFrequency ?? "monthly",
  );

  const [status, setStatus] = useState<CompensationStatus>(
    record?.status ?? "pending_review",
  );

  const [effectiveDate, setEffectiveDate] = useState(
    record?.effectiveDate ?? "2026-08-01",
  );

  const [nextReviewDate, setNextReviewDate] = useState(
    record?.nextReviewDate ?? "2027-08-01",
  );

  const [changeReason, setChangeReason] = useState<CompensationChangeReason>(
    record?.lastChangeReason ?? "annual_review",
  );

  const [note, setNote] = useState(record?.note ?? "");

  const [submitted, setSubmitted] = useState(false);

  const availableEmployees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          (selectedBranchId === "all" || employee.branchId === selectedBranchId) &&
          (record?.employeeId === employee.id ||
            !assignedEmployeeIds.includes(employee.id)),
      ),
    [assignedEmployeeIds, record?.employeeId, selectedBranchId],
  );

  const isValid = Boolean(
    employeeId && Number(baseSalary) > 0 && effectiveDate && nextReviewDate,
  );

  function toPositiveNumber(value: string) {
    return Math.max(Number(value) || 0, 0);
  }

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

    onSave({
      id: record?.id ?? crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      baseSalary: toPositiveNumber(baseSalary),
      housingAllowance: toPositiveNumber(housingAllowance),
      transportAllowance: toPositiveNumber(transportAllowance),
      medicalAllowance: toPositiveNumber(medicalAllowance),
      otherAllowance: toPositiveNumber(otherAllowance),
      bonusTargetPercentage: toPositiveNumber(bonusTargetPercentage),
      payFrequency,
      status,
      effectiveDate,
      nextReviewDate,
      lastChangeReason: changeReason,
      previousBaseSalary: record?.baseSalary ?? 0,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const totalFixedCompensation =
    toPositiveNumber(baseSalary) +
    toPositiveNumber(housingAllowance) +
    toPositiveNumber(transportAllowance) +
    toPositiveNumber(medicalAllowance) +
    toPositiveNumber(otherAllowance);

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Employee"
          htmlFor="compensationEmployee"
          error={submitted && !employeeId ? "Select an employee" : undefined}
        >
          <Select
            id="compensationEmployee"
            value={employeeId}
            disabled={Boolean(record)}
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

        <FormField label="Compensation status" htmlFor="compensationStatus">
          <Select
            id="compensationStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as CompensationStatus)}
          >
            <option value="active">Active</option>

            <option value="pending_review">Pending review</option>

            <option value="archived">Archived</option>
          </Select>
        </FormField>

        <FormField
          label="Base salary"
          htmlFor="baseSalary"
          error={
            submitted && Number(baseSalary) <= 0 ? "Enter a valid base salary" : undefined
          }
        >
          <Input
            id="baseSalary"
            type="number"
            min="0"
            value={baseSalary}
            onChange={(event) => setBaseSalary(event.target.value)}
          />
        </FormField>

        <FormField label="Pay frequency" htmlFor="payFrequency">
          <Select
            id="payFrequency"
            value={payFrequency}
            onChange={(event) => setPayFrequency(event.target.value as PayFrequency)}
          >
            <option value="monthly">Monthly</option>

            <option value="hourly">Hourly</option>
          </Select>
        </FormField>
      </section>

      <section>
        <h3 className="font-bold">Fixed allowances</h3>

        <p className="mt-1 text-sm text-text-muted">
          Configure recurring compensation components paid with base salary.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Housing allowance" htmlFor="housingAllowance">
            <Input
              id="housingAllowance"
              type="number"
              min="0"
              value={housingAllowance}
              onChange={(event) => setHousingAllowance(event.target.value)}
            />
          </FormField>

          <FormField label="Transport allowance" htmlFor="transportAllowance">
            <Input
              id="transportAllowance"
              type="number"
              min="0"
              value={transportAllowance}
              onChange={(event) => setTransportAllowance(event.target.value)}
            />
          </FormField>

          <FormField label="Medical allowance" htmlFor="medicalAllowance">
            <Input
              id="medicalAllowance"
              type="number"
              min="0"
              value={medicalAllowance}
              onChange={(event) => setMedicalAllowance(event.target.value)}
            />
          </FormField>

          <FormField label="Other allowance" htmlFor="otherAllowance">
            <Input
              id="otherAllowance"
              type="number"
              min="0"
              value={otherAllowance}
              onChange={(event) => setOtherAllowance(event.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-4 rounded-control bg-success-muted p-4">
          <p className="text-xs font-medium text-success">
            Total fixed monthly compensation
          </p>

          <p className="mt-1 text-xl font-bold text-success">
            PKR {totalFixedCompensation.toLocaleString("en-PK")}
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Bonus target"
          htmlFor="bonusTarget"
          description="Target percentage of annual base salary."
        >
          <Input
            id="bonusTarget"
            type="number"
            min="0"
            value={bonusTargetPercentage}
            onChange={(event) => setBonusTargetPercentage(event.target.value)}
          />
        </FormField>

        <FormField label="Change reason" htmlFor="changeReason">
          <Select
            id="changeReason"
            value={changeReason}
            onChange={(event) =>
              setChangeReason(event.target.value as CompensationChangeReason)
            }
          >
            {Object.entries(COMPENSATION_CHANGE_REASON_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Effective date" htmlFor="compensationEffectiveDate">
          <Input
            id="compensationEffectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(event) => setEffectiveDate(event.target.value)}
          />
        </FormField>

        <FormField label="Next review date" htmlFor="nextReviewDate">
          <Input
            id="nextReviewDate"
            type="date"
            min={effectiveDate}
            value={nextReviewDate}
            onChange={(event) => setNextReviewDate(event.target.value)}
          />
        </FormField>
      </section>

      <FormField label="Compensation note" htmlFor="compensationNote" optional>
        <Textarea
          id="compensationNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add internal compensation review context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{record ? "Save compensation" : "Add compensation"}</Button>
      </div>
    </form>
  );
}
