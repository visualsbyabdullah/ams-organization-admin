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
  ATTENDANCE_STATUS_CONFIG,
} from "@/config/attendance";
import { EMPLOYEES } from "@/data/employees";
import type {
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";

type AttendanceRecordFormProps = {
  record?: AttendanceRecord;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (
    record: AttendanceRecord,
  ) => void;
};

function calculateWorkedMinutes(
  checkIn: string,
  checkOut: string,
) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const [startHour, startMinute] =
    checkIn.split(":").map(Number);

  const [endHour, endMinute] =
    checkOut.split(":").map(Number);

  const start =
    startHour * 60 + startMinute;

  const end =
    endHour * 60 + endMinute;

  return Math.max(end - start, 0);
}

export function AttendanceRecordForm({
  record,
  selectedBranchId,
  onCancel,
  onSave,
}: AttendanceRecordFormProps) {
  const [employeeId, setEmployeeId] =
    useState(record?.employeeId ?? "");

  const [date, setDate] = useState(
    record?.date ?? "2026-07-16",
  );

  const [
    scheduledStart,
    setScheduledStart,
  ] = useState(
    record?.scheduledStart ?? "09:00",
  );

  const [
    scheduledEnd,
    setScheduledEnd,
  ] = useState(
    record?.scheduledEnd ?? "18:00",
  );

  const [checkIn, setCheckIn] =
    useState(record?.checkIn ?? "");

  const [checkOut, setCheckOut] =
    useState(record?.checkOut ?? "");

  const [status, setStatus] =
    useState<AttendanceStatus>(
      record?.status ?? "present",
    );

  const [note, setNote] = useState(
    record?.note ?? "",
  );

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

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!employeeId || !date) {
      return;
    }

    const employee = EMPLOYEES.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      return;
    }

    onSave({
      id:
        record?.id ??
        crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      date,
      scheduledStart,
      scheduledEnd,
      checkIn,
      checkOut,
      status,
      workedMinutes:
        calculateWorkedMinutes(
          checkIn,
          checkOut,
        ),
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <FormField
        label="Employee"
        htmlFor="attendanceEmployee"
        error={
          submitted && !employeeId
            ? "Select an employee"
            : undefined
        }
      >
        <Select
          id="attendanceEmployee"
          value={employeeId}
          disabled={Boolean(record)}
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
        label="Attendance date"
        htmlFor="attendanceDate"
        error={
          submitted && !date
            ? "Select a date"
            : undefined
        }
      >
        <Input
          id="attendanceDate"
          type="date"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Scheduled start"
          htmlFor="scheduledStart"
        >
          <Input
            id="scheduledStart"
            type="time"
            value={scheduledStart}
            onChange={(event) =>
              setScheduledStart(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Scheduled end"
          htmlFor="scheduledEnd"
        >
          <Input
            id="scheduledEnd"
            type="time"
            value={scheduledEnd}
            onChange={(event) =>
              setScheduledEnd(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Check in"
          htmlFor="checkIn"
          optional
        >
          <Input
            id="checkIn"
            type="time"
            value={checkIn}
            onChange={(event) =>
              setCheckIn(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Check out"
          htmlFor="checkOut"
          optional
        >
          <Input
            id="checkOut"
            type="time"
            value={checkOut}
            onChange={(event) =>
              setCheckOut(
                event.target.value,
              )
            }
          />
        </FormField>
      </div>

      <FormField
        label="Attendance status"
        htmlFor="attendanceStatus"
      >
        <Select
          id="attendanceStatus"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target
                .value as AttendanceStatus,
            )
          }
        >
          {Object.entries(
            ATTENDANCE_STATUS_CONFIG,
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
        label="Administrator note"
        htmlFor="attendanceNote"
        optional
      >
        <Textarea
          id="attendanceNote"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Add context for this attendance record..."
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
          {record
            ? "Save changes"
            : "Add attendance record"}
        </Button>
      </div>
    </form>
  );
}
