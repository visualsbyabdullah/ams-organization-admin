"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SHIFT_CATEGORY_CONFIG } from "@/config/schedules";
import type { ShiftCategory, ShiftStatus, ShiftTemplate } from "@/types/schedule";

type ShiftTemplateFormProps = {
  shift?: ShiftTemplate;
  onCancel: () => void;
  onSave: (shift: ShiftTemplate) => void;
};

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

function calculateWorkingMinutes(
  startTime: string,
  endTime: string,
  breakMinutes: number,
) {
  const start = timeToMinutes(startTime);

  let end = timeToMinutes(endTime);

  if (end <= start) {
    end += 24 * 60;
  }

  return Math.max(end - start - breakMinutes, 0);
}

export function ShiftTemplateForm({ shift, onCancel, onSave }: ShiftTemplateFormProps) {
  const [name, setName] = useState(shift?.name ?? "");

  const [code, setCode] = useState(shift?.code ?? "");

  const [category, setCategory] = useState<ShiftCategory>(shift?.category ?? "standard");

  const [startTime, setStartTime] = useState(shift?.startTime ?? "09:00");

  const [endTime, setEndTime] = useState(shift?.endTime ?? "18:00");

  const [breakMinutes, setBreakMinutes] = useState(String(shift?.breakMinutes ?? 60));

  const [status, setStatus] = useState<ShiftStatus>(shift?.status ?? "active");

  const [submitted, setSubmitted] = useState(false);

  const isValid = Boolean(name.trim() && code.trim() && startTime && endTime);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const parsedBreakMinutes = Math.max(Number(breakMinutes) || 0, 0);

    onSave({
      id: shift?.id ?? crypto.randomUUID(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category,
      startTime,
      endTime,
      breakMinutes: parsedBreakMinutes,
      workingMinutes: calculateWorkingMinutes(startTime, endTime, parsedBreakMinutes),
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Shift name"
        htmlFor="shiftName"
        error={submitted && !name.trim() ? "Enter a shift name" : undefined}
      >
        <Input
          id="shiftName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Morning Support"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Shift code"
          htmlFor="shiftCode"
          error={submitted && !code.trim() ? "Enter a shift code" : undefined}
        >
          <Input
            id="shiftCode"
            value={code}
            maxLength={5}
            onChange={(event) => setCode(event.target.value)}
            placeholder="MOR"
          />
        </FormField>

        <FormField label="Category" htmlFor="shiftCategory">
          <Select
            id="shiftCategory"
            value={category}
            onChange={(event) => setCategory(event.target.value as ShiftCategory)}
          >
            {Object.entries(SHIFT_CATEGORY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Start time" htmlFor="shiftStart">
          <Input
            id="shiftStart"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </FormField>

        <FormField label="End time" htmlFor="shiftEnd">
          <Input
            id="shiftEnd"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </FormField>

        <FormField
          label="Break duration"
          htmlFor="shiftBreak"
          description="Minutes excluded from working hours."
        >
          <Input
            id="shiftBreak"
            type="number"
            min="0"
            value={breakMinutes}
            onChange={(event) => setBreakMinutes(event.target.value)}
          />
        </FormField>

        <FormField label="Shift status" htmlFor="shiftStatus">
          <Select
            id="shiftStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as ShiftStatus)}
          >
            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{shift ? "Save shift" : "Create shift"}</Button>
      </div>
    </form>
  );
}
