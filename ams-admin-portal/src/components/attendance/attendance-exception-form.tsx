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
  ATTENDANCE_EXCEPTION_SEVERITY_CONFIG,
  ATTENDANCE_EXCEPTION_TYPE_CONFIG,
} from "@/config/attendance-exceptions";
import { EMPLOYEES } from "@/data/employees";
import type {
  AttendanceException,
  AttendanceExceptionSeverity,
  AttendanceExceptionType,
} from "@/types/attendance-exception";

type AttendanceExceptionFormProps = {
  selectedBranchId: string;
  onCancel: () => void;
  onCreate: (
    exception: AttendanceException,
  ) => void;
};

export function AttendanceExceptionForm({
  selectedBranchId,
  onCancel,
  onCreate,
}: AttendanceExceptionFormProps) {
  const [employeeId, setEmployeeId] =
    useState("");

  const [date, setDate] =
    useState("2026-07-16");

  const [type, setType] =
    useState<AttendanceExceptionType>(
      "late_arrival",
    );

  const [severity, setSeverity] =
    useState<AttendanceExceptionSeverity>(
      "medium",
    );

  const [
    impactMinutes,
    setImpactMinutes,
  ] = useState("0");

  const [reason, setReason] =
    useState("");

  const [adminNote, setAdminNote] =
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

  const isValid = Boolean(
    employeeId &&
      date &&
      reason.trim(),
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
      date,
      type,
      severity,
      status: "open",
      source: "admin",
      detectedAt:
        new Date().toISOString(),
      impactMinutes: Math.max(
        Number(impactMinutes) || 0,
        0,
      ),
      reason: reason.trim(),
      employeeNote: "",
      adminNote: adminNote.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <FormField
        label="Employee"
        htmlFor="exceptionEmployee"
        error={
          submitted && !employeeId
            ? "Select an employee"
            : undefined
        }
      >
        <Select
          id="exceptionEmployee"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Attendance date"
          htmlFor="exceptionDate"
        >
          <Input
            id="exceptionDate"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Impact in minutes"
          htmlFor="impactMinutes"
          description="Use zero when working time is unknown."
        >
          <Input
            id="impactMinutes"
            type="number"
            min="0"
            value={impactMinutes}
            onChange={(event) =>
              setImpactMinutes(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Exception type"
          htmlFor="exceptionType"
        >
          <Select
            id="exceptionType"
            value={type}
            onChange={(event) =>
              setType(
                event.target
                  .value as AttendanceExceptionType,
              )
            }
          >
            {Object.entries(
              ATTENDANCE_EXCEPTION_TYPE_CONFIG,
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
          label="Severity"
          htmlFor="exceptionSeverity"
        >
          <Select
            id="exceptionSeverity"
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target
                  .value as AttendanceExceptionSeverity,
              )
            }
          >
            {Object.entries(
              ATTENDANCE_EXCEPTION_SEVERITY_CONFIG,
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
      </div>

      <FormField
        label="Exception reason"
        htmlFor="exceptionReason"
        error={
          submitted && !reason.trim()
            ? "Explain this attendance exception"
            : undefined
        }
      >
        <Textarea
          id="exceptionReason"
          value={reason}
          onChange={(event) =>
            setReason(
              event.target.value,
            )
          }
          placeholder="Describe what caused the exception..."
        />
      </FormField>

      <FormField
        label="Administrator note"
        htmlFor="exceptionAdminNote"
        optional
      >
        <Textarea
          id="exceptionAdminNote"
          value={adminNote}
          onChange={(event) =>
            setAdminNote(
              event.target.value,
            )
          }
          placeholder="Add internal review context..."
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
          Create exception
        </Button>
      </div>
    </form>
  );
}
