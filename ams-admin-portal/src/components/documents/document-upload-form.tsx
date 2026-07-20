"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DOCUMENT_CATEGORY_CONFIG,
  DOCUMENT_NUMBER_PREFIX,
  DOCUMENT_OWNER_TYPE_CONFIG,
  DOCUMENT_VISIBILITY_CONFIG,
} from "@/config/documents";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type {
  DocumentCategory,
  DocumentOwnerType,
  DocumentRecord,
  DocumentVisibility,
} from "@/types/document";

type DocumentUploadFormProps = {
  selectedBranchId: string;
  maximumUploadMb: number;
  allowedFileExtensions: string[];
  verificationRequired: boolean;
  onCancel: () => void;
  onCreate: (document: DocumentRecord) => void;
};

export function DocumentUploadForm({
  selectedBranchId,
  maximumUploadMb,
  allowedFileExtensions,
  verificationRequired,
  onCancel,
  onCreate,
}: DocumentUploadFormProps) {
  const [title, setTitle] = useState("");
  const [ownerType, setOwnerType] = useState<DocumentOwnerType>("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [branchId, setBranchId] = useState(
    selectedBranchId === "all" ? "" : selectedBranchId,
  );
  const [category, setCategory] = useState<DocumentCategory>("employment");
  const [visibility, setVisibility] = useState<DocumentVisibility>("employee");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [tags, setTags] = useState("");
  const [note, setNote] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(verificationRequired);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const branches = BRANCH_OPTIONS.filter((branch) => !branch.isAggregate);

  const employees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          selectedBranchId === "all" || employee.branchId === selectedBranchId,
      ),
    [selectedBranchId],
  );

  const fileTooLarge = Boolean(file && file.size > maximumUploadMb * 1024 * 1024);

  const extensionAllowed = Boolean(
    !file ||
    allowedFileExtensions.some((extension) =>
      file.name.toLowerCase().endsWith(extension.toLowerCase()),
    ),
  );

  const ownerValid =
    ownerType === "organization" ||
    (ownerType === "branch" && branchId) ||
    (ownerType === "employee" && employeeId);

  const isValid = Boolean(
    title.trim() && file && ownerValid && !fileTooLarge && extensionAllowed,
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setFile(nextFile);

    if (nextFile && !title.trim()) {
      setTitle(
        nextFile.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\w/g, (letter) => letter.toUpperCase()),
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid || !file) {
      return;
    }

    const employee = EMPLOYEES.find((item) => item.id === employeeId);

    const branch = branches.find((item) => item.id === branchId);

    const today = new Date().toISOString().slice(0, 10);

    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      documentNumber: `${DOCUMENT_NUMBER_PREFIX}-${Date.now().toString().slice(-8)}`,
      category,
      ownerType,
      employeeId: ownerType === "employee" ? employeeId : undefined,
      branchId:
        ownerType === "employee"
          ? employee?.branchId
          : ownerType === "branch"
            ? branchId
            : undefined,
      branchName:
        ownerType === "employee"
          ? employee?.branchName
          : ownerType === "branch"
            ? branch?.name
            : undefined,
      visibility,
      status: requiresVerification ? "pending_verification" : "verified",
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      version: 1,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      uploadedAt: today,
      uploadedBy: CURRENT_ADMIN.name,
      verifiedAt: requiresVerification ? undefined : today,
      verifiedBy: requiresVerification ? undefined : CURRENT_ADMIN.name,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Document title"
          htmlFor="documentTitle"
          error={submitted && !title.trim() ? "Enter a document title" : undefined}
        >
          <Input
            id="documentTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </FormField>

        <FormField label="Category" htmlFor="documentCategory">
          <Select
            id="documentCategory"
            value={category}
            onChange={(event) => setCategory(event.target.value as DocumentCategory)}
          >
            {Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Owner type" htmlFor="documentOwner">
          <Select
            id="documentOwner"
            value={ownerType}
            onChange={(event) => setOwnerType(event.target.value as DocumentOwnerType)}
          >
            {Object.entries(DOCUMENT_OWNER_TYPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {ownerType === "employee" && (
          <FormField
            label="Employee"
            htmlFor="documentEmployee"
            error={submitted && !employeeId ? "Select an employee" : undefined}
          >
            <Select
              id="documentEmployee"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} â€” {employee.employeeCode}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        {ownerType === "branch" && (
          <FormField
            label="Branch"
            htmlFor="documentBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="documentBranch"
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

        <FormField label="Visibility" htmlFor="documentVisibility">
          <Select
            id="documentVisibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as DocumentVisibility)}
          >
            {Object.entries(DOCUMENT_VISIBILITY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Issue date" htmlFor="documentIssueDate" optional>
          <Input
            id="documentIssueDate"
            type="date"
            value={issueDate}
            onChange={(event) => setIssueDate(event.target.value)}
          />
        </FormField>

        <FormField label="Expiry date" htmlFor="documentExpiryDate" optional>
          <Input
            id="documentExpiryDate"
            type="date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
          />
        </FormField>
      </section>

      <FormField
        label="Document file"
        htmlFor="documentFile"
        description={`Allowed: ${allowedFileExtensions.join(
          ", ",
        )}. Maximum ${maximumUploadMb} MB.`}
        error={
          submitted && !file
            ? "Select a document file"
            : fileTooLarge
              ? `File must not exceed ${maximumUploadMb} MB`
              : !extensionAllowed
                ? "This file type is not allowed"
                : undefined
        }
      >
        <Input
          id="documentFile"
          type="file"
          accept={allowedFileExtensions.join(",")}
          onChange={handleFileChange}
        />
      </FormField>

      <FormField label="Tags" htmlFor="documentTags" optional>
        <Input
          id="documentTags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="identity, signed, payroll"
        />
      </FormField>

      <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
        <div>
          <p className="text-sm font-semibold">Require verification</p>
          <p className="mt-1 text-xs text-text-muted">
            Keep the upload pending until an authorized administrator verifies it.
          </p>
        </div>
        <Switch
          checked={requiresVerification}
          onCheckedChange={setRequiresVerification}
          ariaLabel="Require document verification"
        />
      </div>

      <FormField label="Internal note" htmlFor="documentNote" optional>
        <Textarea
          id="documentNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Upload document</Button>
      </div>
    </form>
  );
}
