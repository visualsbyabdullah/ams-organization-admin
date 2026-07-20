"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAVE_POLICY_ACCRUAL_CONFIG,
  LEAVE_POLICY_APPROVAL_CONFIG,
  LEAVE_POLICY_BRANCH_OPTIONS,
  getLeavePolicyEmployeeCount,
} from "@/config/leave-policies";
import {
  LEAVE_TYPE_CONFIG,
} from "@/config/leave";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { cn } from "@/lib/utils";
import type {
  LeaveType,
} from "@/types/leave";
import type {
  LeaveAccrualMethod,
  LeaveApprovalMode,
  LeavePolicy,
  LeavePolicyScope,
  LeavePolicyStatus,
} from "@/types/leave-policy";

type LeavePolicyFormProps = {
  policy?: LeavePolicy;
  onCancel: () => void;
  onSave: (
    policy: LeavePolicy,
  ) => void;
};

export function LeavePolicyForm({
  policy,
  onCancel,
  onSave,
}: LeavePolicyFormProps) {
  const [name, setName] =
    useState(policy?.name ?? "");

  const [description, setDescription] =
    useState(
      policy?.description ?? "",
    );

  const [leaveType, setLeaveType] =
    useState<LeaveType>(
      policy?.leaveType ?? "annual",
    );

  const [status, setStatus] =
    useState<LeavePolicyStatus>(
      policy?.status ?? "draft",
    );

  const [scope, setScope] =
    useState<LeavePolicyScope>(
      policy?.scope ?? "all_branches",
    );

  const [
    selectedBranchIds,
    setSelectedBranchIds,
  ] = useState<string[]>(
    policy?.branchIds ?? [],
  );

  const [
    annualAllowance,
    setAnnualAllowance,
  ] = useState(
    String(
      policy?.annualAllowance ?? 20,
    ),
  );

  const [
    accrualMethod,
    setAccrualMethod,
  ] = useState<LeaveAccrualMethod>(
    policy?.accrualMethod ?? "annual",
  );

  const [
    maximumConsecutiveDays,
    setMaximumConsecutiveDays,
  ] = useState(
    String(
      policy?.maximumConsecutiveDays ??
        10,
    ),
  );

  const [
    minimumNoticeDays,
    setMinimumNoticeDays,
  ] = useState(
    String(
      policy?.minimumNoticeDays ?? 7,
    ),
  );

  const [
    carryForwardEnabled,
    setCarryForwardEnabled,
  ] = useState(
    policy?.carryForwardEnabled ??
      false,
  );

  const [
    carryForwardLimit,
    setCarryForwardLimit,
  ] = useState(
    String(
      policy?.carryForwardLimit ?? 0,
    ),
  );

  const [
    attachmentRequiredAfterDays,
    setAttachmentRequiredAfterDays,
  ] = useState(
    String(
      policy
        ?.attachmentRequiredAfterDays ??
        0,
    ),
  );

  const [
    allowNegativeBalance,
    setAllowNegativeBalance,
  ] = useState(
    policy?.allowNegativeBalance ??
      false,
  );

  const [
    approvalMode,
    setApprovalMode,
  ] = useState<LeaveApprovalMode>(
    policy?.approvalMode ??
      "manager",
  );

  const [submitted, setSubmitted] =
    useState(false);

  const branchSelectionValid =
    scope === "all_branches" ||
    selectedBranchIds.length > 0;

  const isValid = Boolean(
    name.trim() &&
      description.trim() &&
      Number(annualAllowance) >= 0 &&
      branchSelectionValid,
  );

  function toggleBranch(
    branchId: string,
  ) {
    setSelectedBranchIds(
      (currentBranchIds) =>
        currentBranchIds.includes(
          branchId,
        )
          ? currentBranchIds.filter(
              (item) =>
                item !== branchId,
            )
          : [
              ...currentBranchIds,
              branchId,
            ],
    );
  }

  function toPositiveNumber(
    value: string,
  ) {
    return Math.max(
      Number(value) || 0,
      0,
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branchIds =
      scope === "all_branches"
        ? []
        : selectedBranchIds;

    onSave({
      id:
        policy?.id ??
        crypto.randomUUID(),
      name: name.trim(),
      description:
        description.trim(),
      leaveType,
      status,
      scope,
      branchIds,
      annualAllowance:
        toPositiveNumber(
          annualAllowance,
        ),
      accrualMethod,
      maximumConsecutiveDays:
        toPositiveNumber(
          maximumConsecutiveDays,
        ),
      minimumNoticeDays:
        toPositiveNumber(
          minimumNoticeDays,
        ),
      carryForwardEnabled,
      carryForwardLimit:
        carryForwardEnabled
          ? toPositiveNumber(
              carryForwardLimit,
            )
          : 0,
      attachmentRequiredAfterDays:
        toPositiveNumber(
          attachmentRequiredAfterDays,
        ),
      allowNegativeBalance,
      approvalMode,
      applicableEmployees:
        getLeavePolicyEmployeeCount(
          scope,
          branchIds,
        ),
      updatedAt: new Date()
        .toISOString()
        .slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Policy name"
          htmlFor="leavePolicyName"
          error={
            submitted && !name.trim()
              ? "Enter a policy name"
              : undefined
          }
        >
          <Input
            id="leavePolicyName"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Example: Annual Leave Policy"
          />
        </FormField>

        <FormField
          label="Policy status"
          htmlFor="leavePolicyStatus"
        >
          <Select
            id="leavePolicyStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as LeavePolicyStatus,
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
          label="Leave type"
          htmlFor="policyLeaveType"
        >
          <Select
            id="policyLeaveType"
            value={leaveType}
            onChange={(event) =>
              setLeaveType(
                event.target
                  .value as LeaveType,
              )
            }
          >
            {Object.entries(
              LEAVE_TYPE_CONFIG,
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
          label="Annual allowance"
          htmlFor="annualAllowance"
          description="Total leave days available during one leave year."
        >
          <Input
            id="annualAllowance"
            type="number"
            min="0"
            value={annualAllowance}
            onChange={(event) =>
              setAnnualAllowance(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="leavePolicyDescription"
          className="md:col-span-2"
          error={
            submitted &&
            !description.trim()
              ? "Describe this policy"
              : undefined
          }
        >
          <Textarea
            id="leavePolicyDescription"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Explain policy eligibility, purpose and important conditions..."
          />
        </FormField>
      </section>

      <section>
        <h3 className="font-bold">
          Policy scope
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Choose where this leave policy should
          apply.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              value:
                "all_branches" as const,
              label: "All branches",
              description:
                "Apply across the complete organization.",
            },
            {
              value:
                "selected_branches" as const,
              label: "Selected branches",
              description:
                "Restrict policy to chosen branches.",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setScope(option.value)
              }
              className={cn(
                "rounded-control border p-4 text-left transition",
                scope === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <p className="text-sm font-bold">
                {option.label}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {option.description}
              </p>
            </button>
          ))}
        </div>

        {scope ===
          "selected_branches" && (
          <div className="mt-4">
            <p className="mb-3 text-sm font-semibold">
              Select branches
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {LEAVE_POLICY_BRANCH_OPTIONS.map(
                (branch) => {
                  const selected =
                    selectedBranchIds.includes(
                      branch.id,
                    );

                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() =>
                        toggleBranch(
                          branch.id,
                        )
                      }
                      className={cn(
                        "rounded-control border p-4 text-left transition",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <p className="text-sm font-bold">
                        {branch.label}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {
                          branch.employeeCount
                        }{" "}
                        employees
                      </p>
                    </button>
                  );
                },
              )}
            </div>

            {submitted &&
              selectedBranchIds.length ===
                0 && (
                <p className="mt-2 text-xs font-medium text-danger">
                  Select at least one branch.
                </p>
              )}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-bold">
          Entitlement rules
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <FormField
            label="Accrual method"
            htmlFor="leaveAccrualMethod"
          >
            <Select
              id="leaveAccrualMethod"
              value={accrualMethod}
              onChange={(event) =>
                setAccrualMethod(
                  event.target
                    .value as LeaveAccrualMethod,
                )
              }
            >
              {Object.entries(
                LEAVE_POLICY_ACCRUAL_CONFIG,
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
            label="Maximum consecutive days"
            htmlFor="maximumConsecutiveDays"
          >
            <Input
              id="maximumConsecutiveDays"
              type="number"
              min="0"
              value={
                maximumConsecutiveDays
              }
              onChange={(event) =>
                setMaximumConsecutiveDays(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Minimum notice"
            htmlFor="minimumNoticeDays"
            description="Required days before leave begins."
          >
            <Input
              id="minimumNoticeDays"
              type="number"
              min="0"
              value={
                minimumNoticeDays
              }
              onChange={(event) =>
                setMinimumNoticeDays(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Attachment required after"
            htmlFor="attachmentRequiredDays"
            description="Set zero when no attachment is required."
          >
            <Input
              id="attachmentRequiredDays"
              type="number"
              min="0"
              value={
                attachmentRequiredAfterDays
              }
              onChange={(event) =>
                setAttachmentRequiredAfterDays(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Approval workflow"
            htmlFor="leaveApprovalMode"
          >
            <Select
              id="leaveApprovalMode"
              value={approvalMode}
              onChange={(event) =>
                setApprovalMode(
                  event.target
                    .value as LeaveApprovalMode,
                )
              }
            >
              {Object.entries(
                LEAVE_POLICY_APPROVAL_CONFIG,
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
          Balance controls
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Carry forward unused leave
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Allow remaining leave to move into
                the next leave year.
              </p>
            </div>

            <Switch
              checked={
                carryForwardEnabled
              }
              onCheckedChange={
                setCarryForwardEnabled
              }
              ariaLabel="Carry forward unused leave"
            />
          </div>

          {carryForwardEnabled && (
            <FormField
              label="Carry-forward limit"
              htmlFor="carryForwardLimit"
              description="Maximum leave days transferable to the next year."
            >
              <Input
                id="carryForwardLimit"
                type="number"
                min="0"
                value={
                  carryForwardLimit
                }
                onChange={(event) =>
                  setCarryForwardLimit(
                    event.target.value,
                  )
                }
              />
            </FormField>
          )}

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">
                Allow negative leave balance
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Employees may request more leave
                than their current available balance.
              </p>
            </div>

            <Switch
              checked={
                allowNegativeBalance
              }
              onCheckedChange={
                setAllowNegativeBalance
              }
              ariaLabel="Allow negative leave balance"
            />
          </div>
        </div>
      </section>

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
