"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { CheckboxField } from "@/components/forms/checkbox-field";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYEE_CHANGE_TYPE_CONFIG } from "@/config/employee-changes";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  EmployeeChange,
  EmployeeChangeType,
} from "@/types/employee-change";

type EmployeeChangeFormProps = {
  onCancel: () => void;
  onCreate: (change: EmployeeChange) => void;
};

function getCurrentValue(
  employeeId: string,
  type: EmployeeChangeType,
) {
  const employee = EMPLOYEES.find(
    (item) => item.id === employeeId,
  );

  if (!employee) {
    return "Current record";
  }

  switch (type) {
    case "branch_transfer":
      return employee.branchName;

    case "department_change":
      return employee.department;

    case "designation_change":
    case "promotion":
      return employee.designation;

    case "status_change":
      return employee.status.replaceAll(
        "_",
        " ",
      );

    case "manager_change":
      return "Current reporting manager";

    case "salary_adjustment":
      return "Current salary";

    default:
      return "Current record";
  }
}

export function EmployeeChangeForm({
  onCancel,
  onCreate,
}: EmployeeChangeFormProps) {
  const [employeeId, setEmployeeId] =
    useState("");

  const [type, setType] =
    useState<EmployeeChangeType>(
      "promotion",
    );

  const [toValue, setToValue] =
    useState("");

  const [
    effectiveDate,
    setEffectiveDate,
  ] = useState("");

  const [reason, setReason] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [
    notifyEmployee,
    setNotifyEmployee,
  ] = useState(true);

  const isValid = Boolean(
    employeeId &&
      toValue.trim() &&
      effectiveDate &&
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

    const employee = EMPLOYEES.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      return;
    }

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    onCreate({
      id: crypto.randomUUID(),
      employeeId,
      branchId: employee.branchId,
      type,
      fromValue: getCurrentValue(
        employeeId,
        type,
      ),
      toValue: toValue.trim(),
      effectiveDate,
      requestedBy: CURRENT_ADMIN.name,
      requestedAt: today,
      reason: notifyEmployee
        ? `${reason.trim()} Employee notification enabled.`
        : reason.trim(),
      status: "pending",
      approvals: [
        {
          label: "HR approval",
          status: "pending",
        },
      ],
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <FormField
        label="Employee"
        htmlFor="changeEmployee"
        error={
          submitted && !employeeId
            ? "Select an employee"
            : undefined
        }
      >
        <Select
          id="changeEmployee"
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

          {EMPLOYEES.map((employee) => (
            <option
              key={employee.id}
              value={employee.id}
            >
              {employee.name} —{" "}
              {employee.employeeCode}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Change type"
        htmlFor="changeType"
      >
        <Select
          id="changeType"
          value={type}
          onChange={(event) =>
            setType(
              event.target
                .value as EmployeeChangeType,
            )
          }
        >
          {Object.entries(
            EMPLOYEE_CHANGE_TYPE_CONFIG,
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

      {employeeId && (
        <div className="rounded-control bg-canvas px-4 py-3">
          <p className="text-xs font-medium text-text-muted">
            Current value
          </p>

          <p className="mt-1 text-sm font-semibold capitalize">
            {getCurrentValue(
              employeeId,
              type,
            )}
          </p>
        </div>
      )}

      <FormField
        label="New value"
        htmlFor="newValue"
        description="Enter the employee's new branch, designation, status, manager or salary."
        error={
          submitted && !toValue.trim()
            ? "Enter the new value"
            : undefined
        }
      >
        <Input
          id="newValue"
          value={toValue}
          onChange={(event) =>
            setToValue(
              event.target.value,
            )
          }
          placeholder="Enter updated value"
        />
      </FormField>

      <FormField
        label="Effective date"
        htmlFor="effectiveDate"
        error={
          submitted && !effectiveDate
            ? "Select an effective date"
            : undefined
        }
      >
        <Input
          id="effectiveDate"
          type="date"
          value={effectiveDate}
          onChange={(event) =>
            setEffectiveDate(
              event.target.value,
            )
          }
        />
      </FormField>

      <FormField
        label="Reason"
        htmlFor="changeReason"
        description="This information will be visible to reviewers."
        error={
          submitted && !reason.trim()
            ? "Explain why this change is required"
            : undefined
        }
      >
        <Textarea
          id="changeReason"
          value={reason}
          onChange={(event) =>
            setReason(
              event.target.value,
            )
          }
          placeholder="Add context for reviewers..."
        />
      </FormField>

      <CheckboxField
        label="Notify employee after approval"
        description="The employee will receive a notification when this change is approved."
        checked={notifyEmployee}
        onChange={(event) =>
          setNotifyEmployee(
            event.target.checked,
          )
        }
      />

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          Submit for approval
        </Button>
      </div>
    </form>
  );
}
