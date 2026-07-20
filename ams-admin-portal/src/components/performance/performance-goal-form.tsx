"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_GOAL_LEVEL_CONFIG,
  PERFORMANCE_GOAL_STATUS_CONFIG,
} from "@/config/performance";
import { BRANCH_OPTIONS } from "@/data/branches";
import { EMPLOYEES } from "@/data/employees";
import { clampPercentage } from "@/lib/performance";
import type {
  PerformanceGoal,
  PerformanceGoalLevel,
  PerformanceGoalStatus,
} from "@/types/performance";

type Props = {
  goal?: PerformanceGoal;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (goal: PerformanceGoal) => void;
};

export function PerformanceGoalForm({ goal, selectedBranchId, onCancel, onSave }: Props) {
  const branches = useMemo(() => BRANCH_OPTIONS.filter((item) => !item.isAggregate), []);
  const initialBranchId =
    goal?.branchId ??
    (selectedBranchId === "all" ? (branches[0]?.id ?? "") : selectedBranchId);
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [branchId, setBranchId] = useState(initialBranchId);
  const [employeeId, setEmployeeId] = useState(goal?.employeeId ?? "");
  const [department, setDepartment] = useState(goal?.department ?? "");
  const [level, setLevel] = useState<PerformanceGoalLevel>(goal?.level ?? "individual");
  const [status, setStatus] = useState<PerformanceGoalStatus>(goal?.status ?? "draft");
  const [startDate, setStartDate] = useState(goal?.startDate ?? "2026-08-01");
  const [dueDate, setDueDate] = useState(goal?.dueDate ?? "2026-10-31");
  const [progress, setProgress] = useState(String(goal?.progress ?? 0));
  const [weight, setWeight] = useState(String(goal?.weight ?? 25));
  const [targetValue, setTargetValue] = useState(String(goal?.targetValue ?? 100));
  const [currentValue, setCurrentValue] = useState(String(goal?.currentValue ?? 0));
  const [unit, setUnit] = useState(goal?.unit ?? "%");
  const [ownerName, setOwnerName] = useState(goal?.ownerName ?? "");
  const [submitted, setSubmitted] = useState(false);

  const employees = EMPLOYEES.filter((employee) => employee.branchId === branchId);
  const valid = Boolean(
    title.trim() &&
    description.trim() &&
    branchId &&
    department.trim() &&
    ownerName.trim() &&
    startDate &&
    dueDate,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    onSave({
      id: goal?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      employeeId: employeeId || undefined,
      branchId,
      department: department.trim(),
      level,
      status,
      startDate,
      dueDate,
      progress: clampPercentage(Number(progress) || 0),
      weight: clampPercentage(Number(weight) || 0),
      targetValue: Math.max(Number(targetValue) || 0, 0),
      currentValue: Math.max(Number(currentValue) || 0, 0),
      unit: unit.trim(),
      ownerName: ownerName.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Goal title"
          htmlFor="performanceGoalTitle"
          error={submitted && !title.trim() ? "Enter a goal title" : undefined}
        >
          <Input
            id="performanceGoalTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </FormField>
        <FormField label="Goal level" htmlFor="performanceGoalLevel">
          <Select
            id="performanceGoalLevel"
            value={level}
            onChange={(event) => setLevel(event.target.value as PerformanceGoalLevel)}
          >
            {Object.entries(PERFORMANCE_GOAL_LEVEL_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Branch" htmlFor="performanceGoalBranch">
          <Select
            id="performanceGoalBranch"
            value={branchId}
            onChange={(event) => {
              setBranchId(event.target.value);
              setEmployeeId("");
            }}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Employee" htmlFor="performanceGoalEmployee" optional>
          <Select
            id="performanceGoalEmployee"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          >
            <option value="">No individual employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} â€” {employee.employeeCode}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Department"
          htmlFor="performanceGoalDepartment"
          error={submitted && !department.trim() ? "Enter a department" : undefined}
        >
          <Input
            id="performanceGoalDepartment"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          />
        </FormField>
        <FormField
          label="Owner"
          htmlFor="performanceGoalOwner"
          error={submitted && !ownerName.trim() ? "Enter a goal owner" : undefined}
        >
          <Input
            id="performanceGoalOwner"
            value={ownerName}
            onChange={(event) => setOwnerName(event.target.value)}
          />
        </FormField>
        <FormField label="Status" htmlFor="performanceGoalStatus">
          <Select
            id="performanceGoalStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as PerformanceGoalStatus)}
          >
            {Object.entries(PERFORMANCE_GOAL_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Weight" htmlFor="performanceGoalWeight">
          <Input
            id="performanceGoalWeight"
            type="number"
            min="0"
            max="100"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </FormField>
        <FormField label="Start date" htmlFor="performanceGoalStart">
          <Input
            id="performanceGoalStart"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </FormField>
        <FormField label="Due date" htmlFor="performanceGoalDue">
          <Input
            id="performanceGoalDue"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </FormField>
        <FormField label="Progress" htmlFor="performanceGoalProgress">
          <Input
            id="performanceGoalProgress"
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
          />
        </FormField>
        <FormField label="Unit" htmlFor="performanceGoalUnit">
          <Input
            id="performanceGoalUnit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          />
        </FormField>
        <FormField label="Current value" htmlFor="performanceGoalCurrent">
          <Input
            id="performanceGoalCurrent"
            type="number"
            min="0"
            value={currentValue}
            onChange={(event) => setCurrentValue(event.target.value)}
          />
        </FormField>
        <FormField label="Target value" htmlFor="performanceGoalTarget">
          <Input
            id="performanceGoalTarget"
            type="number"
            min="0"
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
          />
        </FormField>
      </div>
      <FormField
        label="Goal description"
        htmlFor="performanceGoalDescription"
        error={submitted && !description.trim() ? "Enter a goal description" : undefined}
      >
        <Textarea
          id="performanceGoalDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormField>
      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {PERFORMANCE_COPY.actions.cancel}
        </Button>
        <Button type="submit">
          {goal ? PERFORMANCE_COPY.actions.save : PERFORMANCE_COPY.actions.addGoal}
        </Button>
      </div>
    </form>
  );
}
