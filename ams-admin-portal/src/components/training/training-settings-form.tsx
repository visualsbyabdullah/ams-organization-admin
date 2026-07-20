"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  TRAINING_SETTINGS_SCOPE_CONFIG,
  TRAINING_SETTINGS_STATUS_CONFIG,
} from "@/config/training";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  TrainingSettings,
  TrainingSettingsScope,
  TrainingSettingsStatus,
} from "@/types/training";

type TrainingSettingsFormProps = {
  settings?: TrainingSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (settings: TrainingSettings) => void;
};

export function TrainingSettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: TrainingSettingsFormProps) {
  const [name, setName] = useState(settings?.name ?? "");

  const [scope, setScope] = useState<TrainingSettingsScope>(
    settings?.scope ?? "organization",
  );

  const [branchId, setBranchId] = useState(
    settings?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );

  const [status, setStatus] = useState<TrainingSettingsStatus>(
    settings?.status ?? "draft",
  );

  const [defaultDueDays, setDefaultDueDays] = useState(
    String(settings?.defaultDueDays ?? 30),
  );

  const [reminderDaysBeforeDue, setReminderDaysBeforeDue] = useState(
    String(settings?.reminderDaysBeforeDue ?? 7),
  );

  const [allowSelfEnrollment, setAllowSelfEnrollment] = useState(
    settings?.allowSelfEnrollment ?? true,
  );

  const [managerApprovalRequired, setManagerApprovalRequired] = useState(
    settings?.managerApprovalRequired ?? true,
  );

  const [autoIssueCertificates, setAutoIssueCertificates] = useState(
    settings?.autoIssueCertificates ?? true,
  );

  const [certificationExpiryReminderDays, setCertificationExpiryReminderDays] = useState(
    String(settings?.certificationExpiryReminderDays ?? 30),
  );

  const [mandatoryCompletionTarget, setMandatoryCompletionTarget] = useState(
    String(settings?.mandatoryCompletionTarget ?? 95),
  );

  const [note, setNote] = useState(settings?.note ?? "");

  const [submitted, setSubmitted] = useState(false);

  const branchOptions = BRANCH_OPTIONS.filter((branch) => !branch.isAggregate);

  const dueDaysValue = Math.max(Number(defaultDueDays) || 0, 1);

  const reminderValue = Math.max(Number(reminderDaysBeforeDue) || 0, 0);

  const expiryReminderValue = Math.max(Number(certificationExpiryReminderDays) || 0, 0);

  const completionTargetValue = Math.min(
    Math.max(Number(mandatoryCompletionTarget) || 0, 0),
    100,
  );

  const isValid = Boolean(
    name.trim() && dueDaysValue > 0 && (scope === "organization" || branchId),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const selectedBranch = branchOptions.find((branch) => branch.id === branchId);

    onSave({
      id: settings?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? selectedBranch?.name : undefined,
      status,
      defaultDueDays: dueDaysValue,
      reminderDaysBeforeDue: reminderValue,
      allowSelfEnrollment,
      managerApprovalRequired,
      autoIssueCertificates,
      certificationExpiryReminderDays: expiryReminderValue,
      mandatoryCompletionTarget: completionTargetValue,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const controls = [
    {
      label: "Allow self-enrollment",
      description: "Employees may request enrollment in published optional courses.",
      checked: allowSelfEnrollment,
      onCheckedChange: setAllowSelfEnrollment,
    },
    {
      label: "Manager approval required",
      description: "Self-enrollment requests require manager approval before assignment.",
      checked: managerApprovalRequired,
      onCheckedChange: setManagerApprovalRequired,
    },
    {
      label: "Issue certificates automatically",
      description:
        "Create a certificate when the employee meets completion requirements.",
      checked: autoIssueCertificates,
      onCheckedChange: setAutoIssueCertificates,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Settings name"
          htmlFor="trainingSettingsName"
          error={submitted && !name.trim() ? "Enter a settings name" : undefined}
        >
          <Input
            id="trainingSettingsName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Organization Training Defaults"
          />
        </FormField>

        <FormField label="Status" htmlFor="trainingSettingsStatus">
          <Select
            id="trainingSettingsStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as TrainingSettingsStatus)}
          >
            {Object.entries(TRAINING_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Settings scope" htmlFor="trainingSettingsScope">
          <Select
            id="trainingSettingsScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as TrainingSettingsScope)}
          >
            {Object.entries(TRAINING_SETTINGS_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="trainingSettingsBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="trainingSettingsBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>

              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}
      </section>

      <section>
        <h3 className="font-bold">Assignment and reminders</h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Default completion window"
            htmlFor="trainingDefaultDueDays"
            description="Days allowed after a course is assigned."
          >
            <Input
              id="trainingDefaultDueDays"
              type="number"
              min="1"
              value={defaultDueDays}
              onChange={(event) => setDefaultDueDays(event.target.value)}
            />
          </FormField>

          <FormField
            label="Reminder before due date"
            htmlFor="trainingReminderDays"
            description="Days before the deadline to send a reminder."
          >
            <Input
              id="trainingReminderDays"
              type="number"
              min="0"
              value={reminderDaysBeforeDue}
              onChange={(event) => setReminderDaysBeforeDue(event.target.value)}
            />
          </FormField>

          <FormField
            label="Certificate expiry reminder"
            htmlFor="trainingExpiryReminder"
            description="Days before certificate expiry to notify the employee."
          >
            <Input
              id="trainingExpiryReminder"
              type="number"
              min="0"
              value={certificationExpiryReminderDays}
              onChange={(event) => setCertificationExpiryReminderDays(event.target.value)}
            />
          </FormField>

          <FormField
            label="Mandatory completion target"
            htmlFor="trainingCompletionTarget"
            description="Target completion percentage for mandatory courses."
          >
            <Input
              id="trainingCompletionTarget"
              type="number"
              min="0"
              max="100"
              value={mandatoryCompletionTarget}
              onChange={(event) => setMandatoryCompletionTarget(event.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">Enrollment and certification controls</h3>

        <div className="mt-4 space-y-3">
          {controls.map((control) => (
            <div
              key={control.label}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">{control.label}</p>

                <p className="mt-1 text-xs text-text-muted">{control.description}</p>
              </div>

              <Switch
                checked={control.checked}
                onCheckedChange={control.onCheckedChange}
                ariaLabel={control.label}
              />
            </div>
          ))}
        </div>
      </section>

      <FormField label="Internal note" htmlFor="trainingSettingsNote" optional>
        <Textarea
          id="trainingSettingsNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add rollout, compliance or branch-specific context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{settings ? "Save settings" : "Create settings"}</Button>
      </div>
    </form>
  );
}
