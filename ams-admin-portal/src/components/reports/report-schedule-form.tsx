"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  REPORT_FORMAT_CONFIG,
  REPORT_SCHEDULE_FREQUENCY_CONFIG,
  REPORT_SCHEDULE_STATUS_CONFIG,
  REPORT_SCOPE_CONFIG,
} from "@/config/reports";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  ReportDefinition,
  ReportFormat,
  ReportSchedule,
  ReportScheduleFrequency,
  ReportScheduleStatus,
  ReportScope,
} from "@/types/report";

type ReportScheduleFormProps = {
  schedule?: ReportSchedule;
  reports: ReportDefinition[];
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (schedule: ReportSchedule) => void;
};

function buildNextRun(
  frequency: ReportScheduleFrequency,
  runAt: string,
  dayOfWeek: number,
  dayOfMonth: number,
) {
  const now = new Date();
  const next = new Date(now);
  const [hour, minute] = runAt.split(":").map(Number);

  next.setHours(hour, minute, 0, 0);

  if (frequency === "daily" && next <= now) {
    next.setDate(next.getDate() + 1);
  }

  if (frequency === "weekly") {
    const difference = (dayOfWeek - next.getDay() + 7) % 7;
    next.setDate(
      next.getDate() + (difference === 0 && next <= now ? 7 : difference),
    );
  }

  if (frequency === "monthly" || frequency === "quarterly") {
    next.setDate(dayOfMonth);

    if (next <= now) {
      next.setMonth(
        next.getMonth() + (frequency === "quarterly" ? 3 : 1),
      );
    }
  }

  return next.toISOString();
}

export function ReportScheduleForm({
  schedule,
  reports,
  selectedBranchId,
  onCancel,
  onSave,
}: ReportScheduleFormProps) {
  const activeReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.status === "active" &&
          (selectedBranchId === "all" ||
            report.scope === "organization" ||
            report.branchId === selectedBranchId),
      ),
    [reports, selectedBranchId],
  );

  const initialReportId = schedule?.reportId ?? activeReports[0]?.id ?? "";
  const initialReport = reports.find((report) => report.id === initialReportId);

  const [name, setName] = useState(schedule?.name ?? "");
  const [reportId, setReportId] = useState(initialReportId);
  const [scope, setScope] = useState<ReportScope>(
    schedule?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    schedule?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<ReportScheduleStatus>(
    schedule?.status ?? "active",
  );
  const [frequency, setFrequency] = useState<ReportScheduleFrequency>(
    schedule?.frequency ?? "monthly",
  );
  const [runAt, setRunAt] = useState(schedule?.runAt ?? "08:00");
  const [dayOfWeek, setDayOfWeek] = useState(
    String(schedule?.dayOfWeek ?? 1),
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    String(schedule?.dayOfMonth ?? 1),
  );
  const [format, setFormat] = useState<ReportFormat>(
    schedule?.format ?? initialReport?.defaultFormat ?? "xlsx",
  );
  const [recipients, setRecipients] = useState(
    schedule?.recipients.join(", ") ?? "",
  );
  const [includeEmptyReport, setIncludeEmptyReport] = useState(
    schedule?.includeEmptyReport ?? false,
  );
  const [submitted, setSubmitted] = useState(false);

  const selectedReport = reports.find((report) => report.id === reportId);
  const parsedRecipients = recipients
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  const isValid = Boolean(
    name.trim() &&
      reportId &&
      (scope === "organization" || branchId) &&
      runAt &&
      parsedRecipients.length > 0,
  );

  function handleReportChange(nextReportId: string) {
    setReportId(nextReportId);
    const report = reports.find((item) => item.id === nextReportId);

    if (report) {
      setFormat(report.defaultFormat);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    onSave({
      id: schedule?.id ?? crypto.randomUUID(),
      reportId,
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      frequency,
      runAt,
      dayOfWeek: frequency === "weekly" ? Number(dayOfWeek) : undefined,
      dayOfMonth:
        frequency === "monthly" || frequency === "quarterly"
          ? Number(dayOfMonth)
          : undefined,
      format,
      recipients: parsedRecipients,
      includeEmptyReport,
      nextRunAt: buildNextRun(
        frequency,
        runAt,
        Number(dayOfWeek),
        Number(dayOfMonth),
      ),
      lastRunAt: schedule?.lastRunAt,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Schedule name"
          htmlFor="reportScheduleName"
          error={submitted && !name.trim() ? "Enter a schedule name" : undefined}
        >
          <Input
            id="reportScheduleName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Monthly Attendance — All Branches"
          />
        </FormField>

        <FormField
          label="Report"
          htmlFor="reportScheduleReport"
          error={submitted && !reportId ? "Select a report" : undefined}
        >
          <Select
            id="reportScheduleReport"
            value={reportId}
            onChange={(event) => handleReportChange(event.target.value)}
          >
            <option value="">Select report</option>
            {activeReports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Status" htmlFor="reportScheduleStatus">
          <Select
            id="reportScheduleStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ReportScheduleStatus)
            }
          >
            {Object.entries(REPORT_SCHEDULE_STATUS_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Frequency" htmlFor="reportScheduleFrequency">
          <Select
            id="reportScheduleFrequency"
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as ReportScheduleFrequency)
            }
          >
            {Object.entries(REPORT_SCHEDULE_FREQUENCY_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="reportScheduleScope">
          <Select
            id="reportScheduleScope"
            value={scope}
            onChange={(event) =>
              setScope(event.target.value as ReportScope)
            }
          >
            {Object.entries(REPORT_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="reportScheduleBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="reportScheduleBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map(
                (branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ),
              )}
            </Select>
          </FormField>
        )}

        <FormField label="Run time" htmlFor="reportScheduleTime">
          <Input
            id="reportScheduleTime"
            type="time"
            value={runAt}
            onChange={(event) => setRunAt(event.target.value)}
          />
        </FormField>

        {frequency === "weekly" && (
          <FormField label="Day of week" htmlFor="reportScheduleWeekday">
            <Select
              id="reportScheduleWeekday"
              value={dayOfWeek}
              onChange={(event) => setDayOfWeek(event.target.value)}
            >
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday</option>
            </Select>
          </FormField>
        )}

        {(frequency === "monthly" || frequency === "quarterly") && (
          <FormField label="Day of month" htmlFor="reportScheduleMonthDay">
            <Input
              id="reportScheduleMonthDay"
              type="number"
              min="1"
              max="28"
              value={dayOfMonth}
              onChange={(event) => setDayOfMonth(event.target.value)}
            />
          </FormField>
        )}

        <FormField label="Output format" htmlFor="reportScheduleFormat">
          <Select
            id="reportScheduleFormat"
            value={format}
            onChange={(event) =>
              setFormat(event.target.value as ReportFormat)
            }
          >
            {(selectedReport?.availableFormats ??
              (Object.keys(REPORT_FORMAT_CONFIG) as ReportFormat[])).map(
              (value) => (
                <option key={value} value={value}>
                  {REPORT_FORMAT_CONFIG[value].label}
                </option>
              ),
            )}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Recipients"
        htmlFor="reportScheduleRecipients"
        description="Separate recipient email addresses with commas."
        error={
          submitted && parsedRecipients.length === 0
            ? "Add at least one recipient"
            : undefined
        }
      >
        <Input
          id="reportScheduleRecipients"
          value={recipients}
          onChange={(event) => setRecipients(event.target.value)}
          placeholder="people@ams.example, finance@ams.example"
        />
      </FormField>

      <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
        <div>
          <p className="text-sm font-semibold">Send empty reports</p>
          <p className="mt-1 text-xs text-text-muted">
            Deliver the scheduled file even when the report contains no records.
          </p>
        </div>

        <Switch
          checked={includeEmptyReport}
          onCheckedChange={setIncludeEmptyReport}
          ariaLabel="Send empty scheduled reports"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {schedule ? "Save schedule" : "Create schedule"}
        </Button>
      </div>
    </form>
  );
}
