"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_FORMAT_CONFIG,
  REPORT_SCOPE_CONFIG,
  REPORT_SETTINGS_STATUS_CONFIG,
} from "@/config/reports";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  ReportFormat,
  ReportScope,
  ReportSettings,
  ReportSettingsStatus,
} from "@/types/report";

type ReportSettingsFormProps = {
  settings?: ReportSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (settings: ReportSettings) => void;
};

export function ReportSettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: ReportSettingsFormProps) {
  const [name, setName] = useState(settings?.name ?? "");
  const [scope, setScope] = useState<ReportScope>(settings?.scope ?? "organization");
  const [branchId, setBranchId] = useState(
    settings?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<ReportSettingsStatus>(settings?.status ?? "draft");
  const [defaultFormat, setDefaultFormat] = useState<ReportFormat>(
    settings?.defaultFormat ?? "xlsx",
  );
  const [retentionDays, setRetentionDays] = useState(
    String(settings?.retentionDays ?? 90),
  );
  const [maximumRowsPerExport, setMaximumRowsPerExport] = useState(
    String(settings?.maximumRowsPerExport ?? 50000),
  );
  const [allowEmployeeDataExport, setAllowEmployeeDataExport] = useState(
    settings?.allowEmployeeDataExport ?? true,
  );
  const [allowPayrollDataExport, setAllowPayrollDataExport] = useState(
    settings?.allowPayrollDataExport ?? true,
  );
  const [requireReasonForPayrollExport, setRequireReasonForPayrollExport] = useState(
    settings?.requireReasonForPayrollExport ?? true,
  );
  const [scheduledReportsEnabled, setScheduledReportsEnabled] = useState(
    settings?.scheduledReportsEnabled ?? true,
  );
  const [externalRecipientsAllowed, setExternalRecipientsAllowed] = useState(
    settings?.externalRecipientsAllowed ?? false,
  );
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(
    settings?.notifyOnCompletion ?? true,
  );
  const [includeOrganizationBranding, setIncludeOrganizationBranding] = useState(
    settings?.includeOrganizationBranding ?? true,
  );
  const [note, setNote] = useState(settings?.note ?? "");
  const [submitted, setSubmitted] = useState(false);

  const isValid = Boolean(
    name.trim() &&
    (scope === "organization" || branchId) &&
    Number(retentionDays) > 0 &&
    Number(maximumRowsPerExport) > 0,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    onSave({
      id: settings?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      defaultFormat,
      retentionDays: Number(retentionDays),
      maximumRowsPerExport: Number(maximumRowsPerExport),
      allowEmployeeDataExport,
      allowPayrollDataExport,
      requireReasonForPayrollExport,
      scheduledReportsEnabled,
      externalRecipientsAllowed,
      notifyOnCompletion,
      includeOrganizationBranding,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const switches = [
    {
      label: "Employee data exports",
      description: "Allow employee profile and workforce data to be exported.",
      checked: allowEmployeeDataExport,
      setChecked: setAllowEmployeeDataExport,
    },
    {
      label: "Payroll data exports",
      description: "Allow payroll, tax, loan and net-pay information to be exported.",
      checked: allowPayrollDataExport,
      setChecked: setAllowPayrollDataExport,
    },
    {
      label: "Require payroll export reason",
      description: "Require a business reason before payroll data is exported.",
      checked: requireReasonForPayrollExport,
      setChecked: setRequireReasonForPayrollExport,
    },
    {
      label: "Scheduled reports",
      description: "Allow recurring report generation and automatic delivery.",
      checked: scheduledReportsEnabled,
      setChecked: setScheduledReportsEnabled,
    },
    {
      label: "External recipients",
      description: "Allow scheduled reports outside the organization domain.",
      checked: externalRecipientsAllowed,
      setChecked: setExternalRecipientsAllowed,
    },
    {
      label: "Completion notifications",
      description: "Notify the requester after report processing is completed.",
      checked: notifyOnCompletion,
      setChecked: setNotifyOnCompletion,
    },
    {
      label: "Organization branding",
      description: "Include organization branding in supported report formats.",
      checked: includeOrganizationBranding,
      setChecked: setIncludeOrganizationBranding,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Settings name"
          htmlFor="reportSettingsName"
          error={submitted && !name.trim() ? "Enter a settings name" : undefined}
        >
          <Input
            id="reportSettingsName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Organization Reporting Policy"
          />
        </FormField>

        <FormField label="Status" htmlFor="reportSettingsStatus">
          <Select
            id="reportSettingsStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as ReportSettingsStatus)}
          >
            {Object.entries(REPORT_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="reportSettingsScope">
          <Select
            id="reportSettingsScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as ReportScope)}
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
            htmlFor="reportSettingsBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="reportSettingsBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Default export format" htmlFor="reportSettingsFormat">
          <Select
            id="reportSettingsFormat"
            value={defaultFormat}
            onChange={(event) => setDefaultFormat(event.target.value as ReportFormat)}
          >
            {Object.entries(REPORT_FORMAT_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Export retention"
          htmlFor="reportSettingsRetention"
          description="Days before generated report files are removed."
        >
          <Input
            id="reportSettingsRetention"
            type="number"
            min="1"
            value={retentionDays}
            onChange={(event) => setRetentionDays(event.target.value)}
          />
        </FormField>

        <FormField label="Maximum rows per export" htmlFor="reportSettingsRows">
          <Input
            id="reportSettingsRows"
            type="number"
            min="1"
            value={maximumRowsPerExport}
            onChange={(event) => setMaximumRowsPerExport(event.target.value)}
          />
        </FormField>
      </div>

      <section>
        <h3 className="font-bold">Reporting controls</h3>
        <div className="mt-4 space-y-3">
          {switches.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-text-muted">{item.description}</p>
              </div>

              <Switch
                checked={item.checked}
                onCheckedChange={item.setChecked}
                ariaLabel={item.label}
              />
            </div>
          ))}
        </div>
      </section>

      <FormField label="Internal note" htmlFor="reportSettingsNote" optional>
        <Textarea
          id="reportSettingsNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add retention, sensitive-data or branch reporting context..."
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
