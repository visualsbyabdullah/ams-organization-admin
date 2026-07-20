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
  LOAN_APPROVAL_MODE_CONFIG,
  LOAN_INTEREST_MODE_CONFIG,
} from "@/config/loan-policies";
import {
  LOAN_TYPE_CONFIG,
} from "@/config/loans";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  EmployeeLoanType,
} from "@/types/loan";
import type {
  LoanApprovalMode,
  LoanInterestMode,
  LoanPolicy,
  LoanPolicyScope,
  LoanPolicyStatus,
} from "@/types/loan-policy";

type LoanPolicyFormProps = {
  policy?: LoanPolicy;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (
    policy: LoanPolicy,
  ) => void;
};

const LOAN_TYPES =
  Object.keys(
    LOAN_TYPE_CONFIG,
  ) as EmployeeLoanType[];

export function LoanPolicyForm({
  policy,
  selectedBranchId,
  onCancel,
  onSave,
}: LoanPolicyFormProps) {
  const [name, setName] =
    useState(policy?.name ?? "");

  const [scope, setScope] =
    useState<LoanPolicyScope>(
      policy?.scope ?? "organization",
    );

  const [branchId, setBranchId] =
    useState(
      policy?.branchId ??
        (selectedBranchId === "all"
          ? ""
          : selectedBranchId),
    );

  const [status, setStatus] =
    useState<LoanPolicyStatus>(
      policy?.status ?? "draft",
    );

  const [
    enabledLoanTypes,
    setEnabledLoanTypes,
  ] = useState<EmployeeLoanType[]>(
    policy?.enabledLoanTypes ?? [
      "personal",
      "salary_advance",
      "emergency",
      "medical",
      "education",
    ],
  );

  const [
    minimumServiceMonths,
    setMinimumServiceMonths,
  ] = useState(
    String(
      policy?.minimumServiceMonths ??
        6,
    ),
  );

  const [
    maximumSalaryMultiple,
    setMaximumSalaryMultiple,
  ] = useState(
    String(
      policy?.maximumSalaryMultiple ??
        3,
    ),
  );

  const [
    maximumAmount,
    setMaximumAmount,
  ] = useState(
    String(
      policy?.maximumAmount ??
        500000,
    ),
  );

  const [
    maximumInstallments,
    setMaximumInstallments,
  ] = useState(
    String(
      policy?.maximumInstallments ??
        24,
    ),
  );

  const [
    minimumInstallmentAmount,
    setMinimumInstallmentAmount,
  ] = useState(
    String(
      policy?.minimumInstallmentAmount ??
        5000,
    ),
  );

  const [
    interestMode,
    setInterestMode,
  ] = useState<LoanInterestMode>(
    policy?.interestMode ??
      "interest_free",
  );

  const [
    annualInterestRate,
    setAnnualInterestRate,
  ] = useState(
    String(
      policy?.annualInterestRate ?? 0,
    ),
  );

  const [
    allowConcurrentLoans,
    setAllowConcurrentLoans,
  ] = useState(
    policy?.allowConcurrentLoans ??
      false,
  );

  const [
    maximumConcurrentLoans,
    setMaximumConcurrentLoans,
  ] = useState(
    String(
      policy?.maximumConcurrentLoans ??
        1,
    ),
  );

  const [
    requireGuarantorAbove,
    setRequireGuarantorAbove,
  ] = useState(
    String(
      policy?.requireGuarantorAbove ??
        300000,
    ),
  );

  const [
    automaticPayrollDeduction,
    setAutomaticPayrollDeduction,
  ] = useState(
    policy
      ?.automaticPayrollDeduction ??
      true,
  );

  const [
    emergencyFastTrack,
    setEmergencyFastTrack,
  ] = useState(
    policy?.emergencyFastTrack ??
      true,
  );

  const [
    approvalMode,
    setApprovalMode,
  ] = useState<LoanApprovalMode>(
    policy?.approvalMode ??
      "manager_finance_admin",
  );

  const [
    financeReviewRequired,
    setFinanceReviewRequired,
  ] = useState(
    policy?.financeReviewRequired ??
      true,
  );

  const [
    adminApprovalRequired,
    setAdminApprovalRequired,
  ] = useState(
    policy?.adminApprovalRequired ??
      true,
  );

  const [note, setNote] =
    useState(policy?.note ?? "");

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

  const isValid = Boolean(
    name.trim() &&
      (scope === "organization" ||
        branchId) &&
      enabledLoanTypes.length > 0 &&
      Number(maximumAmount) > 0 &&
      Number(maximumInstallments) > 0 &&
      Number(minimumInstallmentAmount) >
        0,
  );

  function toggleLoanType(
    type: EmployeeLoanType,
    checked: boolean,
  ) {
    setEnabledLoanTypes(
      (currentTypes) =>
        checked
          ? Array.from(
              new Set([
                ...currentTypes,
                type,
              ]),
            )
          : currentTypes.filter(
              (currentType) =>
                currentType !== type,
            ),
    );
  }

  function toNumber(
    value: string,
    fallback: number,
  ) {
    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue,
    )
      ? numberValue
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
        policy?.id ??
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
      enabledLoanTypes,
      minimumServiceMonths:
        toNumber(
          minimumServiceMonths,
          6,
        ),
      maximumSalaryMultiple:
        toNumber(
          maximumSalaryMultiple,
          3,
        ),
      maximumAmount:
        toNumber(
          maximumAmount,
          500000,
        ),
      maximumInstallments:
        toNumber(
          maximumInstallments,
          24,
        ),
      minimumInstallmentAmount:
        toNumber(
          minimumInstallmentAmount,
          5000,
        ),
      interestMode,
      annualInterestRate:
        interestMode ===
        "interest_free"
          ? 0
          : toNumber(
              annualInterestRate,
              0,
            ),
      allowConcurrentLoans,
      maximumConcurrentLoans:
        allowConcurrentLoans
          ? toNumber(
              maximumConcurrentLoans,
              2,
            )
          : 1,
      requireGuarantorAbove:
        toNumber(
          requireGuarantorAbove,
          300000,
        ),
      automaticPayrollDeduction,
      emergencyFastTrack,
      approvalMode,
      financeReviewRequired,
      adminApprovalRequired,
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
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Policy name"
          htmlFor="loanPolicyName"
          error={
            submitted && !name.trim()
              ? "Enter a policy name"
              : undefined
          }
        >
          <Input
            id="loanPolicyName"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder="Example: Organization Loan Policy"
          />
        </FormField>

        <FormField
          label="Policy status"
          htmlFor="loanPolicyStatus"
        >
          <Select
            id="loanPolicyStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as LoanPolicyStatus,
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
          label="Policy scope"
          htmlFor="loanPolicyScope"
        >
          <Select
            id="loanPolicyScope"
            value={scope}
            onChange={(event) =>
              setScope(
                event.target
                  .value as LoanPolicyScope,
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
            htmlFor="loanPolicyBranch"
            error={
              submitted && !branchId
                ? "Select a branch"
                : undefined
            }
          >
            <Select
              id="loanPolicyBranch"
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
          Eligible loan types
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Select the employee loan categories
          supported by this policy.
        </p>

        <div className="mt-4 space-y-3">
          {LOAN_TYPES.map((type) => (
            <div
              key={type}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">
                  {
                    LOAN_TYPE_CONFIG[
                      type
                    ].label
                  }
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Allow employees to submit this
                  loan category.
                </p>
              </div>

              <Switch
                checked={enabledLoanTypes.includes(
                  type,
                )}
                onCheckedChange={(
                  checked,
                ) =>
                  toggleLoanType(
                    type,
                    checked,
                  )
                }
                ariaLabel={`Enable ${LOAN_TYPE_CONFIG[type].label}`}
              />
            </div>
          ))}

          {submitted &&
            enabledLoanTypes.length ===
              0 && (
              <p className="text-sm font-medium text-danger">
                Enable at least one loan type.
              </p>
            )}
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Eligibility and limits
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Minimum service"
            htmlFor="minimumServiceMonths"
            description="Required employment duration in months."
          >
            <Input
              id="minimumServiceMonths"
              type="number"
              min="0"
              value={
                minimumServiceMonths
              }
              onChange={(event) =>
                setMinimumServiceMonths(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Maximum salary multiple"
            htmlFor="maximumSalaryMultiple"
            description="Maximum loan amount relative to monthly salary."
          >
            <Input
              id="maximumSalaryMultiple"
              type="number"
              min="1"
              step="0.5"
              value={
                maximumSalaryMultiple
              }
              onChange={(event) =>
                setMaximumSalaryMultiple(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Maximum loan amount"
            htmlFor="maximumLoanAmount"
            error={
              submitted &&
              Number(maximumAmount) <= 0
                ? "Enter a valid maximum amount"
                : undefined
            }
          >
            <Input
              id="maximumLoanAmount"
              type="number"
              min="1"
              value={maximumAmount}
              onChange={(event) =>
                setMaximumAmount(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Maximum installments"
            htmlFor="maximumInstallments"
          >
            <Input
              id="maximumInstallments"
              type="number"
              min="1"
              max="120"
              value={
                maximumInstallments
              }
              onChange={(event) =>
                setMaximumInstallments(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Minimum installment"
            htmlFor="minimumInstallmentAmount"
          >
            <Input
              id="minimumInstallmentAmount"
              type="number"
              min="1"
              value={
                minimumInstallmentAmount
              }
              onChange={(event) =>
                setMinimumInstallmentAmount(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Guarantor required above"
            htmlFor="guarantorThreshold"
          >
            <Input
              id="guarantorThreshold"
              type="number"
              min="0"
              value={
                requireGuarantorAbove
              }
              onChange={(event) =>
                setRequireGuarantorAbove(
                  event.target.value,
                )
              }
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Interest configuration
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Interest mode"
            htmlFor="loanInterestMode"
          >
            <Select
              id="loanInterestMode"
              value={interestMode}
              onChange={(event) =>
                setInterestMode(
                  event.target
                    .value as LoanInterestMode,
                )
              }
            >
              {Object.entries(
                LOAN_INTEREST_MODE_CONFIG,
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

          {interestMode !==
            "interest_free" && (
            <FormField
              label="Annual interest rate"
              htmlFor="annualInterestRate"
            >
              <Input
                id="annualInterestRate"
                type="number"
                min="0"
                step="0.01"
                value={
                  annualInterestRate
                }
                onChange={(event) =>
                  setAnnualInterestRate(
                    event.target.value,
                  )
                }
              />
            </FormField>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Repayment controls
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Automatic payroll deduction
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Collect scheduled installments through
                employee payroll.
              </p>
            </div>

            <Switch
              checked={
                automaticPayrollDeduction
              }
              onCheckedChange={
                setAutomaticPayrollDeduction
              }
              ariaLabel="Automatic payroll deduction"
            />
          </div>

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Emergency fast-track
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Prioritize emergency applications in
                the approval queue.
              </p>
            </div>

            <Switch
              checked={
                emergencyFastTrack
              }
              onCheckedChange={
                setEmergencyFastTrack
              }
              ariaLabel="Emergency fast-track"
            />
          </div>

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Allow concurrent loans
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Permit an employee to maintain more
                than one active loan.
              </p>
            </div>

            <Switch
              checked={
                allowConcurrentLoans
              }
              onCheckedChange={
                setAllowConcurrentLoans
              }
              ariaLabel="Allow concurrent loans"
            />
          </div>

          {allowConcurrentLoans && (
            <FormField
              label="Maximum concurrent loans"
              htmlFor="maximumConcurrentLoans"
            >
              <Input
                id="maximumConcurrentLoans"
                type="number"
                min="2"
                value={
                  maximumConcurrentLoans
                }
                onChange={(event) =>
                  setMaximumConcurrentLoans(
                    event.target.value,
                  )
                }
              />
            </FormField>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Approval workflow
        </h3>

        <div className="mt-5">
          <FormField
            label="Approval mode"
            htmlFor="loanApprovalMode"
          >
            <Select
              id="loanApprovalMode"
              value={approvalMode}
              onChange={(event) =>
                setApprovalMode(
                  event.target
                    .value as LoanApprovalMode,
                )
              }
            >
              {Object.entries(
                LOAN_APPROVAL_MODE_CONFIG,
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

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Finance review required
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Finance validates affordability,
                deductions and repayment terms.
              </p>
            </div>

            <Switch
              checked={
                financeReviewRequired
              }
              onCheckedChange={
                setFinanceReviewRequired
              }
              ariaLabel="Finance review required"
            />
          </div>

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Administrator approval required
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Organization administrator provides the
                final loan decision.
              </p>
            </div>

            <Switch
              checked={
                adminApprovalRequired
              }
              onCheckedChange={
                setAdminApprovalRequired
              }
              ariaLabel="Administrator approval required"
            />
          </div>
        </div>
      </section>

      <FormField
        label="Internal note"
        htmlFor="loanPolicyNote"
        optional
      >
        <Textarea
          id="loanPolicyNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
          placeholder="Add eligibility, approval or repayment context..."
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
          {policy
            ? "Save policy"
            : "Create policy"}
        </Button>
      </div>
    </form>
  );
}
