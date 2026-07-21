"use client";

import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Banknote,
  Check,
  CircleMinus,
  CirclePlus,
  Copy,
  Download,
  FilePenLine,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  X,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PayrollAdjustmentForm } from "@/components/payroll/payroll-adjustment-form";
import { PayrollTabs } from "@/components/payroll/payroll-tabs";
import { DetailGrid } from "@/components/shared/detail-grid";
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
  PAYROLL_ADJUSTMENTS_COPY,
  PAYROLL_ADJUSTMENT_DIRECTION_CONFIG,
  PAYROLL_ADJUSTMENT_FREQUENCY_CONFIG,
  PAYROLL_ADJUSTMENT_PERIOD_OPTIONS,
  PAYROLL_ADJUSTMENT_STATUS_CONFIG,
  PAYROLL_ADJUSTMENT_TYPE_CONFIG,
} from "@/config/payroll-adjustments";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { PAYROLL_ADJUSTMENTS } from "@/data/payroll-adjustments";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  PayrollAdjustment,
  PayrollAdjustmentStatus,
} from "@/types/payroll-adjustment";

type EditorMode = "create" | "edit" | null;

function formatPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function PayrollAdjustmentsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [adjustments, setAdjustments] =
    useState<PayrollAdjustment[]>(PAYROLL_ADJUSTMENTS);

  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [directionFilter, setDirectionFilter] = useState("all");

  const [periodFilter, setPeriodFilter] = useState("all");

  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedAdjustments = useMemo(
    () =>
      adjustments.filter(
        (adjustment) =>
          selectedBranch.isAggregate || adjustment.branchId === selectedBranch.id,
      ),
    [adjustments, selectedBranch],
  );

  const visibleAdjustments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedAdjustments.filter((adjustment) => {
      const employee = EMPLOYEES.find((item) => item.id === adjustment.employeeId);

      if (!employee) {
        return false;
      }

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        adjustment.reason,
        PAYROLL_ADJUSTMENT_TYPE_CONFIG[adjustment.type].label,
      ]
        .join(" ")
        .toLowerCase();

      const matchesType = typeFilter === "all" || adjustment.type === typeFilter;

      const matchesStatus = statusFilter === "all" || adjustment.status === statusFilter;

      const matchesDirection =
        directionFilter === "all" || adjustment.direction === directionFilter;

      const matchesPeriod =
        periodFilter === "all" || adjustment.effectivePeriod === periodFilter;

      return (
        searchableValue.includes(query) &&
        matchesType &&
        matchesStatus &&
        matchesDirection &&
        matchesPeriod
      );
    });
  }, [
    directionFilter,
    periodFilter,
    scopedAdjustments,
    searchQuery,
    statusFilter,
    typeFilter,
  ]);

  const selectedAdjustment =
    adjustments.find((adjustment) => adjustment.id === selectedAdjustmentId) ?? null;

  const selectedEmployee = selectedAdjustment
    ? EMPLOYEES.find((employee) => employee.id === selectedAdjustment.employeeId)
    : null;

  const currentPeriodAdjustments = scopedAdjustments.filter(
    (adjustment) => adjustment.effectivePeriod === "2026-07",
  );

  const totalEarnings = currentPeriodAdjustments
    .filter(
      (adjustment) =>
        adjustment.direction === "earning" && adjustment.status !== "rejected",
    )
    .reduce((total, adjustment) => total + adjustment.amount, 0);

  const totalDeductions = currentPeriodAdjustments
    .filter(
      (adjustment) =>
        adjustment.direction === "deduction" && adjustment.status !== "rejected",
    )
    .reduce((total, adjustment) => total + adjustment.amount, 0);

  const pendingApprovals = scopedAdjustments.filter(
    (adjustment) => adjustment.status === "pending_approval",
  );

  const metrics = [
    {
      label: "Payroll earnings",
      value: formatPKR(totalEarnings, true),
      detail: "July 2026 adjustments",
      icon: CirclePlus,
      tone: "success" as const,
    },
    {
      label: "Payroll deductions",
      value: formatPKR(totalDeductions, true),
      detail: "July 2026 adjustments",
      icon: CircleMinus,
      tone: "danger" as const,
    },
    {
      label: "Pending approval",
      value: pendingApprovals.length,
      detail: selectedBranch.name,
      icon: BadgeDollarSign,
      tone: "warning" as const,
    },
    {
      label: "Applied adjustments",
      value: scopedAdjustments.filter((adjustment) => adjustment.status === "applied")
        .length,
      detail: "Included in payroll runs",
      icon: Banknote,
      tone: "info" as const,
    },
  ];

  function saveAdjustment(nextAdjustment: PayrollAdjustment) {
    setAdjustments((currentAdjustments) => {
      const exists = currentAdjustments.some(
        (adjustment) => adjustment.id === nextAdjustment.id,
      );

      return exists
        ? currentAdjustments.map((adjustment) =>
            adjustment.id === nextAdjustment.id ? nextAdjustment : adjustment,
          )
        : [nextAdjustment, ...currentAdjustments];
    });

    setSelectedAdjustmentId(nextAdjustment.id);

    setEditorMode(null);
  }

  function updateStatus(adjustmentId: string, status: PayrollAdjustmentStatus) {
    const reviewDate = new Date().toISOString().slice(0, 10);

    setAdjustments((currentAdjustments) =>
      currentAdjustments.map((adjustment) =>
        adjustment.id === adjustmentId
          ? {
              ...adjustment,
              status,
              reviewedBy:
                status === "draft" || status === "pending_approval"
                  ? undefined
                  : CURRENT_ADMIN.name,
              reviewedAt:
                status === "draft" || status === "pending_approval"
                  ? undefined
                  : reviewDate,
              appliedAt: status === "applied" ? reviewDate : adjustment.appliedAt,
            }
          : adjustment,
      ),
    );
  }

  function duplicateAdjustment(adjustment: PayrollAdjustment) {
    const duplicate: PayrollAdjustment = {
      ...adjustment,
      id: crypto.randomUUID(),
      status: "draft",
      reviewedAt: undefined,
      reviewedBy: undefined,
      appliedAt: undefined,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: CURRENT_ADMIN.name,
      internalNote: `Created from ${PAYROLL_ADJUSTMENT_TYPE_CONFIG[adjustment.type].label} adjustment.`,
    };

    setAdjustments((currentAdjustments) => [duplicate, ...currentAdjustments]);

    setSelectedAdjustmentId(duplicate.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PAYROLL_ADJUSTMENTS_COPY.eyebrow}
        title={PAYROLL_ADJUSTMENTS_COPY.title}
        description={PAYROLL_ADJUSTMENTS_COPY.description}
        actions={
          <>
            <Button variant="outline">
              <Download />
              {PAYROLL_ADJUSTMENTS_COPY.exportAction}
            </Button>

            <Button
              onClick={() => {
                setSelectedAdjustmentId(null);
                setEditorMode("create");
              }}
            >
              <Plus />
              {PAYROLL_ADJUSTMENTS_COPY.createAction}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <PayrollTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{PAYROLL_ADJUSTMENTS_COPY.tableTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">
              {PAYROLL_ADJUSTMENTS_COPY.tableDescription}
            </p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_13rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={PAYROLL_ADJUSTMENTS_COPY.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <Select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">{PAYROLL_ADJUSTMENTS_COPY.allTypes}</option>

                {Object.entries(PAYROLL_ADJUSTMENT_TYPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{PAYROLL_ADJUSTMENTS_COPY.allStatuses}</option>

                {Object.entries(PAYROLL_ADJUSTMENT_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Select
                value={directionFilter}
                onChange={(event) => setDirectionFilter(event.target.value)}
              >
                <option value="all">{PAYROLL_ADJUSTMENTS_COPY.allDirections}</option>

                {Object.entries(PAYROLL_ADJUSTMENT_DIRECTION_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>

              <Select
                value={periodFilter}
                onChange={(event) => setPeriodFilter(event.target.value)}
              >
                {PAYROLL_ADJUSTMENT_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {visibleAdjustments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-canvas">
                    <TableHead>Employee</TableHead>

                    <TableHead>Adjustment</TableHead>

                    <TableHead>Period</TableHead>

                    <TableHead>Amount</TableHead>

                    <TableHead>Frequency</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleAdjustments.map((adjustment) => {
                    const employee = EMPLOYEES.find(
                      (item) => item.id === adjustment.employeeId,
                    );

                    if (!employee) {
                      return null;
                    }

                    const typeConfig = PAYROLL_ADJUSTMENT_TYPE_CONFIG[adjustment.type];

                    const statusConfig =
                      PAYROLL_ADJUSTMENT_STATUS_CONFIG[adjustment.status];

                    return (
                      <TableRow
                        key={adjustment.id}
                        className="cursor-pointer transition hover:bg-canvas"
                        onClick={() => setSelectedAdjustmentId(adjustment.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={employee.name} initials={employee.initials} />

                            <div>
                              <p className="font-semibold">{employee.name}</p>

                              <p className="mt-1 text-xs text-text-muted">
                                {employee.employeeCode} · {employee.department}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={typeConfig.badgeVariant}>
                            {typeConfig.label}
                          </Badge>
                        </TableCell>

                        <TableCell>{formatPeriod(adjustment.effectivePeriod)}</TableCell>

                        <TableCell>
                          <strong
                            className={
                              adjustment.direction === "earning"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {adjustment.direction === "deduction" ? "−" : "+"}
                            {formatPKR(adjustment.amount)}
                          </strong>
                        </TableCell>

                        <TableCell>
                          {
                            PAYROLL_ADJUSTMENT_FREQUENCY_CONFIG[adjustment.frequency]
                              .label
                          }
                        </TableCell>

                        <TableCell>
                          <Badge variant={statusConfig.badgeVariant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Open adjustment for ${employee.name}`}
                            onClick={(event) => {
                              event.stopPropagation();

                              setSelectedAdjustmentId(adjustment.id);
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
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <BadgeDollarSign className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">{PAYROLL_ADJUSTMENTS_COPY.emptyTitle}</h3>

              <p className="mt-2 text-sm text-text-muted">
                {PAYROLL_ADJUSTMENTS_COPY.emptyDescription}
              </p>
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h2 className="text-lg font-bold">{PAYROLL_ADJUSTMENTS_COPY.attentionTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {PAYROLL_ADJUSTMENTS_COPY.attentionDescription}
          </p>

          <div className="mt-5 space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((adjustment) => {
                const employee = EMPLOYEES.find(
                  (item) => item.id === adjustment.employeeId,
                );

                if (!employee) {
                  return null;
                }

                return (
                  <button
                    key={adjustment.id}
                    type="button"
                    onClick={() => setSelectedAdjustmentId(adjustment.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{employee.name}</p>

                        <p className="mt-1 text-xs text-text-muted">
                          {PAYROLL_ADJUSTMENT_TYPE_CONFIG[adjustment.type].label}
                        </p>
                      </div>

                      <Badge variant="warning">Pending</Badge>
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      {formatPKR(adjustment.amount)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No payroll adjustments are waiting for approval.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedAdjustment)}
        onClose={() => setSelectedAdjustmentId(null)}
        title="Payroll adjustment"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedAdjustment ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => duplicateAdjustment(selectedAdjustment)}
              >
                <Copy />
                Duplicate
              </Button>

              {["draft", "rejected"].includes(selectedAdjustment.status) && (
                <Button variant="outline" onClick={() => setEditorMode("edit")}>
                  <FilePenLine />
                  Edit
                </Button>
              )}

              {selectedAdjustment.status === "draft" && (
                <Button
                  onClick={() => updateStatus(selectedAdjustment.id, "pending_approval")}
                >
                  <Send />
                  Submit for approval
                </Button>
              )}

              {selectedAdjustment.status === "pending_approval" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedAdjustment.id, "rejected")}
                  >
                    <X />
                    Reject
                  </Button>

                  <Button onClick={() => updateStatus(selectedAdjustment.id, "approved")}>
                    <Check />
                    Approve
                  </Button>
                </>
              )}

              {selectedAdjustment.status === "approved" && (
                <Button onClick={() => updateStatus(selectedAdjustment.id, "applied")}>
                  <Banknote />
                  Apply to payroll
                </Button>
              )}

              {selectedAdjustment.status === "rejected" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedAdjustment.id, "draft")}
                >
                  <RotateCcw />
                  Return to draft
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedAdjustment && selectedEmployee && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">
                    {PAYROLL_ADJUSTMENT_TYPE_CONFIG[selectedAdjustment.type].label}
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Created by {selectedAdjustment.createdBy} on{" "}
                    {formatDate(selectedAdjustment.createdAt)}
                  </p>
                </div>

                <Badge
                  variant={
                    PAYROLL_ADJUSTMENT_STATUS_CONFIG[selectedAdjustment.status]
                      .badgeVariant
                  }
                >
                  {PAYROLL_ADJUSTMENT_STATUS_CONFIG[selectedAdjustment.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Amount",
                    value: (
                      <span
                        className={
                          selectedAdjustment.direction === "earning"
                            ? "text-lg font-bold text-success"
                            : "text-lg font-bold text-danger"
                        }
                      >
                        {selectedAdjustment.direction === "deduction" ? "−" : "+"}
                        {formatPKR(selectedAdjustment.amount)}
                      </span>
                    ),
                  },
                  {
                    label: "Direction",
                    value: (
                      <Badge
                        variant={
                          PAYROLL_ADJUSTMENT_DIRECTION_CONFIG[
                            selectedAdjustment.direction
                          ].badgeVariant
                        }
                      >
                        {
                          PAYROLL_ADJUSTMENT_DIRECTION_CONFIG[
                            selectedAdjustment.direction
                          ].label
                        }
                      </Badge>
                    ),
                  },
                  {
                    label: "Payroll period",
                    value: formatPeriod(selectedAdjustment.effectivePeriod),
                  },
                  {
                    label: "Frequency",
                    value:
                      PAYROLL_ADJUSTMENT_FREQUENCY_CONFIG[selectedAdjustment.frequency]
                        .label,
                  },
                  {
                    label: "Tax treatment",
                    value: selectedAdjustment.taxable ? "Taxable" : "Non-taxable",
                  },
                  {
                    label: "Reviewer",
                    value: selectedAdjustment.reviewedBy || "Not reviewed",
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Adjustment reason</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedAdjustment.reason}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedAdjustment.internalNote || "No internal note has been added."}
              </p>
            </section>

            {selectedAdjustment.appliedAt && (
              <div className="rounded-control bg-success-muted p-4">
                <p className="text-sm font-semibold text-success">
                  Applied to payroll on {formatDate(selectedAdjustment.appliedAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "Add payroll adjustment" : "Edit payroll adjustment"
        }
        description="Configure employee earnings or deductions before payroll processing."
      >
        {editorMode && (
          <PayrollAdjustmentForm
            key={editorMode === "create" ? "new-adjustment" : selectedAdjustment?.id}
            adjustment={
              editorMode === "edit" ? (selectedAdjustment ?? undefined) : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveAdjustment}
          />
        )}
      </Drawer>
    </div>
  );
}
