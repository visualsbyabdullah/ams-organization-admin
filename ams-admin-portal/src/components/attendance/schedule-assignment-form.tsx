"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYEES } from "@/data/employees";
import { cn } from "@/lib/utils";
import type { ScheduleAssignment, ShiftTemplate } from "@/types/schedule";

type ScheduleAssignmentFormProps = {
  shifts: ShiftTemplate[];
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (assignments: ScheduleAssignment[]) => void;
};

const DAY_OPTIONS = [
  {
    value: 1,
    label: "Mon",
  },
  {
    value: 2,
    label: "Tue",
  },
  {
    value: 3,
    label: "Wed",
  },
  {
    value: 4,
    label: "Thu",
  },
  {
    value: 5,
    label: "Fri",
  },
  {
    value: 6,
    label: "Sat",
  },
  {
    value: 0,
    label: "Sun",
  },
] as const;

function formatLocalDate(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function generateDates(startDate: string, endDate: string, workingDays: number[]) {
  const dates: string[] = [];

  const cursor = new Date(`${startDate}T00:00:00`);

  const end = new Date(`${endDate}T00:00:00`);

  let safety = 0;

  while (cursor <= end && safety < 62) {
    if (workingDays.includes(cursor.getDay())) {
      dates.push(formatLocalDate(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);

    safety += 1;
  }

  return dates;
}

export function ScheduleAssignmentForm({
  shifts,
  selectedBranchId,
  onCancel,
  onSave,
}: ScheduleAssignmentFormProps) {
  const [employeeId, setEmployeeId] = useState("");

  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? "");

  const [startDate, setStartDate] = useState("2026-07-13");

  const [endDate, setEndDate] = useState("2026-07-19");

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const [note, setNote] = useState("");

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
    employeeId && shiftId && startDate && endDate && selectedDays.length > 0,
  );

  function toggleDay(day: number) {
    setSelectedDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day],
    );
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

    const dates = generateDates(startDate, endDate, selectedDays);

    const assignments = dates.map((date) => ({
      id: crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      date,
      shiftId,
      status: "scheduled" as const,
      note: note.trim(),
    }));

    onSave(assignments);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Employee"
        htmlFor="scheduleEmployee"
        error={submitted && !employeeId ? "Select an employee" : undefined}
      >
        <Select
          id="scheduleEmployee"
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

      <FormField
        label="Shift template"
        htmlFor="scheduleShift"
        error={submitted && !shiftId ? "Select a shift" : undefined}
      >
        <Select
          id="scheduleShift"
          value={shiftId}
          onChange={(event) => setShiftId(event.target.value)}
        >
          {shifts.map((shift) => (
            <option key={shift.id} value={shift.id}>
              {shift.name} — {shift.startTime} to {shift.endTime}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="scheduleStart">
          <Input
            id="scheduleStart"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </FormField>

        <FormField label="End date" htmlFor="scheduleEnd">
          <Input
            id="scheduleEnd"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label="Working days"
        error={
          submitted && selectedDays.length === 0 ? "Select at least one day" : undefined
        }
      >
        <div className="grid grid-cols-7 gap-2">
          {DAY_OPTIONS.map((day) => {
            const selected = selectedDays.includes(day.value);

            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "rounded-control border px-2 py-3 text-xs font-semibold transition",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-text-muted hover:border-primary/40 hover:text-text",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Schedule note" htmlFor="scheduleNote" optional>
        <Textarea
          id="scheduleNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add instructions or context for this schedule..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">Assign schedule</Button>
      </div>
    </form>
  );
}
