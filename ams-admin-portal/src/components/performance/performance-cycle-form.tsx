"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_CYCLE_SCOPE_CONFIG,
  PERFORMANCE_CYCLE_STATUS_CONFIG,
} from "@/config/performance";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  PerformanceCycle,
  PerformanceCycleScope,
  PerformanceCycleStatus,
} from "@/types/performance";

type Props = {
  cycle?: PerformanceCycle;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (cycle: PerformanceCycle) => void;
};

export function PerformanceCycleForm({
  cycle,
  selectedBranchId,
  onCancel,
  onSave,
}: Props) {
  const businessBranches = useMemo(
    () => BRANCH_OPTIONS.filter((branch) => !branch.isAggregate),
    [],
  );
  const [name, setName] = useState(cycle?.name ?? "");
  const [scope, setScope] = useState<PerformanceCycleScope>(
    cycle?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    cycle?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<PerformanceCycleStatus>(cycle?.status ?? "draft");
  const [startDate, setStartDate] = useState(cycle?.startDate ?? "2026-08-01");
  const [endDate, setEndDate] = useState(cycle?.endDate ?? "2026-08-31");
  const [selfReviewDueDate, setSelfReviewDueDate] = useState(
    cycle?.selfReviewDueDate ?? "2026-08-15",
  );
  const [managerReviewDueDate, setManagerReviewDueDate] = useState(
    cycle?.managerReviewDueDate ?? "2026-08-24",
  );
  const [calibrationDate, setCalibrationDate] = useState(
    cycle?.calibrationDate ?? "2026-08-28",
  );
  const [participants, setParticipants] = useState(String(cycle?.participants ?? 0));
  const [note, setNote] = useState(cycle?.note ?? "");
  const [submitted, setSubmitted] = useState(false);

  const valid = Boolean(
    name.trim() &&
    startDate &&
    endDate &&
    selfReviewDueDate &&
    managerReviewDueDate &&
    calibrationDate &&
    (scope === "organization" || branchId),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;

    const branch = businessBranches.find((item) => item.id === branchId);
    onSave({
      id: cycle?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      startDate,
      endDate,
      selfReviewDueDate,
      managerReviewDueDate,
      calibrationDate,
      participants: Math.max(Number(participants) || 0, 0),
      completedReviews: cycle?.completedReviews ?? 0,
      createdBy: cycle?.createdBy ?? CURRENT_ADMIN.name,
      updatedAt: new Date().toISOString().slice(0, 10),
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Cycle name"
          htmlFor="performanceCycleName"
          error={submitted && !name.trim() ? "Enter a cycle name" : undefined}
        >
          <Input
            id="performanceCycleName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: 2026 Annual Review"
          />
        </FormField>
        <FormField label="Cycle status" htmlFor="performanceCycleStatus">
          <Select
            id="performanceCycleStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as PerformanceCycleStatus)}
          >
            {Object.entries(PERFORMANCE_CYCLE_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Cycle scope" htmlFor="performanceCycleScope">
          <Select
            id="performanceCycleScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as PerformanceCycleScope)}
          >
            {Object.entries(PERFORMANCE_CYCLE_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="performanceCycleBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="performanceCycleBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {businessBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <FormField label="Start date" htmlFor="performanceCycleStart">
          <Input
            id="performanceCycleStart"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </FormField>
        <FormField label="End date" htmlFor="performanceCycleEnd">
          <Input
            id="performanceCycleEnd"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </FormField>
        <FormField label="Self-review deadline" htmlFor="performanceSelfDue">
          <Input
            id="performanceSelfDue"
            type="date"
            value={selfReviewDueDate}
            onChange={(event) => setSelfReviewDueDate(event.target.value)}
          />
        </FormField>
        <FormField label="Manager-review deadline" htmlFor="performanceManagerDue">
          <Input
            id="performanceManagerDue"
            type="date"
            value={managerReviewDueDate}
            onChange={(event) => setManagerReviewDueDate(event.target.value)}
          />
        </FormField>
        <FormField label="Calibration date" htmlFor="performanceCalibrationDate">
          <Input
            id="performanceCalibrationDate"
            type="date"
            value={calibrationDate}
            onChange={(event) => setCalibrationDate(event.target.value)}
          />
        </FormField>
        <FormField label="Participants" htmlFor="performanceParticipants">
          <Input
            id="performanceParticipants"
            type="number"
            min="0"
            value={participants}
            onChange={(event) => setParticipants(event.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Cycle note" htmlFor="performanceCycleNote" optional>
        <Textarea
          id="performanceCycleNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>
      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {PERFORMANCE_COPY.actions.cancel}
        </Button>
        <Button type="submit">
          {cycle ? PERFORMANCE_COPY.actions.save : PERFORMANCE_COPY.actions.addCycle}
        </Button>
      </div>
    </form>
  );
}
