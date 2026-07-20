"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ATTENDANCE_POLICY_BRANCH_OPTIONS,
  getPolicyEmployeeCount,
} from "@/config/attendance-policies";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { cn } from "@/lib/utils";
import type {
  AttendancePolicy,
  AttendancePolicyScope,
  AttendancePolicyStatus,
} from "@/types/attendance-policy";

type AttendancePolicyFormProps = {
  policy?: AttendancePolicy;
  onCancel: () => void;
  onSave: (policy: AttendancePolicy) => void;
};

export function AttendancePolicyForm({
  policy,
  onCancel,
  onSave,
}: AttendancePolicyFormProps) {
  const [name, setName] = useState(policy?.name ?? "");

  const [description, setDescription] = useState(policy?.description ?? "");

  const [status, setStatus] = useState<AttendancePolicyStatus>(policy?.status ?? "draft");

  const [scope, setScope] = useState<AttendancePolicyScope>(
    policy?.scope ?? "all_branches",
  );

  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(
    policy?.branchIds ?? [],
  );

  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(
    String(policy?.rules.gracePeriodMinutes ?? 10),
  );

  const [lateAfterMinutes, setLateAfterMinutes] = useState(
    String(policy?.rules.lateAfterMinutes ?? 10),
  );

  const [absenceAfterMinutes, setAbsenceAfterMinutes] = useState(
    String(policy?.rules.absenceAfterMinutes ?? 120),
  );

  const [minimumHalfDayMinutes, setMinimumHalfDayMinutes] = useState(
    String(policy?.rules.minimumHalfDayMinutes ?? 240),
  );

  const [standardDailyMinutes, setStandardDailyMinutes] = useState(
    String(policy?.rules.standardDailyMinutes ?? 480),
  );

  const [overtimeAfterMinutes, setOvertimeAfterMinutes] = useState(
    String(policy?.rules.overtimeAfterMinutes ?? 480),
  );

  const [correctionWindowDays, setCorrectionWindowDays] = useState(
    String(policy?.rules.correctionWindowDays ?? 3),
  );

  const [requireLocation, setRequireLocation] = useState(
    policy?.rules.requireLocation ?? true,
  );

  const [allowRemoteAttendance, setAllowRemoteAttendance] = useState(
    policy?.rules.allowRemoteAttendance ?? false,
  );

  const [autoApproveOvertime, setAutoApproveOvertime] = useState(
    policy?.rules.autoApproveOvertime ?? false,
  );

  const [submitted, setSubmitted] = useState(false);

  const branchSelectionValid = scope === "all_branches" || selectedBranchIds.length > 0;

  const isValid = Boolean(name.trim() && description.trim() && branchSelectionValid);

  function toggleBranch(branchId: string) {
    setSelectedBranchIds((currentBranchIds) =>
      currentBranchIds.includes(branchId)
        ? currentBranchIds.filter((item) => item !== branchId)
        : [...currentBranchIds, branchId],
    );
  }

  function toPositiveNumber(value: string) {
    return Math.max(Number(value) || 0, 0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branchIds = scope === "all_branches" ? [] : selectedBranchIds;

    onSave({
      id: policy?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      status,
      scope,
      branchIds,
      applicableEmployees: getPolicyEmployeeCount(scope, branchIds),
      rules: {
        gracePeriodMinutes: toPositiveNumber(gracePeriodMinutes),
        lateAfterMinutes: toPositiveNumber(lateAfterMinutes),
        absenceAfterMinutes: toPositiveNumber(absenceAfterMinutes),
        minimumHalfDayMinutes: toPositiveNumber(minimumHalfDayMinutes),
        standardDailyMinutes: toPositiveNumber(standardDailyMinutes),
        overtimeAfterMinutes: toPositiveNumber(overtimeAfterMinutes),
        correctionWindowDays: toPositiveNumber(correctionWindowDays),
        requireLocation,
        allowRemoteAttendance,
        autoApproveOvertime,
      },
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Policy name"
          htmlFor="policyName"
          error={submitted && !name.trim() ? "Enter a policy name" : undefined}
        >
          <Input
            id="policyName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Standard Attendance Policy"
          />
        </FormField>

        <FormField label="Policy status" htmlFor="policyStatus">
          <Select
            id="policyStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as AttendancePolicyStatus)}
          >
            <option value="active">Active</option>

            <option value="draft">Draft</option>

            <option value="archived">Archived</option>
          </Select>
        </FormField>

        <FormField
          label="Description"
          htmlFor="policyDescription"
          className="md:col-span-2"
          error={submitted && !description.trim() ? "Describe this policy" : undefined}
        >
          <Textarea
            id="policyDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain where and how this policy should apply..."
          />
        </FormField>
      </section>

      <section>
        <h3 className="font-bold">Policy scope</h3>

        <p className="mt-1 text-sm text-text-muted">
          Choose whether this policy applies organization-wide or only to selected
          branches.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              value: "all_branches" as const,
              label: "All branches",
              description: "Apply to the complete organization.",
            },
            {
              value: "selected_branches" as const,
              label: "Selected branches",
              description: "Apply only to chosen branches.",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setScope(option.value)}
              className={cn(
                "rounded-control border p-4 text-left transition",
                scope === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <p className="text-sm font-bold">{option.label}</p>

              <p className="mt-1 text-xs text-text-muted">{option.description}</p>
            </button>
          ))}
        </div>

        {scope === "selected_branches" && (
          <div className="mt-4">
            <p className="mb-3 text-sm font-semibold">Select branches</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {ATTENDANCE_POLICY_BRANCH_OPTIONS.map((branch) => {
                const selected = selectedBranchIds.includes(branch.id);

                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => toggleBranch(branch.id)}
                    className={cn(
                      "rounded-control border p-4 text-left transition",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <p className="text-sm font-bold">{branch.label}</p>

                    <p className="mt-1 text-xs text-text-muted">
                      {branch.employeeCount} employees
                    </p>
                  </button>
                );
              })}
            </div>

            {submitted && selectedBranchIds.length === 0 && (
              <p className="mt-2 text-xs font-medium text-danger">
                Select at least one branch.
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-bold">Attendance thresholds</h3>

        <p className="mt-1 text-sm text-text-muted">
          Configure working-hour and attendance exception limits.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <FormField
            label="Grace period"
            htmlFor="gracePeriodMinutes"
            description="Minutes allowed after shift start."
          >
            <Input
              id="gracePeriodMinutes"
              type="number"
              min="0"
              value={gracePeriodMinutes}
              onChange={(event) => setGracePeriodMinutes(event.target.value)}
            />
          </FormField>

          <FormField
            label="Mark late after"
            htmlFor="lateAfterMinutes"
            description="Minutes after shift start."
          >
            <Input
              id="lateAfterMinutes"
              type="number"
              min="0"
              value={lateAfterMinutes}
              onChange={(event) => setLateAfterMinutes(event.target.value)}
            />
          </FormField>

          <FormField
            label="Mark absent after"
            htmlFor="absenceAfterMinutes"
            description="Minutes without a check-in."
          >
            <Input
              id="absenceAfterMinutes"
              type="number"
              min="0"
              value={absenceAfterMinutes}
              onChange={(event) => setAbsenceAfterMinutes(event.target.value)}
            />
          </FormField>

          <FormField
            label="Half-day minimum"
            htmlFor="minimumHalfDayMinutes"
            description="Minimum worked minutes."
          >
            <Input
              id="minimumHalfDayMinutes"
              type="number"
              min="0"
              value={minimumHalfDayMinutes}
              onChange={(event) => setMinimumHalfDayMinutes(event.target.value)}
            />
          </FormField>

          <FormField
            label="Standard workday"
            htmlFor="standardDailyMinutes"
            description="Expected working minutes per day."
          >
            <Input
              id="standardDailyMinutes"
              type="number"
              min="0"
              value={standardDailyMinutes}
              onChange={(event) => setStandardDailyMinutes(event.target.value)}
            />
          </FormField>

          <FormField
            label="Overtime threshold"
            htmlFor="overtimeAfterMinutes"
            description="Overtime starts after these minutes."
          >
            <Input
              id="overtimeAfterMinutes"
              type="number"
              min="0"
              value={overtimeAfterMinutes}
              onChange={(event) => setOvertimeAfterMinutes(event.target.value)}
            />
          </FormField>

          <FormField
            label="Correction window"
            htmlFor="correctionWindowDays"
            description="Days employees can request a correction."
          >
            <Input
              id="correctionWindowDays"
              type="number"
              min="0"
              value={correctionWindowDays}
              onChange={(event) => setCorrectionWindowDays(event.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">Attendance controls</h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">Require attendance location</p>

              <p className="mt-1 text-xs text-text-muted">
                Validate employee location during mobile check-in.
              </p>
            </div>

            <Switch
              checked={requireLocation}
              onCheckedChange={setRequireLocation}
              ariaLabel="Require attendance location"
            />
          </div>

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">Allow remote attendance</p>

              <p className="mt-1 text-xs text-text-muted">
                Permit approved employees to check in outside office locations.
              </p>
            </div>

            <Switch
              checked={allowRemoteAttendance}
              onCheckedChange={setAllowRemoteAttendance}
              ariaLabel="Allow remote attendance"
            />
          </div>

          <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
            <div>
              <p className="text-sm font-semibold">Automatically approve overtime</p>

              <p className="mt-1 text-xs text-text-muted">
                Skip manager approval for qualifying overtime records.
              </p>
            </div>

            <Switch
              checked={autoApproveOvertime}
              onCheckedChange={setAutoApproveOvertime}
              ariaLabel="Automatically approve overtime"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{policy ? "Save policy" : "Create policy"}</Button>
      </div>
    </form>
  );
}
