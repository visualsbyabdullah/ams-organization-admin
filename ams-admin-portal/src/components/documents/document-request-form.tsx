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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DOCUMENT_CATEGORY_CONFIG,
} from "@/config/documents";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  DocumentCategory,
  DocumentRequest,
} from "@/types/document";

type DocumentRequestFormProps = {
  selectedBranchId: string;
  onCancel: () => void;
  onCreate: (
    request: DocumentRequest,
  ) => void;
};

export function DocumentRequestForm({
  selectedBranchId,
  onCancel,
  onCreate,
}: DocumentRequestFormProps) {
  const [employeeId, setEmployeeId] =
    useState("");
  const [title, setTitle] =
    useState("");
  const [category, setCategory] =
    useState<DocumentCategory>(
      "employment",
    );
  const [dueDate, setDueDate] =
    useState("");
  const [mandatory, setMandatory] =
    useState(true);
  const [note, setNote] =
    useState("");
  const [submitted, setSubmitted] =
    useState(false);

  const employees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          selectedBranchId ===
            "all" ||
          employee.branchId ===
            selectedBranchId,
      ),
    [selectedBranchId],
  );

  const isValid = Boolean(
    employeeId &&
      title.trim() &&
      dueDate,
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
      title: title.trim(),
      category,
      employeeId,
      branchId:
        employee.branchId,
      status: "open",
      requestedAt: new Date()
        .toISOString()
        .slice(0, 10),
      dueDate,
      mandatory,
      requestedBy:
        CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Employee"
          htmlFor="requestEmployee"
          error={
            submitted &&
            !employeeId
              ? "Select an employee"
              : undefined
          }
        >
          <Select
            id="requestEmployee"
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
            {employees.map(
              (employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name} â€”{" "}
                  {
                    employee.employeeCode
                  }
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField
          label="Category"
          htmlFor="requestCategory"
        >
          <Select
            id="requestCategory"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as DocumentCategory,
              )
            }
          >
            {Object.entries(
              DOCUMENT_CATEGORY_CONFIG,
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
          label="Request title"
          htmlFor="requestTitle"
          error={
            submitted &&
            !title.trim()
              ? "Enter a request title"
              : undefined
          }
        >
          <Input
            id="requestTitle"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Due date"
          htmlFor="requestDueDate"
          error={
            submitted &&
            !dueDate
              ? "Select a due date"
              : undefined
          }
        >
          <Input
            id="requestDueDate"
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(
                event.target.value,
              )
            }
          />
        </FormField>
      </section>

      <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
        <div>
          <p className="text-sm font-semibold">
            Mandatory request
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Mark the document as required for the employee record.
          </p>
        </div>
        <Switch
          checked={mandatory}
          onCheckedChange={
            setMandatory
          }
          ariaLabel="Mandatory document request"
        />
      </div>

      <FormField
        label="Request note"
        htmlFor="requestNote"
        optional
      >
        <Textarea
          id="requestNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
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
          Create request
        </Button>
      </div>
    </form>
  );
}
