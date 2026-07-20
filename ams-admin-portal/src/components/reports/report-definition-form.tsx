"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_CATEGORY_CONFIG,
  REPORT_DEFINITION_STATUS_CONFIG,
  REPORT_FORMAT_CONFIG,
  REPORT_SCOPE_CONFIG,
} from "@/config/reports";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  ReportCategory,
  ReportDefinition,
  ReportDefinitionStatus,
  ReportFormat,
  ReportScope,
} from "@/types/report";

type ReportDefinitionFormProps = {
  report?: ReportDefinition;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (report: ReportDefinition) => void;
};

const REPORT_FORMATS = Object.keys(REPORT_FORMAT_CONFIG) as ReportFormat[];

export function ReportDefinitionForm({
  report,
  selectedBranchId,
  onCancel,
  onSave,
}: ReportDefinitionFormProps) {
  const [name, setName] = useState(report?.name ?? "");
  const [code, setCode] = useState(report?.code ?? "");
  const [description, setDescription] = useState(report?.description ?? "");
  const [category, setCategory] = useState<ReportCategory>(
    report?.category ?? "people",
  );
  const [status, setStatus] = useState<ReportDefinitionStatus>(
    report?.status ?? "draft",
  );
  const [scope, setScope] = useState<ReportScope>(
    report?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    report?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [defaultFormat, setDefaultFormat] = useState<ReportFormat>(
    report?.defaultFormat ?? "xlsx",
  );
  const [availableFormats, setAvailableFormats] = useState<ReportFormat[]>(
    report?.availableFormats ?? ["csv", "xlsx", "pdf"],
  );
  const [includedFields, setIncludedFields] = useState(
    report?.includedFields.join(", ") ?? "",
  );
  const [defaultFilters, setDefaultFilters] = useState(
    report?.defaultFilters.join(", ") ?? "",
  );
  const [recordEstimate, setRecordEstimate] = useState(
    String(report?.recordEstimate ?? 100),
  );
  const [submitted, setSubmitted] = useState(false);

  const parsedFields = includedFields
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

  const isValid = Boolean(
    name.trim() &&
      code.trim() &&
      description.trim() &&
      (scope === "organization" || branchId) &&
      availableFormats.length > 0 &&
      parsedFields.length > 0 &&
      Number(recordEstimate) >= 0,
  );

  function toggleFormat(format: ReportFormat, checked: boolean) {
    setAvailableFormats((currentFormats) =>
      checked
        ? Array.from(new Set([...currentFormats, format]))
        : currentFormats.filter((currentFormat) => currentFormat !== format),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);
    const safeFormats = availableFormats.includes(defaultFormat)
      ? availableFormats
      : [defaultFormat, ...availableFormats];

    onSave({
      id: report?.id ?? crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      category,
      status,
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      defaultFormat,
      availableFormats: safeFormats,
      includedFields: parsedFields,
      defaultFilters: defaultFilters
        .split(",")
        .map((filter) => filter.trim())
        .filter(Boolean),
      recordEstimate: Number(recordEstimate),
      lastGeneratedAt: report?.lastGeneratedAt,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Report name"
          htmlFor="reportName"
          error={submitted && !name.trim() ? "Enter a report name" : undefined}
        >
          <Input
            id="reportName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Monthly Attendance Summary"
          />
        </FormField>

        <FormField
          label="Report code"
          htmlFor="reportCode"
          error={submitted && !code.trim() ? "Enter a report code" : undefined}
        >
          <Input
            id="reportCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Example: ATT-MONTHLY"
          />
        </FormField>

        <FormField label="Category" htmlFor="reportCategory">
          <Select
            id="reportCategory"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ReportCategory)
            }
          >
            {Object.entries(REPORT_CATEGORY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Status" htmlFor="reportStatus">
          <Select
            id="reportStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ReportDefinitionStatus)
            }
          >
            {Object.entries(REPORT_DEFINITION_STATUS_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="reportScope">
          <Select
            id="reportScope"
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
            htmlFor="reportBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="reportBranch"
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

        <FormField label="Default format" htmlFor="reportDefaultFormat">
          <Select
            id="reportDefaultFormat"
            value={defaultFormat}
            onChange={(event) =>
              setDefaultFormat(event.target.value as ReportFormat)
            }
          >
            {REPORT_FORMATS.map((format) => (
              <option key={format} value={format}>
                {REPORT_FORMAT_CONFIG[format].label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Estimated records" htmlFor="reportRecordEstimate">
          <Input
            id="reportRecordEstimate"
            type="number"
            min="0"
            value={recordEstimate}
            onChange={(event) => setRecordEstimate(event.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label="Report description"
        htmlFor="reportDescription"
        error={
          submitted && !description.trim()
            ? "Enter a report description"
            : undefined
        }
      >
        <Textarea
          id="reportDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the report purpose and expected output..."
        />
      </FormField>

      <section>
        <h3 className="font-bold">Available formats</h3>
        <div className="mt-4 space-y-3">
          {REPORT_FORMATS.map((format) => (
            <div
              key={format}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">
                  {REPORT_FORMAT_CONFIG[format].label}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Allow this output format when generating the report.
                </p>
              </div>

              <Switch
                checked={availableFormats.includes(format)}
                onCheckedChange={(checked) => toggleFormat(format, checked)}
                ariaLabel={`Enable ${REPORT_FORMAT_CONFIG[format].label}`}
              />
            </div>
          ))}
        </div>
      </section>

      <FormField
        label="Included fields"
        htmlFor="reportIncludedFields"
        description="Separate field names with commas."
        error={
          submitted && parsedFields.length === 0
            ? "Add at least one report field"
            : undefined
        }
      >
        <Textarea
          id="reportIncludedFields"
          value={includedFields}
          onChange={(event) => setIncludedFields(event.target.value)}
          placeholder="Employee, Branch, Department, Status"
        />
      </FormField>

      <FormField
        label="Default filters"
        htmlFor="reportDefaultFilters"
        description="Separate filter names with commas."
        optional
      >
        <Textarea
          id="reportDefaultFilters"
          value={defaultFilters}
          onChange={(event) => setDefaultFilters(event.target.value)}
          placeholder="Branch, Department, Date Range"
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{report ? "Save report" : "Create report"}</Button>
      </div>
    </form>
  );
}
