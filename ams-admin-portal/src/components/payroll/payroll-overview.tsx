"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Check,
  CircleDollarSign,
  Clock3,
  Download,
  MoreHorizontal,
  PauseCircle,
  Play,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PayrollCostBreakdownChart } from "@/components/payroll/payroll-cost-breakdown-chart";
import { PayrollEmployeeDetails } from "@/components/payroll/payroll-employee-details";
import { PayrollRunForm } from "@/components/payroll/payroll-run-form";
import { PayrollTabs } from "@/components/payroll/payroll-tabs";
import { PayrollTrendChart } from "@/components/payroll/payroll-trend-chart";
import { DetailGrid } from "@/components/shared/detail-grid";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
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
  PAYROLL_COPY,
  PAYROLL_EMPLOYEE_STATUS_CONFIG,
  PAYROLL_PAYMENT_METHOD_CONFIG,
  PAYROLL_REFERENCE_PERIOD,
  PAYROLL_RUN_STATUS_CONFIG,
} from "@/config/payroll";
import { CHART_COLORS } from "@/config/charts";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import { PAYROLL_EMPLOYEE_RECORDS, PAYROLL_RUNS, PAYROLL_TRENDS } from "@/data/payroll";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  PayrollEmployeeRecord,
  PayrollEmployeeStatus,
  PayrollRun,
  PayrollRunStatus,
} from "@/types/payroll";

function getGrossPay(record: PayrollEmployeeRecord) {
  return record.baseSalary + record.allowances + record.overtimePay + record.bonus;
}

function getTotalDeductions(record: PayrollEmployeeRecord) {
  return record.deductions + record.tax;
}

export function PayrollOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [runs, setRuns] = useState<PayrollRun[]>(PAYROLL_RUNS);

  const [employeeRecords, setEmployeeRecords] = useState<PayrollEmployeeRecord[]>(
    PAYROLL_EMPLOYEE_RECORDS,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const recordSelection = useEntitySelection(employeeRecords, (record) => record.id);

  const runSelection = useEntitySelection(runs, (run) => run.id);

  const [createRunOpen, setCreateRunOpen] = useState(false);

  const scopedRecords = useMemo(
    () =>
      employeeRecords.filter(
        (record) =>
          record.period === PAYROLL_REFERENCE_PERIOD &&
          (selectedBranch.isAggregate || record.branchId === selectedBranch.id),
      ),
    [employeeRecords, selectedBranch],
  );

  const visibleRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedRecords.filter((record) => {
      const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

      if (!employee) {
        return false;
      }

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        employee.email,
      ]
        .join(" ")
        .toLowerCase();

      const matchesStatus = statusFilter === "all" || record.status === statusFilter;

      return matchesStatus && searchableValue.includes(query);
    });
  }, [scopedRecords, searchQuery, statusFilter]);

  const scopedRuns = useMemo(
    () =>
      runs.filter(
        (run) =>
          selectedBranch.isAggregate ||
          run.branchId === selectedBranch.id ||
          run.branchId === "all",
      ),
    [runs, selectedBranch],
  );

  const selectedRecord = recordSelection.selected;

  const selectedEmployee = selectedRecord
    ? EMPLOYEES.find((employee) => employee.id === selectedRecord.employeeId)
    : null;

  const selectedRun = runSelection.selected;

  const grossPayroll = scopedRecords.reduce(
    (total, record) => total + getGrossPay(record),
    0,
  );

  const netPayroll = scopedRecords.reduce((total, record) => total + record.netPay, 0);

  const totalDeductions = scopedRecords.reduce(
    (total, record) => total + getTotalDeductions(record),
    0,
  );

  const pendingCount = scopedRecords.filter(
    (record) => record.status === "pending_review",
  ).length;

  const holdCount = scopedRecords.filter((record) => record.status === "on_hold").length;

  const attentionRecords = scopedRecords.filter(
    (record) => record.status === "pending_review" || record.status === "on_hold",
  );

  const trend = PAYROLL_TRENDS[selectedBranchId] ?? PAYROLL_TRENDS.all;

  const costBreakdown = [
    {
      name: "Base salaries",
      value: scopedRecords.reduce((total, record) => total + record.baseSalary, 0),
      color: CHART_COLORS.primary,
    },
    {
      name: "Allowances",
      value: scopedRecords.reduce((total, record) => total + record.allowances, 0),
      color: CHART_COLORS.present,
    },
    {
      name: "Overtime",
      value: scopedRecords.reduce((total, record) => total + record.overtimePay, 0),
      color: CHART_COLORS.late,
    },
    {
      name: "Bonuses",
      value: scopedRecords.reduce((total, record) => total + record.bonus, 0),
      color: CHART_COLORS.leave,
    },
  ];

  const metrics = [
    {
      label: "Gross payroll",
      value: formatPKR(grossPayroll, true),
      detail: selectedBranch.name,
      icon: CircleDollarSign,
      tone: "info" as const,
    },
    {
      label: "Net payroll",
      value: formatPKR(netPayroll, true),
      detail: "Expected employee payout",
      icon: WalletCards,
      tone: "success" as const,
    },
    {
      label: "Total deductions",
      value: formatPKR(totalDeductions, true),
      detail: "Tax and other deductions",
      icon: Banknote,
      tone: "warning" as const,
    },
    {
      label: "Requires attention",
      value: pendingCount + holdCount,
      detail: `${pendingCount} pending · ${holdCount} on hold`,
      icon: TriangleAlert,
      tone: "danger" as const,
    },
  ];

  function createRun(run: PayrollRun) {
    setRuns((currentRuns) => [run, ...currentRuns]);

    setCreateRunOpen(false);
    runSelection.select(run.id);
  }

  function updateEmployeeStatus(recordId: string, status: PayrollEmployeeStatus) {
    setEmployeeRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status,
            }
          : record,
      ),
    );
  }

  function updateRunStatus(runId: string, status: PayrollRunStatus) {
    setRuns((currentRuns) =>
      currentRuns.map((run) =>
        run.id === runId
          ? {
              ...run,
              status,
            }
          : run,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={PAYROLL_COPY.eyebrow}
        title={PAYROLL_COPY.title}
        description={PAYROLL_COPY.description}
        actions={
          <>
            <Button variant="outline">
              <Download />
              {PAYROLL_COPY.export}
            </Button>

            <Button onClick={() => setCreateRunOpen(true)}>
              <Plus />
              {PAYROLL_COPY.startRun}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <PayrollTabs />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{PAYROLL_COPY.currentPeriod}</p>

          <p className="mt-1 text-xs text-text-muted">{selectedBranch.name}</p>
        </div>

        <Badge variant="neutral">01 Jul – 31 Jul 2026</Badge>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={PAYROLL_COPY.trendTitle}
          description={PAYROLL_COPY.trendDescription}
        >
          <PayrollTrendChart data={trend} />
        </ChartCard>

        <ChartCard
          title={PAYROLL_COPY.breakdownTitle}
          description={PAYROLL_COPY.breakdownDescription}
        >
          <PayrollCostBreakdownChart data={costBreakdown} />
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{PAYROLL_COPY.runsTitle}</h2>

            <p className="mt-1 text-sm text-text-muted">{PAYROLL_COPY.runsDescription}</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Payroll period</TableHead>

                <TableHead>Branch</TableHead>

                <TableHead>Employees</TableHead>

                <TableHead>Net amount</TableHead>

                <TableHead>Pay date</TableHead>

                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {scopedRuns.slice(0, 5).map((run) => {
                const statusConfig = PAYROLL_RUN_STATUS_CONFIG[run.status];

                return (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => runSelection.select(run.id)}
                  >
                    <TableCell>
                      <p className="font-semibold">{run.periodLabel}</p>

                      <p className="mt-1 text-xs text-text-muted">
                        Created {formatDate(run.createdAt)}
                      </p>
                    </TableCell>

                    <TableCell>{run.branchName}</TableCell>

                    <TableCell>{run.employeeCount}</TableCell>

                    <TableCell>{formatPKR(run.netAmount)}</TableCell>

                    <TableCell>{formatDate(run.payDate)}</TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold">{PAYROLL_COPY.attentionTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {PAYROLL_COPY.attentionDescription}
          </p>

          <div className="mt-5 space-y-3">
            {attentionRecords.length > 0 ? (
              attentionRecords.map((record) => {
                const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

                if (!employee) {
                  return null;
                }

                const statusConfig = PAYROLL_EMPLOYEE_STATUS_CONFIG[record.status];

                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => recordSelection.select(record.id)}
                    className="flex w-full items-center justify-between gap-4 rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div>
                      <p className="text-sm font-semibold">{employee.name}</p>

                      <p className="mt-1 text-xs text-text-muted">
                        {formatPKR(record.netPay)}
                      </p>
                    </div>

                    <Badge variant={statusConfig.badgeVariant}>
                      {statusConfig.label}
                    </Badge>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                All employee payroll records are ready.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{PAYROLL_COPY.employeeTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {PAYROLL_COPY.employeeDescription}
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={PAYROLL_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{PAYROLL_COPY.allStatuses}</option>

              {Object.entries(PAYROLL_EMPLOYEE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visibleRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Gross pay</TableHead>

                <TableHead>Deductions</TableHead>

                <TableHead>Net pay</TableHead>

                <TableHead>Payment method</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRecords.map((record) => {
                const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

                if (!employee) {
                  return null;
                }

                const statusConfig = PAYROLL_EMPLOYEE_STATUS_CONFIG[record.status];

                const paymentConfig = PAYROLL_PAYMENT_METHOD_CONFIG[record.paymentMethod];

                return (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => recordSelection.select(record.id)}
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

                    <TableCell>{formatPKR(getGrossPay(record))}</TableCell>

                    <TableCell>{formatPKR(getTotalDeductions(record))}</TableCell>

                    <TableCell>
                      <strong>{formatPKR(record.netPay)}</strong>
                    </TableCell>

                    <TableCell>
                      <Badge variant={paymentConfig.badgeVariant}>
                        {paymentConfig.label}
                      </Badge>
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
                        aria-label={`Review payroll for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          recordSelection.select(record.id);
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
            <WalletCards className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">No payroll records found</h3>

            <p className="mt-2 text-sm text-text-muted">
              Change the branch, search or payment-status filters.
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedRecord)}
        onClose={() => recordSelection.clear()}
        title="Employee payroll"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedRecord ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedRecord.status !== "on_hold" && (
                <Button
                  variant="outline"
                  onClick={() => updateEmployeeStatus(selectedRecord.id, "on_hold")}
                >
                  <PauseCircle />
                  Place on hold
                </Button>
              )}

              {selectedRecord.status === "on_hold" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateEmployeeStatus(selectedRecord.id, "pending_review")
                  }
                >
                  <Play />
                  Release hold
                </Button>
              )}

              {selectedRecord.status === "pending_review" && (
                <Button
                  onClick={() => updateEmployeeStatus(selectedRecord.id, "approved")}
                >
                  <Check />
                  Approve payroll
                </Button>
              )}

              {selectedRecord.status === "approved" && (
                <Button onClick={() => updateEmployeeStatus(selectedRecord.id, "paid")}>
                  <Banknote />
                  Mark as paid
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRecord && selectedEmployee && (
          <PayrollEmployeeDetails record={selectedRecord} employee={selectedEmployee} />
        )}
      </Drawer>

      <Drawer
        open={Boolean(selectedRun)}
        onClose={() => runSelection.clear()}
        title="Payroll run"
        description={
          selectedRun
            ? `${selectedRun.periodLabel} · ${selectedRun.branchName}`
            : undefined
        }
        footer={
          selectedRun ? (
            <div className="flex justify-end gap-3">
              {selectedRun.status === "draft" && (
                <Button onClick={() => updateRunStatus(selectedRun.id, "processing")}>
                  <Play />
                  Start processing
                </Button>
              )}

              {selectedRun.status === "processing" && (
                <Button
                  onClick={() => updateRunStatus(selectedRun.id, "pending_approval")}
                >
                  <Clock3 />
                  Submit for approval
                </Button>
              )}

              {selectedRun.status === "pending_approval" && (
                <Button onClick={() => updateRunStatus(selectedRun.id, "approved")}>
                  <ShieldCheck />
                  Approve run
                </Button>
              )}

              {selectedRun.status === "approved" && (
                <Button onClick={() => updateRunStatus(selectedRun.id, "paid")}>
                  <Banknote />
                  Mark as paid
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRun && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedRun.periodLabel}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Created by {selectedRun.createdBy} on{" "}
                    {formatDate(selectedRun.createdAt)}
                  </p>
                </div>

                <Badge
                  variant={PAYROLL_RUN_STATUS_CONFIG[selectedRun.status].badgeVariant}
                >
                  {PAYROLL_RUN_STATUS_CONFIG[selectedRun.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Organization scope",
                    value: selectedRun.branchName,
                  },
                  {
                    label: "Employees",
                    value: selectedRun.employeeCount,
                  },
                  {
                    label: "Payroll period",
                    value: `${formatDate(selectedRun.periodStart)} – ${formatDate(selectedRun.periodEnd)}`,
                  },
                  {
                    label: "Pay date",
                    value: formatDate(selectedRun.payDate),
                  },
                  {
                    label: "Gross amount",
                    value: formatPKR(selectedRun.grossAmount),
                  },
                  {
                    label: "Net amount",
                    value: (
                      <span className="font-bold text-success">
                        {formatPKR(selectedRun.netAmount)}
                      </span>
                    ),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Payroll note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedRun.note || "No payroll note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={createRunOpen}
        onClose={() => setCreateRunOpen(false)}
        title="Start payroll run"
        description="Create a payroll run for an organization period and branch scope."
      >
        <PayrollRunForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateRunOpen(false)}
          onCreate={createRun}
        />
      </Drawer>
    </div>
  );
}
