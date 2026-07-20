"use client";

import { getPeopleMetricToneStyle } from "@/config/people-metrics";

import { useMemo, useState } from "react";
import {
  KeyRound,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";

import { PeopleTabs } from "@/components/people/people-tabs";
import { RoleEditor } from "@/components/people/role-editor";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ACCESS_CONTROL_COPY,
  PORTAL_ACCESS_STATUS_CONFIG,
  ROLE_STATUS_CONFIG,
} from "@/config/access-control";
import { useBranchScope } from "@/context/branch-scope-context";
import { ACCESS_ROLES, ACCESS_USERS } from "@/data/access-control";
import { EMPLOYEES } from "@/data/employees";
import type {
  AccessRole,
  PortalAccessStatus,
  UserAccessRecord,
} from "@/types/access-control";

type AccessView = "roles" | "users";

type RoleEditorMode = "create" | "edit" | null;

export function RolesAccess() {
  const { selectedBranch } = useBranchScope();

  const [view, setView] = useState<AccessView>("roles");

  const [roles, setRoles] = useState<AccessRole[]>(ACCESS_ROLES);

  const [users, setUsers] = useState<UserAccessRecord[]>(ACCESS_USERS);

  const [userSearch, setUserSearch] = useState("");

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [roleEditorMode, setRoleEditorMode] = useState<RoleEditorMode>(null);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  const visibleUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      const employee = EMPLOYEES.find((item) => item.id === user.employeeId);

      const role = roles.find((item) => item.id === user.roleId);

      const matchesBranch =
        selectedBranch.isAggregate || user.branchId === selectedBranch.id;

      const searchableValue = [
        employee?.name,
        employee?.email,
        employee?.employeeCode,
        role?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesBranch && searchableValue.includes(query);
    });
  }, [roles, selectedBranch, userSearch, users]);

  const metrics = [
    {
      label: "Active roles",
      value: roles.filter((role) => role.status === "active").length,
      icon: ShieldCheck,
    },
    {
      label: "Portal users",
      value: visibleUsers.length,
      icon: Users,
    },
    {
      label: "Active access",
      value: visibleUsers.filter((user) => user.status === "active").length,
      icon: UserCheck,
    },
    {
      label: "Custom roles",
      value: roles.filter((role) => role.type === "custom").length,
      icon: UserCog,
    },
  ];

  function roleUserCount(roleId: string) {
    return visibleUsers.filter((user) => user.roleId === roleId).length;
  }

  function saveRole(role: AccessRole) {
    setRoles((currentRoles) => {
      const exists = currentRoles.some((item) => item.id === role.id);

      return exists
        ? currentRoles.map((item) => (item.id === role.id ? role : item))
        : [role, ...currentRoles];
    });

    setSelectedRoleId(role.id);
    setRoleEditorMode(null);
  }

  function updateUserRole(employeeId: string, roleId: string) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.employeeId === employeeId
          ? {
              ...user,
              roleId,
            }
          : user,
      ),
    );
  }

  function updatePortalAccess(employeeId: string, enabled: boolean) {
    const status: PortalAccessStatus = enabled ? "active" : "disabled";

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.employeeId === employeeId
          ? {
              ...user,
              status,
            }
          : user,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={ACCESS_CONTROL_COPY.eyebrow}
        title={ACCESS_CONTROL_COPY.title}
        description={ACCESS_CONTROL_COPY.description}
        actions={
          <Button
            onClick={() => {
              setSelectedRoleId(null);
              setRoleEditorMode("create");
            }}
          >
            <Plus />
            {ACCESS_CONTROL_COPY.createRole}
          </Button>
        }
      />

      <div className="mt-7">
        <PeopleTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted">{metric.label}</p>

                  <p className="mt-3 text-3xl font-bold tracking-tight">{metric.value}</p>
                </div>

                <span
                  className={`flex size-10 items-center justify-center rounded-control ${getPeopleMetricToneStyle(metric.label)}`}
                >
                  <Icon />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <div className="mt-6 inline-flex rounded-control border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setView("roles")}
          className={
            view === "roles"
              ? "rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              : "rounded-control px-4 py-2 text-sm font-semibold text-text-muted hover:text-text"
          }
        >
          Roles
        </button>

        <button
          type="button"
          onClick={() => setView("users")}
          className={
            view === "users"
              ? "rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              : "rounded-control px-4 py-2 text-sm font-semibold text-text-muted hover:text-text"
          }
        >
          User access
        </button>
      </div>

      {view === "roles" ? (
        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            const statusConfig = ROLE_STATUS_CONFIG[role.status];

            const enabledPermissions = Object.values(role.permissions).reduce(
              (total, actions) => total + actions.length,
              0,
            );

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRoleId(role.id);

                  setRoleEditorMode("edit");
                }}
                className="text-left"
              >
                <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                      <KeyRound size={20} />
                    </span>

                    <Badge variant={statusConfig.badgeVariant}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <h2 className="mt-5 text-lg font-bold">{role.name}</h2>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-text-muted">
                    {role.description}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-control bg-canvas p-3">
                      <p className="text-xs text-text-muted">Users</p>

                      <p className="mt-1 font-bold">{roleUserCount(role.id)}</p>
                    </div>

                    <div className="rounded-control bg-canvas p-3">
                      <p className="text-xs text-text-muted">Permissions</p>

                      <p className="mt-1 font-bold">{enabledPermissions}</p>
                    </div>

                    <div className="rounded-control bg-canvas p-3">
                      <p className="text-xs text-text-muted">Scope</p>

                      <p className="mt-1 truncate text-xs font-bold">
                        {role.branchScope === "all" ? "All" : "Assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <Badge variant="neutral">
                      {role.type === "system" ? "System role" : "Custom role"}
                    </Badge>

                    <MoreHorizontal size={18} className="text-text-muted" />
                  </div>
                </Card>
              </button>
            );
          })}
        </section>
      ) : (
        <Card className="mt-5">
          <div className="border-b border-border p-4">
            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder={ACCESS_CONTROL_COPY.searchUsers}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Role</TableHead>

                <TableHead>Branch</TableHead>

                <TableHead>Portal status</TableHead>

                <TableHead>Last active</TableHead>

                <TableHead>Access</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleUsers.map((user) => {
                const employee = EMPLOYEES.find((item) => item.id === user.employeeId);

                if (!employee) {
                  return null;
                }

                const statusConfig = PORTAL_ACCESS_STATUS_CONFIG[user.status];

                return (
                  <TableRow key={user.employeeId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.name} initials={employee.initials} />

                        <div>
                          <p className="font-semibold">{employee.name}</p>

                          <p className="mt-1 text-xs text-text-muted">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={user.roleId}
                        onChange={(event) =>
                          updateUserRole(user.employeeId, event.target.value)
                        }
                        className="min-w-48"
                      >
                        {roles
                          .filter((role) => role.status === "active")
                          .map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                      </Select>
                    </TableCell>

                    <TableCell>{employee.branchName}</TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>{user.lastActive}</TableCell>

                    <TableCell>
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={(checked) =>
                          updatePortalAccess(user.employeeId, checked)
                        }
                        ariaLabel={`Change portal access for ${employee.name}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Drawer
        open={roleEditorMode !== null}
        onClose={() => setRoleEditorMode(null)}
        title={roleEditorMode === "create" ? "Create custom role" : "Edit role"}
        description="Configure module permissions and branch access for this role."
        className="max-w-5xl"
      >
        {roleEditorMode && (
          <RoleEditor
            key={roleEditorMode === "create" ? "new-role" : selectedRole?.id}
            role={roleEditorMode === "edit" ? (selectedRole ?? undefined) : undefined}
            onCancel={() => setRoleEditorMode(null)}
            onSave={saveRole}
          />
        )}
      </Drawer>
    </div>
  );
}
