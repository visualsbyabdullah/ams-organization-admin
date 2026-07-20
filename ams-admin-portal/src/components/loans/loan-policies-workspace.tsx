"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Banknote,
  Building2,
  CheckCircle2,
  Copy,
  FilePenLine,
  Globe2,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { LoanPolicyForm } from "@/components/loans/loan-policy-form";
import { LoanTabs } from "@/components/loans/loan-tabs";
import { DetailGrid, ToggleDetailList } from "@/components/shared/detail-grid";
import { PageHeader } from "@/components/shared/page-header";
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
  LOAN_APPROVAL_MODE_CONFIG,
  LOAN_INTEREST_MODE_CONFIG,
  LOAN_POLICIES_COPY,
  LOAN_POLICY_SCOPE_CONFIG,
  LOAN_POLICY_STATUS_CONFIG,
} from "@/config/loan-policies";
import { LOAN_TYPE_CONFIG } from "@/config/loans";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { LOAN_POLICIES } from "@/data/loan-policies";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { LoanPolicy } from "@/types/loan-policy";

type EditorMode = "create" | "edit" | null;

export function LoanPoliciesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [policies, setPolicies] = useState<LoanPolicy[]>(LOAN_POLICIES);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [scopeFilter, setScopeFilter] = useState("all");

  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedPolicies = useMemo(
    () =>
      policies.filter(
        (policy) =>
          selectedBranch.isAggregate ||
          policy.scope === "organization" ||
          policy.branchId === selectedBranch.id,
      ),
    [policies, selectedBranch],
  );

  const visiblePolicies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedPolicies.filter((policy) => {
      const searchableValue = [
        policy.name,
        policy.branchName,
        policy.enabledLoanTypes.map((type) => LOAN_TYPE_CONFIG[type].label).join(" "),
        LOAN_APPROVAL_MODE_CONFIG[policy.approvalMode].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesStatus = statusFilter === "all" || policy.status === statusFilter;

      const matchesScope = scopeFilter === "all" || policy.scope === scopeFilter;

      return searchableValue.includes(query) && matchesStatus && matchesScope;
    });
  }, [scopedPolicies, scopeFilter, searchQuery, statusFilter]);

  const selectedPolicy =
    policies.find((policy) => policy.id === selectedPolicyId) ?? null;

  const organizationDefault =
    policies.find(
      (policy) => policy.scope === "organization" && policy.status === "active",
    ) ?? null;

  const branchOverride = selectedBranch.isAggregate
    ? null
    : (policies.find(
        (policy) =>
          policy.scope === "branch" &&
          policy.branchId === selectedBranch.id &&
          policy.status === "active",
      ) ?? null);

  const effectivePolicy = branchOverride ?? organizationDefault;

  const activePolicies = scopedPolicies.filter((policy) => policy.status === "active");

  const branchOverrides = scopedPolicies.filter((policy) => policy.scope === "branch");

  const approvalStages = effectivePolicy
    ? LOAN_APPROVAL_MODE_CONFIG[effectivePolicy.approvalMode].stages
    : 0;

  const metrics = [
    {
      label: "Active policies",
      value: activePolicies.length,
      detail: selectedBranch.name,
      icon: Settings2,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: branchOverrides.length,
      detail: "Custom branch loan rules",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Enabled loan types",
      value: effectivePolicy?.enabledLoanTypes.length ?? 0,
      detail: "Effective policy coverage",
      icon: Banknote,
      tone: "info" as const,
    },
    {
      label: "Approval stages",
      value: approvalStages,
      detail: "Effective workflow",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
  ];

  function savePolicy(nextPolicy: LoanPolicy) {
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

  function duplicatePolicy(policy: LoanPolicy) {
    const duplicate: LoanPolicy = {
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

  function updateStatus(policyId: string, status: LoanPolicy["status"]) {
    setPolicies((currentPolicies) =>
      currentPolicies.map((policy) =>
        policy.id === policyId
          ? {
              ...policy,
              status,
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
        eyebrow={LOAN_POLICIES_COPY.eyebrow}
        title={LOAN_POLICIES_COPY.title}
        description={LOAN_POLICIES_COPY.description}
        actions={
          <Button
            onClick={() => {
              setSelectedPolicyId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {LOAN_POLICIES_COPY.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <LoanTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{LOAN_POLICIES_COPY.registerTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {LOAN_POLICIES_COPY.registerDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={LOAN_POLICIES_COPY.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{LOAN_POLICIES_COPY.allScopes}</option>

                {Object.entries(LOAN_POLICY_SCOPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{LOAN_POLICIES_COPY.allStatuses}</option>

                {Object.entries(LOAN_POLICY_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {visiblePolicies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-canvas">
                    <TableHead>Policy</TableHead>

                    <TableHead>Coverage</TableHead>

                    <TableHead>Maximum amount</TableHead>

                    <TableHead>Salary multiple</TableHead>

                    <TableHead>Installments</TableHead>

                    <TableHead>Interest</TableHead>

                    <TableHead>Approval</TableHead>

                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visiblePolicies.map((policy) => (
                    <TableRow
                      key={policy.id}
                      className="cursor-pointer transition hover:bg-canvas"
                      onClick={() => setSelectedPolicyId(policy.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
                            {policy.scope === "organization" ? (
                              <Globe2 size={18} />
                            ) : (
                              <Building2 size={18} />
                            )}
                          </span>

                          <div>
                            <p className="font-semibold">{policy.name}</p>

                            <p className="mt-1 text-xs text-text-muted">
                              {policy.branchName || "All organization branches"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{policy.enabledLoanTypes.length} loan types</TableCell>

                      <TableCell>
                        <strong>{formatPKR(policy.maximumAmount)}</strong>
                      </TableCell>

                      <TableCell>{policy.maximumSalaryMultiple}× salary</TableCell>

                      <TableCell>Up to {policy.maximumInstallments}</TableCell>

                      <TableCell>
                        {LOAN_INTEREST_MODE_CONFIG[policy.interestMode].label}
                      </TableCell>

                      <TableCell>
                        {LOAN_APPROVAL_MODE_CONFIG[policy.approvalMode].stages} stages
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={LOAN_POLICY_STATUS_CONFIG[policy.status].badgeVariant}
                        >
                          {LOAN_POLICY_STATUS_CONFIG[policy.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <Settings2 className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">{LOAN_POLICIES_COPY.emptyTitle}</h3>

              <p className="mt-2 text-sm text-text-muted">
                {LOAN_POLICIES_COPY.emptyDescription}
              </p>
            </div>
          )}
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
              <CheckCircle2 size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">{LOAN_POLICIES_COPY.effectiveTitle}</h2>

              <p className="mt-1 text-sm text-text-muted">
                {LOAN_POLICIES_COPY.effectiveDescription}
              </p>
            </div>
          </div>

          {effectivePolicy ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-control border border-border p-4">
                <p className="text-sm font-bold">{effectivePolicy.name}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {branchOverride ? "Active branch override" : "Organization default"}
                </p>
              </div>

              <div className="rounded-control bg-canvas p-4">
                <p className="text-xs text-text-muted">Maximum amount</p>

                <p className="mt-1 text-lg font-bold">
                  {formatPKR(effectivePolicy.maximumAmount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Service</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectivePolicy.minimumServiceMonths} months
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Installments</p>

                  <p className="mt-1 text-sm font-bold">
                    Up to {effectivePolicy.maximumInstallments}
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Loan types</p>

                  <p className="mt-1 text-sm font-bold">
                    {effectivePolicy.enabledLoanTypes.length}
                  </p>
                </div>

                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Approvals</p>

                  <p className="mt-1 text-sm font-bold">
                    {LOAN_APPROVAL_MODE_CONFIG[effectivePolicy.approvalMode].stages}{" "}
                    stages
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {effectivePolicy.enabledLoanTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-control border border-border px-4 py-3"
                  >
                    <span className="text-sm font-medium">
                      {LOAN_TYPE_CONFIG[type].label}
                    </span>

                    <Badge variant="success">Enabled</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
              No active organization loan policy is available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedPolicy)}
        onClose={() => setSelectedPolicyId(null)}
        title="Employee loan policy"
        description={selectedPolicy?.name}
        footer={
          selectedPolicy ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => duplicatePolicy(selectedPolicy)}>
                <Copy />
                Duplicate
              </Button>

              {selectedPolicy.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedPolicy.id, "archived")}
                >
                  <Archive />
                  Archive
                </Button>
              )}

              {selectedPolicy.status !== "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedPolicy.id, "active")}
                >
                  <CheckCircle2 />
                  Activate
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
                  variant={LOAN_POLICY_STATUS_CONFIG[selectedPolicy.status].badgeVariant}
                >
                  {LOAN_POLICY_STATUS_CONFIG[selectedPolicy.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Policy scope",
                    value: LOAN_POLICY_SCOPE_CONFIG[selectedPolicy.scope].label,
                  },
                  {
                    label: "Branch",
                    value: selectedPolicy.branchName || "All organization branches",
                  },
                  {
                    label: "Minimum service",
                    value: `${selectedPolicy.minimumServiceMonths} months`,
                  },
                  {
                    label: "Maximum amount",
                    value: formatPKR(selectedPolicy.maximumAmount),
                  },
                  {
                    label: "Salary multiple",
                    value: `${selectedPolicy.maximumSalaryMultiple}× monthly salary`,
                  },
                  {
                    label: "Maximum installments",
                    value: selectedPolicy.maximumInstallments,
                  },
                  {
                    label: "Interest mode",
                    value: LOAN_INTEREST_MODE_CONFIG[selectedPolicy.interestMode].label,
                  },
                  {
                    label: "Guarantor threshold",
                    value: formatPKR(selectedPolicy.requireGuarantorAbove),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Enabled loan types</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPolicy.enabledLoanTypes.map((type) => (
                  <Badge key={type} variant={LOAN_TYPE_CONFIG[type].badgeVariant}>
                    {LOAN_TYPE_CONFIG[type].label}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Approval workflow</h3>

              <div className="mt-3 rounded-control bg-canvas p-4">
                <p className="text-sm font-semibold">
                  {LOAN_APPROVAL_MODE_CONFIG[selectedPolicy.approvalMode].label}
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {LOAN_APPROVAL_MODE_CONFIG[selectedPolicy.approvalMode].description}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Policy controls</h3>

              <ToggleDetailList
                items={[
                  {
                    label: "Automatic payroll deduction",
                    enabled: selectedPolicy.automaticPayrollDeduction,
                  },
                  {
                    label: "Emergency fast-track",
                    enabled: selectedPolicy.emergencyFastTrack,
                  },
                  {
                    label: "Concurrent loans",
                    enabled: selectedPolicy.allowConcurrentLoans,
                  },
                  {
                    label: "Finance review",
                    enabled: selectedPolicy.financeReviewRequired,
                  },
                  {
                    label: "Administrator approval",
                    enabled: selectedPolicy.adminApprovalRequired,
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedPolicy.note || "No loan policy note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add loan policy" : "Edit loan policy"}
        description="Configure loan eligibility, limits, repayment rules and approval workflows."
      >
        {editorMode && (
          <LoanPolicyForm
            key={editorMode === "create" ? "new-loan-policy" : selectedPolicy?.id}
            policy={editorMode === "edit" ? (selectedPolicy ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={savePolicy}
          />
        )}
      </Drawer>
    </div>
  );
}
