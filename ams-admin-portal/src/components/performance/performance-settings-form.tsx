"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_REVIEW_FREQUENCY_CONFIG,
  PERFORMANCE_SETTINGS_SCOPE_CONFIG,
  PERFORMANCE_SETTINGS_STATUS_CONFIG,
} from "@/config/performance";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  PerformanceReviewFrequency,
  PerformanceSettings,
  PerformanceSettingsScope,
  PerformanceSettingsStatus,
} from "@/types/performance";

type Props = {
  settings?: PerformanceSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (settings: PerformanceSettings) => void;
};

export function PerformanceSettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: Props) {
  const branches = useMemo(() => BRANCH_OPTIONS.filter((item) => !item.isAggregate), []);
  const [name, setName] = useState(settings?.name ?? "");
  const [scope, setScope] = useState<PerformanceSettingsScope>(
    settings?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    settings?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<PerformanceSettingsStatus>(
    settings?.status ?? "draft",
  );
  const [reviewFrequency, setReviewFrequency] = useState<PerformanceReviewFrequency>(
    settings?.reviewFrequency ?? "biannual",
  );
  const [ratingScaleMaximum, setRatingScaleMaximum] = useState(
    String(settings?.ratingScaleMaximum ?? 5),
  );
  const [goalWeight, setGoalWeight] = useState(String(settings?.goalWeight ?? 60));
  const [competencyWeight, setCompetencyWeight] = useState(
    String(settings?.competencyWeight ?? 40),
  );
  const [requireSelfReview, setRequireSelfReview] = useState(
    settings?.requireSelfReview ?? true,
  );
  const [requireManagerReview, setRequireManagerReview] = useState(
    settings?.requireManagerReview ?? true,
  );
  const [requireCalibration, setRequireCalibration] = useState(
    settings?.requireCalibration ?? true,
  );
  const [allowPeerFeedback, setAllowPeerFeedback] = useState(
    settings?.allowPeerFeedback ?? true,
  );
  const [reminderDaysBeforeDue, setReminderDaysBeforeDue] = useState(
    String(settings?.reminderDaysBeforeDue ?? 5),
  );
  const [note, setNote] = useState(settings?.note ?? "");
  const [submitted, setSubmitted] = useState(false);

  const valid = Boolean(
    name.trim() &&
    (scope === "organization" || branchId) &&
    Number(goalWeight) + Number(competencyWeight) === 100,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    const branch = branches.find((item) => item.id === branchId);
    onSave({
      id: settings?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      reviewFrequency,
      ratingScaleMaximum: Math.max(Number(ratingScaleMaximum) || 5, 1),
      goalWeight: Number(goalWeight),
      competencyWeight: Number(competencyWeight),
      requireSelfReview,
      requireManagerReview,
      requireCalibration,
      allowPeerFeedback,
      reminderDaysBeforeDue: Math.max(Number(reminderDaysBeforeDue) || 0, 0),
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const controls = [
    {
      label: "Require self review",
      description: "Employees complete a self-assessment before manager review.",
      checked: requireSelfReview,
      onChange: setRequireSelfReview,
    },
    {
      label: "Require manager review",
      description: "Every employee receives a manager assessment.",
      checked: requireManagerReview,
      onChange: setRequireManagerReview,
    },
    {
      label: "Require calibration",
      description: "Final ratings pass through a calibration stage.",
      checked: requireCalibration,
      onChange: setRequireCalibration,
    },
    {
      label: "Allow peer feedback",
      description: "Managers may request structured feedback from peers.",
      checked: allowPeerFeedback,
      onChange: setAllowPeerFeedback,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Configuration name"
          htmlFor="performanceSettingsName"
          error={submitted && !name.trim() ? "Enter a configuration name" : undefined}
        >
          <Input
            id="performanceSettingsName"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
        <FormField label="Status" htmlFor="performanceSettingsStatus">
          <Select
            id="performanceSettingsStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as PerformanceSettingsStatus)
            }
          >
            {Object.entries(PERFORMANCE_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Scope" htmlFor="performanceSettingsScope">
          <Select
            id="performanceSettingsScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as PerformanceSettingsScope)}
          >
            {Object.entries(PERFORMANCE_SETTINGS_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="performanceSettingsBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="performanceSettingsBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <FormField label="Review frequency" htmlFor="performanceReviewFrequency">
          <Select
            id="performanceReviewFrequency"
            value={reviewFrequency}
            onChange={(event) =>
              setReviewFrequency(event.target.value as PerformanceReviewFrequency)
            }
          >
            {Object.entries(PERFORMANCE_REVIEW_FREQUENCY_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>
        <FormField label="Rating scale maximum" htmlFor="performanceRatingMaximum">
          <Input
            id="performanceRatingMaximum"
            type="number"
            min="3"
            max="10"
            value={ratingScaleMaximum}
            onChange={(event) => setRatingScaleMaximum(event.target.value)}
          />
        </FormField>
        <FormField label="Goal weight" htmlFor="performanceGoalWeight">
          <Input
            id="performanceGoalWeight"
            type="number"
            min="0"
            max="100"
            value={goalWeight}
            onChange={(event) => setGoalWeight(event.target.value)}
          />
        </FormField>
        <FormField
          label="Competency weight"
          htmlFor="performanceCompetencyWeight"
          error={
            submitted && Number(goalWeight) + Number(competencyWeight) !== 100
              ? "Goal and competency weights must total 100"
              : undefined
          }
        >
          <Input
            id="performanceCompetencyWeight"
            type="number"
            min="0"
            max="100"
            value={competencyWeight}
            onChange={(event) => setCompetencyWeight(event.target.value)}
          />
        </FormField>
        <FormField label="Reminder days before due" htmlFor="performanceReminderDays">
          <Input
            id="performanceReminderDays"
            type="number"
            min="0"
            value={reminderDaysBeforeDue}
            onChange={(event) => setReminderDaysBeforeDue(event.target.value)}
          />
        </FormField>
      </div>
      <section>
        <h3 className="font-bold">Workflow controls</h3>
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
                onCheckedChange={control.onChange}
                ariaLabel={control.label}
              />
            </div>
          ))}
        </div>
      </section>
      <FormField label="Configuration note" htmlFor="performanceSettingsNote" optional>
        <Textarea
          id="performanceSettingsNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>
      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {PERFORMANCE_COPY.actions.cancel}
        </Button>
        <Button type="submit">
          {settings
            ? PERFORMANCE_COPY.actions.save
            : PERFORMANCE_COPY.actions.addSettings}
        </Button>
      </div>
    </form>
  );
}
