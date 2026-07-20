"use client";

import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from "@/config/access-control";
import { cn } from "@/lib/utils";
import type {
  PermissionAction,
} from "@/types/access-control";

type PermissionMatrixProps = {
  permissions: Record<
    string,
    PermissionAction[]
  >;
  onChange: (
    permissions: Record<
      string,
      PermissionAction[]
    >,
  ) => void;
  disabled?: boolean;
};

export function PermissionMatrix({
  permissions,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  function togglePermission(
    moduleId: string,
    action: PermissionAction,
  ) {
    const modulePermissions =
      permissions[moduleId] ?? [];

    const nextModulePermissions =
      modulePermissions.includes(action)
        ? modulePermissions.filter(
            (item) => item !== action,
          )
        : [
            ...modulePermissions,
            action,
          ];

    onChange({
      ...permissions,
      [moduleId]: nextModulePermissions,
    });
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <div className="min-w-190">
        <div className="grid grid-cols-[minmax(17rem,1fr)_repeat(6,5.5rem)] border-b border-border bg-canvas">
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
            Module
          </div>

          {PERMISSION_ACTIONS.map(
            (action) => (
              <div
                key={action.id}
                className="px-2 py-3 text-center text-xs font-bold uppercase tracking-[0.05em] text-text-muted"
              >
                {action.label}
              </div>
            ),
          )}
        </div>

        {PERMISSION_MODULES.map(
          (module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.id}
                className="grid grid-cols-[minmax(17rem,1fr)_repeat(6,5.5rem)] border-b border-border last:border-b-0"
              >
                <div className="flex items-start gap-3 px-4 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
                    <Icon size={17} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      {module.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      {module.description}
                    </p>
                  </div>
                </div>

                {PERMISSION_ACTIONS.map(
                  (action) => {
                    const checked = (
                      permissions[
                        module.id
                      ] ?? []
                    ).includes(action.id);

                    return (
                      <label
                        key={action.id}
                        className={cn(
                          "flex items-center justify-center border-l border-border",
                          disabled
                            ? "cursor-not-allowed"
                            : "cursor-pointer hover:bg-canvas",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() =>
                            togglePermission(
                              module.id,
                              action.id,
                            )
                          }
                          className="size-4 accent-[var(--ams-primary)]"
                        />
                      </label>
                    );
                  },
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
