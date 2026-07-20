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
  DOCUMENT_SETTINGS_SCOPE_CONFIG,
  DOCUMENT_SETTINGS_STATUS_CONFIG,
  DOCUMENT_VISIBILITY_CONFIG,
} from "@/config/documents";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  DocumentSettings,
  DocumentSettingsScope,
  DocumentSettingsStatus,
  DocumentVisibility,
} from "@/types/document";

type DocumentSettingsFormProps = {
  settings?: DocumentSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (
    settings: DocumentSettings,
  ) => void;
};

export function DocumentSettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: DocumentSettingsFormProps) {
  const [name, setName] =
    useState(
      settings?.name ?? "",
    );
  const [scope, setScope] =
    useState<DocumentSettingsScope>(
      settings?.scope ??
        "organization",
    );
  const [branchId, setBranchId] =
    useState(
      settings?.branchId ??
        (selectedBranchId === "all"
          ? ""
          : selectedBranchId),
    );
  const [status, setStatus] =
    useState<DocumentSettingsStatus>(
      settings?.status ?? "draft",
    );
  const [retentionYears, setRetentionYears] =
    useState(
      String(
        settings?.retentionYears ??
          7,
      ),
    );
  const [expiryReminderDays, setExpiryReminderDays] =
    useState(
      String(
        settings?.expiryReminderDays ??
          45,
      ),
    );
  const [secondReminderDays, setSecondReminderDays] =
    useState(
      String(
        settings?.secondExpiryReminderDays ??
          14,
      ),
    );
  const [maximumUploadMb, setMaximumUploadMb] =
    useState(
      String(
        settings?.maximumUploadMb ??
          25,
      ),
    );
  const [extensions, setExtensions] =
    useState(
      settings?.allowedFileExtensions.join(
        ", ",
      ) ??
        ".pdf, .doc, .docx, .jpg, .jpeg, .png",
    );
  const [defaultVisibility, setDefaultVisibility] =
    useState<DocumentVisibility>(
      settings?.defaultVisibility ??
        "employee",
    );
  const [employeeUploads, setEmployeeUploads] =
    useState(
      settings?.employeeUploadsAllowed ??
        true,
    );
  const [managerUploads, setManagerUploads] =
    useState(
      settings?.managerUploadsAllowed ??
        true,
    );
  const [verification, setVerification] =
    useState(
      settings?.verificationRequired ??
        true,
    );
  const [versionHistory, setVersionHistory] =
    useState(
      settings?.versionHistoryEnabled ??
        true,
    );
  const [electronicSignature, setElectronicSignature] =
    useState(
      settings?.electronicSignatureRequired ??
        false,
    );
  const [selfServiceDownloads, setSelfServiceDownloads] =
    useState(
      settings?.selfServiceDownloadsAllowed ??
        true,
    );
  const [note, setNote] =
    useState(
      settings?.note ?? "",
    );
  const [submitted, setSubmitted] =
    useState(false);

  const branches =
    BRANCH_OPTIONS.filter(
      (branch) =>
        !branch.isAggregate,
    );

  const isValid = Boolean(
    name.trim() &&
      Number(retentionYears) > 0 &&
      Number(expiryReminderDays) > 0 &&
      Number(secondReminderDays) > 0 &&
      Number(maximumUploadMb) > 0 &&
      extensions.trim() &&
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
        settings?.id ??
        crypto.randomUUID(),
      name: name.trim(),
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
      retentionYears:
        Number(retentionYears),
      expiryReminderDays:
        Number(expiryReminderDays),
      secondExpiryReminderDays:
        Number(secondReminderDays),
      maximumUploadMb:
        Number(maximumUploadMb),
      allowedFileExtensions:
        extensions
          .split(",")
          .map((extension) => {
            const value =
              extension
                .trim()
                .toLowerCase();

            return value
              ? value.startsWith(".")
                ? value
                : `.${value}`
              : "";
          })
          .filter(Boolean),
      defaultVisibility,
      employeeUploadsAllowed:
        employeeUploads,
      managerUploadsAllowed:
        managerUploads,
      verificationRequired:
        verification,
      versionHistoryEnabled:
        versionHistory,
      electronicSignatureRequired:
        electronicSignature,
      selfServiceDownloadsAllowed:
        selfServiceDownloads,
      updatedAt: new Date()
        .toISOString()
        .slice(0, 10),
      updatedBy:
        CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const controls = [
    {
      label:
        "Allow employee uploads",
      checked: employeeUploads,
      onChange:
        setEmployeeUploads,
    },
    {
      label:
        "Allow manager uploads",
      checked: managerUploads,
      onChange:
        setManagerUploads,
    },
    {
      label:
        "Require verification",
      checked: verification,
      onChange:
        setVerification,
    },
    {
      label:
        "Enable version history",
      checked: versionHistory,
      onChange:
        setVersionHistory,
    },
    {
      label:
        "Require electronic signatures",
      checked:
        electronicSignature,
      onChange:
        setElectronicSignature,
    },
    {
      label:
        "Allow self-service downloads",
      checked:
        selfServiceDownloads,
      onChange:
        setSelfServiceDownloads,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Settings name"
          htmlFor="settingsName"
          error={
            submitted &&
            !name.trim()
              ? "Enter a settings name"
              : undefined
          }
        >
          <Input
            id="settingsName"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Status"
          htmlFor="settingsStatus"
        >
          <Select
            id="settingsStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as DocumentSettingsStatus,
              )
            }
          >
            {Object.entries(
              DOCUMENT_SETTINGS_STATUS_CONFIG,
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
          htmlFor="settingsScope"
        >
          <Select
            id="settingsScope"
            value={scope}
            onChange={(event) =>
              setScope(
                event.target
                  .value as DocumentSettingsScope,
              )
            }
          >
            {Object.entries(
              DOCUMENT_SETTINGS_SCOPE_CONFIG,
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
            htmlFor="settingsBranch"
            error={
              submitted &&
              !branchId
                ? "Select a branch"
                : undefined
            }
          >
            <Select
              id="settingsBranch"
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
          label="Retention years"
          htmlFor="retentionYears"
        >
          <Input
            id="retentionYears"
            type="number"
            min="1"
            value={retentionYears}
            onChange={(event) =>
              setRetentionYears(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="First expiry reminder"
          htmlFor="expiryReminderDays"
        >
          <Input
            id="expiryReminderDays"
            type="number"
            min="1"
            value={
              expiryReminderDays
            }
            onChange={(event) =>
              setExpiryReminderDays(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Second expiry reminder"
          htmlFor="secondReminderDays"
        >
          <Input
            id="secondReminderDays"
            type="number"
            min="1"
            value={
              secondReminderDays
            }
            onChange={(event) =>
              setSecondReminderDays(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Maximum upload MB"
          htmlFor="maximumUploadMb"
        >
          <Input
            id="maximumUploadMb"
            type="number"
            min="1"
            value={maximumUploadMb}
            onChange={(event) =>
              setMaximumUploadMb(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Default visibility"
          htmlFor="defaultVisibility"
        >
          <Select
            id="defaultVisibility"
            value={defaultVisibility}
            onChange={(event) =>
              setDefaultVisibility(
                event.target
                  .value as DocumentVisibility,
              )
            }
          >
            {Object.entries(
              DOCUMENT_VISIBILITY_CONFIG,
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
        label="Allowed file extensions"
        htmlFor="fileExtensions"
      >
        <Input
          id="fileExtensions"
          value={extensions}
          onChange={(event) =>
            setExtensions(
              event.target.value,
            )
          }
        />
      </FormField>

      <div className="space-y-3">
        {controls.map(
          (control) => (
            <div
              key={control.label}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <span className="text-sm font-semibold">
                {control.label}
              </span>
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
          ),
        )}
      </div>

      <FormField
        label="Internal note"
        htmlFor="settingsNote"
        optional
      >
        <Textarea
          id="settingsNote"
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
          {settings
            ? "Save settings"
            : "Create settings"}
        </Button>
      </div>
    </form>
  );
}
