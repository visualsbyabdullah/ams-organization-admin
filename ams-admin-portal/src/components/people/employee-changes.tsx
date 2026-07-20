"use client";

import {
  getEmployeeChangeTypeToneStyle,
  getPeopleMetricToneStyle,
} from "@/config/people-metrics";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  FilePenLine,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";

import { EmployeeChangeForm } from "@/components/people/employee-change-form";
import { PeopleTabs } from "@/components/people/people-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPROVAL_STATUS_CONFIG,
  EMPLOYEE_CHANGES_COPY,
  EMPLOYEE_CHANGE_STATUS_CONFIG,
  EMPLOYEE_CHANGE_TYPE_CONFIG,
} from "@/config/employee-changes";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEE_CHANGES } from "@/data/employee-changes";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";
import type { EmployeeChange, EmployeeChangeStatus } from "@/types/employee-change";

export function EmployeeChanges() {
  const { selectedBranch } = useBranchScope();

  const [changes, setChanges] = useState<EmployeeChange[]>(EMPLOYEE_CHANGES);

  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const visibleChanges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return changes.filter((change) => {
      const employee = EMPLOYEES.find((item) => item.id === change.employeeId);

      const typeConfig = EMPLOYEE_CHANGE_TYPE_CONFIG[change.type];

      const matchesBranch =
        selectedBranch.isAggregate || change.branchId === selectedBranch.id;

      const searchableValue = [
        employee?.name,
        employee?.employeeCode,
        change.requestedBy,
        typeConfig.label,
        change.fromValue,
        change.toValue,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableValue.includes(query);

      const matchesType = typeFilter === "all" || change.type === typeFilter;

      const matchesStatus = statusFilter === "all" || change.status === statusFilter;

      return matchesBranch && matchesSearch && matchesType && matchesStatus;
    });
  }, [changes, searchQuery, selectedBranch, statusFilter, typeFilter]);

  const selectedChange = changes.find((change) => change.id === selectedChangeId) ?? null;

  const selectedEmployee = selectedChange
    ? EMPLOYEES.find((employee) => employee.id === selectedChange.employeeId)
    : null;

  const metrics = [
    {
      label: "Pending approval",
      value: visibleChanges.filter((change) => change.status === "pending").length,
      icon: Clock3,
    },
    {
      label: "Scheduled",
      value: visibleChanges.filter(
        (change) => change.status === "scheduled" || change.status === "approved",
      ).length,
      icon: ArrowRight,
    },
    {
      label: "Completed",
      value: visibleChanges.filter((change) => change.status === "completed").length,
      icon: Check,
    },
    {
      label: "Drafts",
      value: visibleChanges.filter((change) => change.status === "draft").length,
      icon: FilePenLine,
    },
  ];

  function updateChangeStatus(changeId: string, status: EmployeeChangeStatus) {
    const actionDate = new Date().toISOString().slice(0, 10);

    setChanges((currentChanges) =>
      currentChanges.map((change) => {
        if (change.id !== changeId) {
          return change;
        }

        return {
          ...change,
          status,
          approvals: change.approvals.map((approval) => {
            if (approval.status !== "pending") {
              return approval;
            }

            return {
              ...approval,
              status: status === "rejected" ? "rejected" : "completed",
              actor: "Maaz",
              date: actionDate,
            };
          }),
        };
      }),
    );
  }

  function createChange(change: EmployeeChange) {
    setChanges((currentChanges) => [change, ...currentChanges]);

    setCreateOpen(false);
    setSelectedChangeId(change.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={EMPLOYEE_CHANGES_COPY.eyebrow}
        title={EMPLOYEE_CHANGES_COPY.title}
        description={EMPLOYEE_CHANGES_COPY.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {EMPLOYEE_CHANGES_COPY.createAction}
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
                  className={`flex size-10 items-center justify-center rounded-control ${getPeopleMetricToneStyle(
                    metric.label,
                  )}`}
                >
                  <Icon />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={EMPLOYEE_CHANGES_COPY.searchPlaceholder}
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-110">
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">{EMPLOYEE_CHANGES_COPY.allTypes}</option>

              {Object.entries(EMPLOYEE_CHANGE_TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{EMPLOYEE_CHANGES_COPY.allStatuses}</option>

              {Object.entries(EMPLOYEE_CHANGE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visibleChanges.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Change</TableHead>

                <TableHead>Update</TableHead>

                <TableHead>Effective date</TableHead>

                <TableHead>Requested by</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleChanges.map((change) => {
                const employee = EMPLOYEES.find((item) => item.id === change.employeeId);

                if (!employee) {
                  return null;
                }

                const typeConfig = EMPLOYEE_CHANGE_TYPE_CONFIG[change.type];

                const statusConfig = EMPLOYEE_CHANGE_STATUS_CONFIG[change.status];

                const TypeIcon = typeConfig.icon;

                return (
                  <TableRow
                    key={change.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => setSelectedChangeId(change.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.name} initials={employee.initials} />

                        <div>
                          <p className="font-semibold">{employee.name}</p>

                          <p className="mt-1 text-xs text-text-muted">
                            {employee.employeeCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex size-8 items-center justify-center rounded-control ${getEmployeeChangeTypeToneStyle(
                            typeConfig.label,
                          )}`}
                        >
                          <TypeIcon className="size-4" />
                        </span>

                        <span className="font-medium">{typeConfig.label}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-70">
                        <p className="truncate text-xs text-text-muted">
                          {change.fromValue}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <ArrowRight className="size-3.5 text-primary" />

                          <p className="truncate font-semibold">{change.toValue}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{formatDate(change.effectiveDate)}</TableCell>

                    <TableCell>{change.requestedBy}</TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open request for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelectedChangeId(change.id);
                        }}
                      >
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <FilePenLine className="size-8 text-text-muted" />

            <h2 className="mt-4 font-bold">No employee changes found</h2>

            <p className="mt-2 text-sm text-text-muted">
              Change the filters or create a new request.
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedChange)}
        onClose={() => setSelectedChangeId(null)}
        title="Change request"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} Â· ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedChange?.status === "pending" ? (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => updateChangeStatus(selectedChange.id, "rejected")}
              >
                <X />
                Reject
              </Button>

              <Button onClick={() => updateChangeStatus(selectedChange.id, "approved")}>
                <Check />
                Approve change
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedChange && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-bold">Change summary</h3>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-text-muted">Change type</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {EMPLOYEE_CHANGE_TYPE_CONFIG[selectedChange.type].label}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-text-muted">Effective date</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(selectedChange.effectiveDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-text-muted">Current value</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedChange.fromValue}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-text-muted">New value</dt>

                  <dd className="mt-1 text-sm font-semibold text-primary">
                    {selectedChange.toValue}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-text-muted">Requested by</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedChange.requestedBy}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-text-muted">Request date</dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(selectedChange.requestedAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">Reason</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedChange.reason}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Approval flow</h3>

              <div className="mt-3 space-y-3">
                {selectedChange.approvals.length > 0 ? (
                  selectedChange.approvals.map((approval) => {
                    const config = APPROVAL_STATUS_CONFIG[approval.status];

                    return (
                      <div
                        key={approval.label}
                        className="flex items-start justify-between gap-4 rounded-control border border-border p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold">{approval.label}</p>

                          {approval.actor && (
                            <p className="mt-1 text-xs text-text-muted">
                              {approval.actor}

                              {approval.date ? ` Â· ${formatDate(approval.date)}` : ""}
                            </p>
                          )}
                        </div>

                        <Badge variant={config.badgeVariant}>{config.label}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-control bg-canvas p-4 text-sm text-text-muted">
                    This draft has not entered the approval flow.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New change request"
        description="Submit an employee record change for approval."
      >
        <EmployeeChangeForm
          onCancel={() => setCreateOpen(false)}
          onCreate={createChange}
        />
      </Drawer>
    </div>
  );
}
