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
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  PayrollRun,
} from "@/types/payroll";

type PayrollRunFormProps = {
  selectedBranchId: string;
  onCancel: () => void;
  onCreate: (
    run: PayrollRun,
  ) => void;
};

function getPeriodDates(
  period: string,
) {
  const [year, month] =
    period.split("-").map(Number);

  const start = new Date(
    year,
    month - 1,
    1,
  );

  const end = new Date(
    year,
    month,
    0,
  );

  function formatDateValue(
    date: Date,
  ) {
    const dateYear =
      date.getFullYear();

    const dateMonth = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const dateDay = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${dateYear}-${dateMonth}-${dateDay}`;
  }

  return {
    start:
      formatDateValue(start),
    end: formatDateValue(end),
    label:
      new Intl.DateTimeFormat(
        "en-GB",
        {
          month: "long",
          year: "numeric",
        },
      ).format(start),
  };
}

export function PayrollRunForm({
  selectedBranchId,
  onCancel,
  onCreate,
}: PayrollRunFormProps) {
  const [period, setPeriod] =
    useState("2026-08");

  const [branchId, setBranchId] =
    useState(
      selectedBranchId === "all"
        ? "all"
        : selectedBranchId,
    );

  const [payDate, setPayDate] =
    useState("2026-08-31");

  const [note, setNote] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const branchOptions =
    useMemo(() => {
      const uniqueBranches =
        new Map<
          string,
          string
        >();

      EMPLOYEES.forEach(
        (employee) => {
          uniqueBranches.set(
            employee.branchId,
            employee.branchName,
          );
        },
      );

      return Array.from(
        uniqueBranches.entries(),
      ).map(([id, name]) => ({
        id,
        name,
      }));
    }, []);

  const isValid = Boolean(
    period &&
      branchId &&
      payDate,
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const periodConfig =
      getPeriodDates(period);

    const branchName =
      branchId === "all"
        ? "All Branches"
        : branchOptions.find(
            (branch) =>
              branch.id ===
              branchId,
          )?.name ??
          "Selected Branch";

    const employeeCount =
      branchId === "all"
        ? EMPLOYEES.length
        : EMPLOYEES.filter(
            (employee) =>
              employee.branchId ===
              branchId,
          ).length;

    onCreate({
      id: crypto.randomUUID(),
      period,
      periodLabel:
        periodConfig.label,
      periodStart:
        periodConfig.start,
      periodEnd: periodConfig.end,
      branchId,
      branchName,
      status: "draft",
      employeeCount,
      grossAmount: 0,
      deductionAmount: 0,
      netAmount: 0,
      payDate,
      createdAt: new Date()
        .toISOString()
        .slice(0, 10),
      createdBy:
        CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <FormField
        label="Payroll period"
        htmlFor="payrollPeriod"
        error={
          submitted && !period
            ? "Select a payroll period"
            : undefined
        }
      >
        <Input
          id="payrollPeriod"
          type="month"
          value={period}
          onChange={(event) =>
            setPeriod(
              event.target.value,
            )
          }
        />
      </FormField>

      <FormField
        label="Organization scope"
        htmlFor="payrollBranch"
      >
        <Select
          id="payrollBranch"
          value={branchId}
          onChange={(event) =>
            setBranchId(
              event.target.value,
            )
          }
        >
          <option value="all">
            All Branches
          </option>

          {branchOptions.map(
            (branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
              </option>
            ),
          )}
        </Select>
      </FormField>

      <FormField
        label="Expected pay date"
        htmlFor="payrollPayDate"
      >
        <Input
          id="payrollPayDate"
          type="date"
          value={payDate}
          onChange={(event) =>
            setPayDate(
              event.target.value,
            )
          }
        />
      </FormField>

      <FormField
        label="Payroll note"
        htmlFor="payrollRunNote"
        optional
      >
        <Textarea
          id="payrollRunNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
          placeholder="Add payroll processing instructions..."
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
          Create payroll run
        </Button>
      </div>
    </form>
  );
}
