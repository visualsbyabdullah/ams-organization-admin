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
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_TEMPLATE_OUTPUT_CONFIG,
  DOCUMENT_TEMPLATE_SCOPE_CONFIG,
  DOCUMENT_TEMPLATE_STATUS_CONFIG,
} from "@/config/documents";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  DocumentCategory,
  DocumentTemplate,
  DocumentTemplateOutput,
  DocumentTemplateScope,
  DocumentTemplateStatus,
} from "@/types/document";

type DocumentTemplateFormProps = {
  template?: DocumentTemplate;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (
    template: DocumentTemplate,
  ) => void;
};

export function DocumentTemplateForm({
  template,
  selectedBranchId,
  onCancel,
  onSave,
}: DocumentTemplateFormProps) {
  const [title, setTitle] =
    useState(
      template?.title ?? "",
    );
  const [code, setCode] =
    useState(
      template?.code ?? "",
    );
  const [category, setCategory] =
    useState<DocumentCategory>(
      template?.category ??
        "employment",
    );
  const [scope, setScope] =
    useState<DocumentTemplateScope>(
      template?.scope ??
        "organization",
    );
  const [branchId, setBranchId] =
    useState(
      template?.branchId ??
        (selectedBranchId === "all"
          ? ""
          : selectedBranchId),
    );
  const [status, setStatus] =
    useState<DocumentTemplateStatus>(
      template?.status ?? "draft",
    );
  const [
    outputFormat,
    setOutputFormat,
  ] =
    useState<DocumentTemplateOutput>(
      template?.outputFormat ??
        "pdf",
    );
  const [variables, setVariables] =
    useState(
      template?.variables.join(
        ", ",
      ) ?? "",
    );
  const [
    selfService,
    setSelfService,
  ] = useState(
    template?.selfService ??
      false,
  );
  const [
    approvalRequired,
    setApprovalRequired,
  ] = useState(
    template?.approvalRequired ??
      true,
  );
  const [
    description,
    setDescription,
  ] = useState(
    template?.description ?? "",
  );
  const [note, setNote] =
    useState(
      template?.note ?? "",
    );
  const [submitted, setSubmitted] =
    useState(false);

  const branches =
    BRANCH_OPTIONS.filter(
      (branch) =>
        !branch.isAggregate,
    );

  const isValid = Boolean(
    title.trim() &&
      code.trim() &&
      description.trim() &&
      (scope ===
        "organization" ||
        branchId),
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branch =
      branches.find(
        (item) =>
          item.id === branchId,
      );

    onSave({
      id:
        template?.id ??
        crypto.randomUUID(),
      title: title.trim(),
      code: code
        .trim()
        .toUpperCase(),
      category,
      scope,
      branchId:
        scope === "branch"
          ? branchId
          : undefined,
      branchName:
        scope === "branch"
          ? branch?.name
          : undefined,
      status,
      outputFormat,
      version:
        template?.version ?? 1,
      variables: variables
        .split(",")
        .map((variable) =>
          variable.trim(),
        )
        .filter(Boolean),
      selfService,
      approvalRequired,
      description:
        description.trim(),
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
          label="Template title"
          htmlFor="templateTitle"
          error={
            submitted &&
            !title.trim()
              ? "Enter a template title"
              : undefined
          }
        >
          <Input
            id="templateTitle"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Template code"
          htmlFor="templateCode"
          error={
            submitted &&
            !code.trim()
              ? "Enter a template code"
              : undefined
          }
        >
          <Input
            id="templateCode"
            value={code}
            onChange={(event) =>
              setCode(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Category"
          htmlFor="templateCategory"
        >
          <Select
            id="templateCategory"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as DocumentCategory,
              )
            }
          >
            {Object.entries(
              DOCUMENT_CATEGORY_CONFIG,
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
          label="Status"
          htmlFor="templateStatus"
        >
          <Select
            id="templateStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as DocumentTemplateStatus,
              )
            }
          >
            {Object.entries(
              DOCUMENT_TEMPLATE_STATUS_CONFIG,
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
          label="Scope"
          htmlFor="templateScope"
        >
          <Select
            id="templateScope"
            value={scope}
            onChange={(event) =>
              setScope(
                event.target
                  .value as DocumentTemplateScope,
              )
            }
          >
            {Object.entries(
              DOCUMENT_TEMPLATE_SCOPE_CONFIG,
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

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="templateBranch"
            error={
              submitted &&
              !branchId
                ? "Select a branch"
                : undefined
            }
          >
            <Select
              id="templateBranch"
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
              {branches.map(
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

        <FormField
          label="Output format"
          htmlFor="templateOutput"
        >
          <Select
            id="templateOutput"
            value={outputFormat}
            onChange={(event) =>
              setOutputFormat(
                event.target
                  .value as DocumentTemplateOutput,
              )
            }
          >
            {Object.entries(
              DOCUMENT_TEMPLATE_OUTPUT_CONFIG,
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
      </section>

      <FormField
        label="Merge variables"
        htmlFor="templateVariables"
        optional
      >
        <Input
          id="templateVariables"
          value={variables}
          onChange={(event) =>
            setVariables(
              event.target.value,
            )
          }
          placeholder="employee_name, designation, joining_date"
        />
      </FormField>

      <div className="space-y-3">
        {[
          {
            label:
              "Employee self-service",
            description:
              "Allow employees to request this generated document.",
            checked: selfService,
            onChange:
              setSelfService,
          },
          {
            label:
              "Approval required",
            description:
              "Require administrator approval before release.",
            checked:
              approvalRequired,
            onChange:
              setApprovalRequired,
          },
        ].map((control) => (
          <div
            key={control.label}
            className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
          >
            <div>
              <p className="text-sm font-semibold">
                {control.label}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {control.description}
              </p>
            </div>
            <Switch
              checked={
                control.checked
              }
              onCheckedChange={
                control.onChange
              }
              ariaLabel={
                control.label
              }
            />
          </div>
        ))}
      </div>

      <FormField
        label="Description"
        htmlFor="templateDescription"
        error={
          submitted &&
          !description.trim()
            ? "Enter a description"
            : undefined
        }
      >
        <Textarea
          id="templateDescription"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
        />
      </FormField>

      <FormField
        label="Internal note"
        htmlFor="templateNote"
        optional
      >
        <Textarea
          id="templateNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
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
          {template
            ? "Save template"
            : "Create template"}
        </Button>
      </div>
    </form>
  );
}
