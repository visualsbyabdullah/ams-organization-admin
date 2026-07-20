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
  PAYROLL_BANK_FILE_FORMAT_CONFIG,
  PAYROLL_PAY_DATE_RULE_CONFIG,
  PAYROLL_ROUNDING_MODE_CONFIG,
  PAYROLL_SCHEDULE_CONFIG,
} from "@/config/payroll-settings";
import {
  PAYROLL_PAYMENT_METHOD_CONFIG,
} from "@/config/payroll";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  PayrollPaymentMethod,
} from "@/types/payroll";
import type {
  PayrollBankFileFormat,
  PayrollPayDateRule,
  PayrollRoundingMode,
  PayrollSchedule,
  PayrollSettingsRecord,
  PayrollSettingsScope,
  PayrollSettingsStatus,
} from "@/types/payroll-settings";

type PayrollSettingsFormProps = {
  configuration?: PayrollSettingsRecord;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (
    configuration: PayrollSettingsRecord,
  ) => void;
};

export function PayrollSettingsForm({
  configuration,
  selectedBranchId,
  onCancel,
  onSave,
}: PayrollSettingsFormProps) {
  const [name, setName] =
    useState(
      configuration?.name ?? "",
    );

  const [scope, setScope] =
    useState<PayrollSettingsScope>(
      configuration?.scope ??
        "organization",
    );

  const [branchId, setBranchId] =
    useState(
      configuration?.branchId ??
        (selectedBranchId === "all"
          ? ""
          : selectedBranchId),
    );

  const [status, setStatus] =
    useState<PayrollSettingsStatus>(
      configuration?.status ??
        "draft",
    );

  const [schedule, setSchedule] =
    useState<PayrollSchedule>(
      configuration?.schedule ??
        "monthly",
    );

  const [cutoffDay, setCutoffDay] =
    useState(
      String(
        configuration?.cutoffDay ?? 25,
      ),
    );

  const [
    payDateRule,
    setPayDateRule,
  ] = useState<PayrollPayDateRule>(
    configuration?.payDateRule ??
      "last_working_day",
  );

  const [payDay, setPayDay] =
    useState(
      String(
        configuration?.payDay ?? 30,
      ),
    );

  const [
    defaultPaymentMethod,
    setDefaultPaymentMethod,
  ] =
    useState<PayrollPaymentMethod>(
      configuration
        ?.defaultPaymentMethod ??
        "bank_transfer",
    );

  const [
    standardWorkingDays,
    setStandardWorkingDays,
  ] = useState(
    String(
      configuration
        ?.standardWorkingDays ?? 22,
    ),
  );

  const [
    standardDailyHours,
    setStandardDailyHours,
  ] = useState(
    String(
      configuration
        ?.standardDailyHours ?? 8,
    ),
  );

  const [
    includeAttendanceOvertime,
    setIncludeAttendanceOvertime,
  ] = useState(
    configuration
      ?.includeAttendanceOvertime ??
      true,
  );

  const [
    deductUnpaidLeave,
    setDeductUnpaidLeave,
  ] = useState(
    configuration
      ?.deductUnpaidLeave ?? true,
  );

  const [
    autoGeneratePayslips,
    setAutoGeneratePayslips,
  ] = useState(
    configuration
      ?.autoGeneratePayslips ?? true,
  );

  const [
    emailPayslips,
    setEmailPayslips,
  ] = useState(
    configuration?.emailPayslips ??
      true,
  );

  const [
    autoLockApprovedRuns,
    setAutoLockApprovedRuns,
  ] = useState(
    configuration
      ?.autoLockApprovedRuns ?? true,
  );

  const [
    requireFinanceApproval,
    setRequireFinanceApproval,
  ] = useState(
    configuration
      ?.requireFinanceApproval ??
      true,
  );

  const [
    requireAdminApproval,
    setRequireAdminApproval,
  ] = useState(
    configuration
      ?.requireAdminApproval ?? true,
  );

  const [
    roundingMode,
    setRoundingMode,
  ] = useState<PayrollRoundingMode>(
    configuration?.roundingMode ??
      "nearest_1",
  );

  const [
    bankFileFormat,
    setBankFileFormat,
  ] = useState<PayrollBankFileFormat>(
    configuration?.bankFileFormat ??
      "bank_template",
  );

  const [note, setNote] =
    useState(
      configuration?.note ?? "",
    );

  const [submitted, setSubmitted] =
    useState(false);

  const branchOptions =
    useMemo(() => {
      const branches =
        new Map<string, string>();

      EMPLOYEES.forEach(
        (employee) => {
          branches.set(
            employee.branchId,
            employee.branchName,
          );
        },
      );

      return Array.from(
        branches.entries(),
      ).map(([id, branchName]) => ({
        id,
        name: branchName,
      }));
    }, []);

  const validBranch =
    scope === "organization" ||
    Boolean(branchId);

  const validPayDay =
    payDateRule !== "fixed_day" ||
    (Number(payDay) >= 1 &&
      Number(payDay) <= 31);

  const isValid = Boolean(
    name.trim() &&
      validBranch &&
      Number(cutoffDay) >= 1 &&
      Number(cutoffDay) <= 31 &&
      Number(standardWorkingDays) > 0 &&
      Number(standardDailyHours) > 0 &&
      validPayDay,
  );

  function toNumber(
    value: string,
    fallback: number,
  ) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const selectedBranch =
      branchOptions.find(
        (branch) =>
          branch.id === branchId,
      );

    onSave({
      id:
        configuration?.id ??
        crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId:
        scope === "branch"
          ? branchId
          : undefined,
      branchName:
        scope === "branch"
          ? selectedBranch?.name
          : undefined,
      status,
      schedule,
      cutoffDay: toNumber(
        cutoffDay,
        25,
      ),
      payDateRule,
      payDay:
        payDateRule === "fixed_day"
          ? toNumber(payDay, 30)
          : 31,
      defaultPaymentMethod,
      standardWorkingDays:
        toNumber(
          standardWorkingDays,
          22,
        ),
      standardDailyHours:
        toNumber(
          standardDailyHours,
          8,
        ),
      includeAttendanceOvertime,
      deductUnpaidLeave,
      autoGeneratePayslips,
      emailPayslips,
      autoLockApprovedRuns,
      requireFinanceApproval,
      requireAdminApproval,
      roundingMode,
      bankFileFormat,
      updatedAt: new Date()
        .toISOString()
        .slice(0, 10),
      updatedBy:
        CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Configuration name"
          htmlFor="payrollSettingsName"
          error={
            submitted && !name.trim()
              ? "Enter a configuration name"
              : undefined
          }
        >
          <Input
            id="payrollSettingsName"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Example: Organization Payroll Default"
          />
        </FormField>

        <FormField
          label="Status"
          htmlFor="payrollSettingsStatus"
        >
          <Select
            id="payrollSettingsStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as PayrollSettingsStatus,
              )
            }
          >
            <option value="active">
              Active
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="archived">
              Archived
            </option>
          </Select>
        </FormField>

        <FormField
          label="Configuration scope"
          htmlFor="payrollSettingsScope"
        >
          <Select
            id="payrollSettingsScope"
            value={scope}
            onChange={(event) =>
              setScope(
                event.target
                  .value as PayrollSettingsScope,
              )
            }
          >
            <option value="organization">
              Organization default
            </option>

            <option value="branch">
              Branch override
            </option>
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="payrollSettingsBranch"
            error={
              submitted && !branchId
                ? "Select a branch"
                : undefined
            }
          >
            <Select
              id="payrollSettingsBranch"
              value={branchId}
              onChange={(event) =>
                setBranchId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Select branch
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
        )}
      </section>

      <section>
        <h3 className="font-bold">
          Payroll schedule
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Configure payroll frequency, cutoff and
          payment timing.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField
            label="Payroll frequency"
            htmlFor="payrollSchedule"
          >
            <Select
              id="payrollSchedule"
              value={schedule}
              onChange={(event) =>
                setSchedule(
                  event.target
                    .value as PayrollSchedule,
                )
              }
            >
              {Object.entries(
                PAYROLL_SCHEDULE_CONFIG,
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
            label="Payroll cutoff day"
            htmlFor="payrollCutoffDay"
            description="Last day for attendance and adjustment inputs."
            error={
              submitted &&
              (Number(cutoffDay) < 1 ||
                Number(cutoffDay) > 31)
                ? "Use a day between 1 and 31"
                : undefined
            }
          >
            <Input
              id="payrollCutoffDay"
              type="number"
              min="1"
              max="31"
              value={cutoffDay}
              onChange={(event) =>
                setCutoffDay(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Pay-date rule"
            htmlFor="payDateRule"
          >
            <Select
              id="payDateRule"
              value={payDateRule}
              onChange={(event) =>
                setPayDateRule(
                  event.target
                    .value as PayrollPayDateRule,
                )
              }
            >
              {Object.entries(
                PAYROLL_PAY_DATE_RULE_CONFIG,
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

          {payDateRule ===
            "fixed_day" && (
            <FormField
              label="Fixed pay day"
              htmlFor="fixedPayDay"
              error={
                submitted &&
                (Number(payDay) < 1 ||
                  Number(payDay) > 31)
                  ? "Use a day between 1 and 31"
                  : undefined
              }
            >
              <Input
                id="fixedPayDay"
                type="number"
                min="1"
                max="31"
                value={payDay}
                onChange={(event) =>
                  setPayDay(
                    event.target.value,
                  )
                }
              />
            </FormField>
          )}

          <FormField
            label="Default payment method"
            htmlFor="defaultPaymentMethod"
          >
            <Select
              id="defaultPaymentMethod"
              value={
                defaultPaymentMethod
              }
              onChange={(event) =>
                setDefaultPaymentMethod(
                  event.target
                    .value as PayrollPaymentMethod,
                )
              }
            >
              {Object.entries(
                PAYROLL_PAYMENT_METHOD_CONFIG,
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
      </section>

      <section>
        <h3 className="font-bold">
          Working-time defaults
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Standard working days"
            htmlFor="standardWorkingDays"
            description="Default monthly working days used in payroll calculations."
          >
            <Input
              id="standardWorkingDays"
              type="number"
              min="1"
              value={
                standardWorkingDays
              }
              onChange={(event) =>
                setStandardWorkingDays(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Standard daily hours"
            htmlFor="standardDailyHours"
          >
            <Input
              id="standardDailyHours"
              type="number"
              min="1"
              step="0.5"
              value={
                standardDailyHours
              }
              onChange={(event) =>
                setStandardDailyHours(
                  event.target.value,
                )
              }
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Payroll automation
        </h3>

        <div className="mt-4 space-y-3">
          {[
            {
              label:
                "Include attendance overtime",
              description:
                "Add approved attendance overtime to payroll automatically.",
              checked:
                includeAttendanceOvertime,
              onChange:
                setIncludeAttendanceOvertime,
            },
            {
              label:
                "Deduct unpaid leave",
              description:
                "Calculate unpaid-leave deductions during payroll processing.",
              checked:
                deductUnpaidLeave,
              onChange:
                setDeductUnpaidLeave,
            },
            {
              label:
                "Generate payslips automatically",
              description:
                "Create employee payslips after a payroll run is approved.",
              checked:
                autoGeneratePayslips,
              onChange:
                setAutoGeneratePayslips,
            },
            {
              label:
                "Email employee payslips",
              description:
                "Send generated payslips to employee email addresses.",
              checked: emailPayslips,
              onChange:
                setEmailPayslips,
            },
            {
              label:
                "Lock approved payroll runs",
              description:
                "Prevent payroll changes after final approval.",
              checked:
                autoLockApprovedRuns,
              onChange:
                setAutoLockApprovedRuns,
            },
          ].map((setting) => (
            <div
              key={setting.label}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">
                  {setting.label}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {setting.description}
                </p>
              </div>

              <Switch
                checked={
                  setting.checked
                }
                onCheckedChange={
                  setting.onChange
                }
                ariaLabel={
                  setting.label
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Approval workflow
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Require finance approval
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Finance must approve payroll before
                payment processing.
              </p>
            </div>

            <Switch
              checked={
                requireFinanceApproval
              }
              onCheckedChange={
                setRequireFinanceApproval
              }
              ariaLabel="Require finance approval"
            />
          </div>

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Require administrator approval
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Organization administrator provides
                final payroll approval.
              </p>
            </div>

            <Switch
              checked={
                requireAdminApproval
              }
              onCheckedChange={
                setRequireAdminApproval
              }
              ariaLabel="Require administrator approval"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Payroll rounding"
          htmlFor="payrollRounding"
        >
          <Select
            id="payrollRounding"
            value={roundingMode}
            onChange={(event) =>
              setRoundingMode(
                event.target
                  .value as PayrollRoundingMode,
              )
            }
          >
            {Object.entries(
              PAYROLL_ROUNDING_MODE_CONFIG,
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
          label="Bank export format"
          htmlFor="bankFileFormat"
        >
          <Select
            id="bankFileFormat"
            value={bankFileFormat}
            onChange={(event) =>
              setBankFileFormat(
                event.target
                  .value as PayrollBankFileFormat,
              )
            }
          >
            {Object.entries(
              PAYROLL_BANK_FILE_FORMAT_CONFIG,
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
      </section>

      <FormField
        label="Internal note"
        htmlFor="payrollSettingsNote"
        optional
      >
        <Textarea
          id="payrollSettingsNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
          placeholder="Add payroll processing or approval context..."
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
          {configuration
            ? "Save configuration"
            : "Add configuration"}
        </Button>
      </div>
    </form>
  );
}
