"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Building2,
  CalendarCheck2,
  Copy,
  FilePenLine,
  Globe2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { LeavePolicyForm } from "@/components/leave/leave-policy-form";
import { LeaveTabs } from "@/components/leave/leave-tabs";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  LEAVE_POLICIES_COPY,
  LEAVE_POLICY_ACCRUAL_CONFIG,
  LEAVE_POLICY_APPROVAL_CONFIG,
  LEAVE_POLICY_BRANCH_OPTIONS,
  LEAVE_POLICY_SCOPE_CONFIG,
  LEAVE_POLICY_STATUS_CONFIG,
} from "@/config/leave-policies";
import { LEAVE_TYPE_CONFIG } from "@/config/leave";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { LEAVE_POLICIES } from "@/data/leave-policies";
import { formatDate } from "@/lib/date";
import type { LeavePolicy } from "@/types/leave-policy";

type EditorMode = "create" | "edit" | null;

function getBranchLabels(branchIds: string[]) {
  return LEAVE_POLICY_BRANCH_OPTIONS.filter((branch) =>
    branchIds.includes(branch.id),
  ).map((branch) => branch.label);
}

export function LeavePoliciesWorkspace() {
  const { selectedBranch } = useBranchScope();

  const [policies, setPolicies] = useState<LeavePolicy[]>(LEAVE_POLICIES);

  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedPolicies = useMemo(
    () =>
      policies.filter((policy) => {
        if (selectedBranch.isAggregate) {
          return true;
        }

        return (
          policy.scope === "all_branches" || policy.branchIds.includes(selectedBranch.id)
        );
      }),
    [policies, selectedBranch],
  );

  const visiblePolicies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedPolicies.filter((policy) => {
      const branchLabels = getBranchLabels(policy.branchIds);

      const searchableValue = [
        policy.name,
        policy.description,
        LEAVE_TYPE_CONFIG[policy.leaveType].label,
        ...branchLabels,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableValue.includes(query);

      const matchesType = typeFilter === "all" || policy.leaveType === typeFilter;

      const matchesStatus = statusFilter === "all" || policy.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [scopedPolicies, searchQuery, statusFilter, typeFilter]);

  const selectedPolicy =
    policies.find((policy) => policy.id === selectedPolicyId) ?? null;

  const metrics = [
    {
      label: "Active policies",
      value: scopedPolicies.filter((policy) => policy.status === "active").length,
      detail: selectedBranch.name,
      icon: ShieldCheck,
      tone: "success" as const,
    },
    {
      label: "Organization-wide",
      value: scopedPolicies.filter((policy) => policy.scope === "all_branches").length,
      detail: "Applied to every branch",
      icon: Globe2,
      tone: "info" as const,
    },
    {
      label: "Branch-specific",
      value: scopedPolicies.filter((policy) => policy.scope === "selected_branches")
        .length,
      detail: "Restricted policy scope",
      icon: Building2,
      tone: "warning" as const,
    },
    {
      label: "Draft policies",
      value: scopedPolicies.filter((policy) => policy.status === "draft").length,
      detail: "Not currently enforced",
      icon: FilePenLine,
      tone: "warning" as const,
    },
  ];

  function savePolicy(nextPolicy: LeavePolicy) {
    setPolicies((currentPolicies) => {
      const exists = currentPolicies.some((policy) => policy.id === nextPolicy.id);

      return exists
        ? currentPolicies.map((policy) =>
            policy.id === nextPolicy.id ? nextPolicy : policy,
          )
        : [nextPolicy, ...currentPolicies];
    });

    setSelectedPolicyId(nextPolicy.id);

    setEditorMode(null);
  }

  function duplicatePolicy(policy: LeavePolicy) {
    const duplicate: LeavePolicy = {
      ...policy,
      id: crypto.randomUUID(),
      name: `${policy.name} Copy`,
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };

    setPolicies((currentPolicies) => [duplicate, ...currentPolicies]);

    setSelectedPolicyId(duplicate.id);
  }

  function archivePolicy(policyId: string) {
    setPolicies((currentPolicies) =>
      currentPolicies.map((policy) =>
        policy.id === policyId
          ? {
              ...policy,
              status: "archived",
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : policy,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={LEAVE_POLICIES_COPY.eyebrow}
        title={LEAVE_POLICIES_COPY.title}
        description={LEAVE_POLICIES_COPY.description}
        actions={
          <Button
            onClick={() => {
              setSelectedPolicyId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {LEAVE_POLICIES_COPY.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <LeaveTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{LEAVE_POLICIES_COPY.policiesTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {LEAVE_POLICIES_COPY.policiesDescription}
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={LEAVE_POLICIES_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">{LEAVE_POLICIES_COPY.allTypes}</option>

              {Object.entries(LEAVE_TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{LEAVE_POLICIES_COPY.allStatuses}</option>

              {Object.entries(LEAVE_POLICY_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visiblePolicies.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {visiblePolicies.map((policy) => {
              const statusConfig = LEAVE_POLICY_STATUS_CONFIG[policy.status];

              const scopeConfig = LEAVE_POLICY_SCOPE_CONFIG[policy.scope];

              const typeConfig = LEAVE_TYPE_CONFIG[policy.leaveType];

              const branchLabels = getBranchLabels(policy.branchIds);

              return (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => setSelectedPolicyId(policy.id)}
                  className="text-left"
                >
                  <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                        <CalendarCheck2 size={20} />
                      </span>

                      <MoreHorizontal className="size-5 text-text-muted" />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge variant={typeConfig.badgeVariant}>{typeConfig.label}</Badge>

                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <h3 className="mt-4 text-lg font-bold">{policy.name}</h3>

                    <p className="mt-2 min-h-18 text-sm leading-6 text-text-muted">
                      {policy.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-control bg-canvas p-3">
                        <p className="text-xs text-text-muted">Allowance</p>

                        <p className="mt-1 font-bold">{policy.annualAllowance} days</p>
                      </div>

                      <div className="rounded-control bg-canvas p-3">
                        <p className="text-xs text-text-muted">Employees</p>

                        <p className="mt-1 font-bold">{policy.applicableEmployees}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <Badge variant={scopeConfig.badgeVariant}>
                        {scopeConfig.label}
                      </Badge>

                      <span className="truncate text-xs text-text-muted">
                        {policy.scope === "all_branches"
                          ? "All organization branches"
                          : branchLabels.join(", ")}
                      </span>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">{LEAVE_POLICIES_COPY.emptyTitle}</h3>

            <p className="mt-2 text-sm text-text-muted">
              {LEAVE_POLICIES_COPY.emptyDescription}
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedPolicy)}
        onClose={() => setSelectedPolicyId(null)}
        title="Leave policy"
        description={selectedPolicy?.name}
        footer={
          selectedPolicy ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => duplicatePolicy(selectedPolicy)}>
                <Copy />
                Duplicate
              </Button>

              {selectedPolicy.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={() => archivePolicy(selectedPolicy.id)}
                >
                  <Archive />
                  Archive
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit policy
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedPolicy && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedPolicy.name}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Updated by {selectedPolicy.updatedBy} on{" "}
                    {formatDate(selectedPolicy.updatedAt)}
                  </p>
                </div>

                <Badge
                  variant={LEAVE_POLICY_STATUS_CONFIG[selectedPolicy.status].badgeVariant}
                >
                  {LEAVE_POLICY_STATUS_CONFIG[selectedPolicy.status].label}
                </Badge>
              </div>

              <p className="p-5 text-sm leading-6 text-text-muted">
                {selectedPolicy.description}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Entitlement</h3>

              <DetailGrid
                items={[
                  {
                    label: "Leave type",
                    value: LEAVE_TYPE_CONFIG[selectedPolicy.leaveType].label,
                  },
                  {
                    label: "Annual allowance",
                    value: `${selectedPolicy.annualAllowance} days`,
                  },
                  {
                    label: "Accrual method",
                    value:
                      LEAVE_POLICY_ACCRUAL_CONFIG[selectedPolicy.accrualMethod].label,
                  },
                  {
                    label: "Maximum consecutive",
                    value: `${selectedPolicy.maximumConsecutiveDays} days`,
                  },
                  {
                    label: "Minimum notice",
                    value: `${selectedPolicy.minimumNoticeDays} days`,
                  },
                  {
                    label: "Approval workflow",
                    value:
                      LEAVE_POLICY_APPROVAL_CONFIG[selectedPolicy.approvalMode].label,
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Policy scope</h3>

              <div className="mt-3 flex items-center gap-3 rounded-control bg-canvas p-4">
                <Users className="size-5 text-primary" />

                <div>
                  <p className="text-sm font-semibold">
                    {selectedPolicy.applicableEmployees} employees
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {selectedPolicy.scope === "all_branches"
                      ? "All organization branches"
                      : getBranchLabels(selectedPolicy.branchIds).join(", ")}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Balance controls</h3>

              <ToggleDetailList
                items={[
                  {
                    label: "Carry forward enabled",
                    enabled: selectedPolicy.carryForwardEnabled,
                    detail: selectedPolicy.carryForwardEnabled
                      ? `${selectedPolicy.carryForwardLimit} days maximum`
                      : "Unused leave expires",
                  },
                  {
                    label: "Negative balance allowed",
                    enabled: selectedPolicy.allowNegativeBalance,
                    detail: selectedPolicy.allowNegativeBalance
                      ? "Employees may exceed balance"
                      : "Balance cannot go below zero",
                  },
                  {
                    label: "Supporting attachment",
                    enabled: selectedPolicy.attachmentRequiredAfterDays > 0,
                    detail:
                      selectedPolicy.attachmentRequiredAfterDays > 0
                        ? `Required after ${selectedPolicy.attachmentRequiredAfterDays} days`
                        : "Not required",
                  },
                ]}
              />
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Create leave policy" : "Edit leave policy"}
        description="Configure leave entitlement, eligibility, balance controls and approval requirements."
        className="max-w-5xl"
      >
        {editorMode && (
          <LeavePolicyForm
            key={editorMode === "create" ? "new-leave-policy" : selectedPolicy?.id}
            policy={editorMode === "edit" ? (selectedPolicy ?? undefined) : undefined}
            onCancel={() => setEditorMode(null)}
            onSave={savePolicy}
          />
        )}
      </Drawer>
    </div>
  );
}
