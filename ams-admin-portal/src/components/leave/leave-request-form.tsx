"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LEAVE_TYPE_CONFIG } from "@/config/leave";
import { EMPLOYEES } from "@/data/employees";
import type { LeaveRequest, LeaveType } from "@/types/leave";

type LeaveRequestFormProps = {
  selectedBranchId: string;
  onCancel: () => void;
  onCreate: (request: LeaveRequest) => void;
};

function calculateLeaveDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);

  const end = new Date(`${endDate}T00:00:00`);

  if (end < start) {
    return 0;
  }

  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function LeaveRequestForm({
  selectedBranchId,
  onCancel,
  onCreate,
}: LeaveRequestFormProps) {
  const [employeeId, setEmployeeId] = useState("");

  const [type, setType] = useState<LeaveType>("annual");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [reason, setReason] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const availableEmployees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          selectedBranchId === "all" || employee.branchId === selectedBranchId,
      ),
    [selectedBranchId],
  );

  const totalDays = calculateLeaveDays(startDate, endDate);

  const isValid = Boolean(
    employeeId && startDate && endDate && totalDays > 0 && reason.trim(),
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

    onCreate({
      id: crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      type,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
      status: "pending",
      requestedAt: new Date().toISOString().slice(0, 10),
      managerNote: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Employee"
        htmlFor="leaveEmployee"
        error={submitted && !employeeId ? "Select an employee" : undefined}
      >
        <Select
          id="leaveEmployee"
          value={employeeId}
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

      <FormField label="Leave type" htmlFor="leaveType">
        <Select
          id="leaveType"
          value={type}
          onChange={(event) => setType(event.target.value as LeaveType)}
        >
          {Object.entries(LEAVE_TYPE_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>
              {config.label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="leaveStart">
          <Input
            id="leaveStart"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </FormField>

        <FormField
          label="End date"
          htmlFor="leaveEnd"
          error={submitted && totalDays === 0 ? "Select a valid end date" : undefined}
        >
          <Input
            id="leaveEnd"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </FormField>
      </div>

      {totalDays > 0 && (
        <div className="rounded-control bg-canvas px-4 py-3">
          <p className="text-xs text-text-muted">Leave duration</p>

          <p className="mt-1 text-sm font-bold">
            {totalDays} {totalDays === 1 ? "day" : "days"}
          </p>
        </div>
      )}

      <FormField
        label="Reason"
        htmlFor="leaveReason"
        error={submitted && !reason.trim() ? "Enter a leave reason" : undefined}
      >
        <Textarea
          id="leaveReason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain why leave is required..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">Submit leave request</Button>
      </div>
    </form>
  );
}
