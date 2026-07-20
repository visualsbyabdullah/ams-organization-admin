"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { PermissionMatrix } from "@/components/people/permission-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createEmptyPermissions } from "@/config/access-control";
import type { AccessRole } from "@/types/access-control";

type RoleEditorProps = {
  role?: AccessRole;
  onCancel: () => void;
  onSave: (role: AccessRole) => void;
};

export function RoleEditor({ role, onCancel, onSave }: RoleEditorProps) {
  const [name, setName] = useState(role?.name ?? "");

  const [description, setDescription] = useState(role?.description ?? "");

  const [status, setStatus] = useState<AccessRole["status"]>(role?.status ?? "active");

  const [branchScope, setBranchScope] = useState<AccessRole["branchScope"]>(
    role?.branchScope ?? "assigned",
  );

  const [permissions, setPermissions] = useState(
    role?.permissions ?? createEmptyPermissions(),
  );

  const [submitted, setSubmitted] = useState(false);

  const isValid = Boolean(name.trim() && description.trim());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    onSave({
      id: role?.id ?? `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      description: description.trim(),
      type: role?.type ?? "custom",
      status,
      branchScope,
      permissions,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Role name"
          htmlFor="roleName"
          error={submitted && !name.trim() ? "Enter a role name" : undefined}
        >
          <Input
            id="roleName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Recruitment Manager"
          />
        </FormField>

        <FormField label="Status" htmlFor="roleStatus">
          <Select
            id="roleStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as AccessRole["status"])}
          >
            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </Select>
        </FormField>

        <FormField
          label="Branch scope"
          htmlFor="branchScope"
          description="Assigned branches restrict the role to the user's branch permissions."
        >
          <Select
            id="branchScope"
            value={branchScope}
            onChange={(event) =>
              setBranchScope(event.target.value as AccessRole["branchScope"])
            }
          >
            <option value="all">All organization branches</option>

            <option value="assigned">Assigned branches only</option>
          </Select>
        </FormField>

        <FormField
          label="Description"
          htmlFor="roleDescription"
          className="md:col-span-2"
          error={submitted && !description.trim() ? "Describe this role" : undefined}
        >
          <Textarea
            id="roleDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain who should use this role..."
          />
        </FormField>
      </div>

      <section>
        <div className="mb-4">
          <h3 className="font-bold">Module permissions</h3>

          <p className="mt-1 text-sm text-text-muted">
            Choose exactly what users with this role can access and manage.
          </p>
        </div>

        <PermissionMatrix permissions={permissions} onChange={setPermissions} />
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{role ? "Save role" : "Create role"}</Button>
      </div>
    </form>
  );
}
