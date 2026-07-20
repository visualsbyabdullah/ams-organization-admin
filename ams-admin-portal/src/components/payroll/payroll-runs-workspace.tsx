"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Banknote,
  Check,
  CircleDollarSign,
  Clock3,
  Copy,
  Download,
  FileClock,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PayrollRunForm } from "@/components/payroll/payroll-run-form";
import {
  PayrollRunsBranchChart,
  type PayrollBranchComparisonPoint,
} from "@/components/payroll/payroll-runs-branch-chart";
import { PayrollTabs } from "@/components/payroll/payroll-tabs";
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
  PAYROLL_RUN_STATUS_CONFIG,
} from "@/config/payroll";
import {
  PAYROLL_RUN_PERIOD_OPTIONS,
  PAYROLL_RUNS_COPY,
} from "@/config/payroll-runs";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { PAYROLL_RUNS } from "@/data/payroll";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  PayrollRun,
  PayrollRunStatus,
} from "@/types/payroll";

function getBranchShortName(
  branchName: string,
) {
  return branchName.replace(
    " Branch",
    "",
  );
}

export function PayrollRunsWorkspace() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [runs, setRuns] =
    useState<PayrollRun[]>(
      PAYROLL_RUNS,
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [periodFilter, setPeriodFilter] =
    useState("all");

  const [
    selectedRunId,
    setSelectedRunId,
  ] = useState<string | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const scopedRuns = useMemo(
    () =>
      runs.filter(
        (run) =>
          selectedBranch.isAggregate ||
          run.branchId ===
            selectedBranch.id ||
          run.branchId === "all",
      ),
    [runs, selectedBranch],
  );

  const visibleRuns = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return scopedRuns.filter((run) => {
      const searchableValue = [
        run.periodLabel,
        run.branchName,
        run.createdBy,
        run.note,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableValue.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        run.status === statusFilter;

      const matchesPeriod =
        periodFilter === "all" ||
        run.period === periodFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPeriod
      );
    });
  }, [
    periodFilter,
    scopedRuns,
    searchQuery,
    statusFilter,
  ]);

  const selectedRun =
    runs.find(
      (run) =>
        run.id === selectedRunId,
    ) ?? null;

  const chartPeriod =
    periodFilter === "all"
      ? "2026-07"
      : periodFilter;

  const chartData =
    useMemo<
      PayrollBranchComparisonPoint[]
    >(
      () =>
        scopedRuns
          .filter(
            (run) =>
              run.period ===
              chartPeriod,
          )
          .filter(
            (run) =>
              run.branchId !== "all",
          )
          .map((run) => ({
            branch:
              getBranchShortName(
                run.branchName,
              ),
            gross:
              run.grossAmount,
            deductions:
              run.deductionAmount,
            net: run.netAmount,
          })),
      [chartPeriod, scopedRuns],
    );

  const currentPeriodRuns =
    scopedRuns.filter(
      (run) =>
        run.period === "2026-07",
    );

  const totalNetAmount =
    currentPeriodRuns.reduce(
      (total, run) =>
        total + run.netAmount,
      0,
    );

  const metrics = [
    {
      label: "Current payroll runs",
      value:
        currentPeriodRuns.length,
      detail: selectedBranch.name,
      icon: FileClock,
      tone: "info" as const,
    },
    {
      label: "Pending approval",
      value: currentPeriodRuns.filter(
        (run) =>
          run.status ===
          "pending_approval",
      ).length,
      detail:
        "Waiting for final review",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Approved or paid",
      value: currentPeriodRuns.filter(
        (run) =>
          run.status ===
            "approved" ||
          run.status === "paid",
      ).length,
      detail:
        "Completed review stage",
      icon: ShieldCheck,
      tone: "success" as const,
    },
    {
      label: "Current net payroll",
      value: formatPKR(
        totalNetAmount,
        true,
      ),
      detail:
        "Selected organization scope",
      icon: WalletCards,
      tone: "success" as const,
    },
  ];

  function createRun(
    run: PayrollRun,
  ) {
    setRuns(
      (currentRuns) => [
        run,
        ...currentRuns,
      ],
    );

    setCreateOpen(false);
    setSelectedRunId(run.id);
  }

  function updateRunStatus(
    runId: string,
    status: PayrollRunStatus,
  ) {
    setRuns(
      (currentRuns) =>
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

  function duplicateRun(
    run: PayrollRun,
  ) {
    const duplicate: PayrollRun = {
      ...run,
      id: crypto.randomUUID(),
      status: "draft",
      createdAt: new Date()
        .toISOString()
        .slice(0, 10),
      createdBy:
        CURRENT_ADMIN.name,
      note: `Created from ${run.periodLabel} ${run.branchName} payroll run.`,
    };

    setRuns(
      (currentRuns) => [
        duplicate,
        ...currentRuns,
      ],
    );

    setSelectedRunId(
      duplicate.id,
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          PAYROLL_RUNS_COPY.eyebrow
        }
        title={
          PAYROLL_RUNS_COPY.title
        }
        description={
          PAYROLL_RUNS_COPY.description
        }
        actions={
          <>
            <Button variant="outline">
              <Download />
              {
                PAYROLL_RUNS_COPY.exportAction
              }
            </Button>

            <Button
              onClick={() =>
                setCreateOpen(true)
              }
            >
              <Plus />
              {
                PAYROLL_RUNS_COPY.createAction
              }
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <PayrollTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6">
        <ChartCard
          title={
            PAYROLL_RUNS_COPY.chartTitle
          }
          description={
            PAYROLL_RUNS_COPY.chartDescription
          }
        >
          {chartData.length > 0 ? (
            <PayrollRunsBranchChart
              data={chartData}
            />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-text-muted">
              No branch payroll data is
              available for this period.
            </div>
          )}
        </ChartCard>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {
              PAYROLL_RUNS_COPY.tableTitle
            }
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              PAYROLL_RUNS_COPY.tableDescription
            }
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder={
                  PAYROLL_RUNS_COPY.searchPlaceholder
                }
                className="pl-9"
              />
            </div>

            <Select
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(
                  event.target.value,
                )
              }
            >
              {PAYROLL_RUN_PERIOD_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  PAYROLL_RUNS_COPY.allStatuses
                }
              </option>

              {Object.entries(
                PAYROLL_RUN_STATUS_CONFIG,
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
          </div>
        </div>

        {visibleRuns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>
                  Payroll period
                </TableHead>

                <TableHead>
                  Branch
                </TableHead>

                <TableHead>
                  Employees
                </TableHead>

                <TableHead>
                  Gross amount
                </TableHead>

                <TableHead>
                  Deductions
                </TableHead>

                <TableHead>
                  Net amount
                </TableHead>

                <TableHead>
                  Pay date
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="w-16">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleRuns.map((run) => {
                const statusConfig =
                  PAYROLL_RUN_STATUS_CONFIG[
                    run.status
                  ];

                return (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() =>
                      setSelectedRunId(
                        run.id,
                      )
                    }
                  >
                    <TableCell>
                      <p className="font-semibold">
                        {run.periodLabel}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        Created{" "}
                        {formatDate(
                          run.createdAt,
                        )}
                      </p>
                    </TableCell>

                    <TableCell>
                      {run.branchName}
                    </TableCell>

                    <TableCell>
                      {run.employeeCount}
                    </TableCell>

                    <TableCell>
                      {formatPKR(
                        run.grossAmount,
                      )}
                    </TableCell>

                    <TableCell>
                      {formatPKR(
                        run.deductionAmount,
                      )}
                    </TableCell>

                    <TableCell>
                      <strong>
                        {formatPKR(
                          run.netAmount,
                        )}
                      </strong>
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        run.payDate,
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          statusConfig.badgeVariant
                        }
                      >
                        {
                          statusConfig.label
                        }
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open ${run.periodLabel} payroll run`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setSelectedRunId(
                            run.id,
                          );
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
            <FileClock className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">
              {
                PAYROLL_RUNS_COPY.emptyTitle
              }
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              {
                PAYROLL_RUNS_COPY.emptyDescription
              }
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedRun)}
        onClose={() =>
          setSelectedRunId(null)
        }
        title="Payroll run details"
        description={
          selectedRun
            ? `${selectedRun.periodLabel} · ${selectedRun.branchName}`
            : undefined
        }
        footer={
          selectedRun ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  duplicateRun(
                    selectedRun,
                  )
                }
              >
                <Copy />
                Duplicate
              </Button>

              {selectedRun.status !==
                "draft" &&
                selectedRun.status !==
                  "paid" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateRunStatus(
                        selectedRun.id,
                        "draft",
                      )
                    }
                  >
                    <RotateCcw />
                    Return to draft
                  </Button>
                )}

              {selectedRun.status ===
                "draft" && (
                <Button
                  onClick={() =>
                    updateRunStatus(
                      selectedRun.id,
                      "processing",
                    )
                  }
                >
                  <Play />
                  Start processing
                </Button>
              )}

              {selectedRun.status ===
                "processing" && (
                <Button
                  onClick={() =>
                    updateRunStatus(
                      selectedRun.id,
                      "pending_approval",
                    )
                  }
                >
                  <Clock3 />
                  Submit for approval
                </Button>
              )}

              {selectedRun.status ===
                "pending_approval" && (
                <Button
                  onClick={() =>
                    updateRunStatus(
                      selectedRun.id,
                      "approved",
                    )
                  }
                >
                  <Check />
                  Approve run
                </Button>
              )}

              {selectedRun.status ===
                "approved" && (
                <Button
                  onClick={() =>
                    updateRunStatus(
                      selectedRun.id,
                      "paid",
                    )
                  }
                >
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
                  <h3 className="font-bold">
                    {selectedRun.periodLabel}
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Created by{" "}
                    {selectedRun.createdBy}{" "}
                    on{" "}
                    {formatDate(
                      selectedRun.createdAt,
                    )}
                  </p>
                </div>

                <Badge
                  variant={
                    PAYROLL_RUN_STATUS_CONFIG[
                      selectedRun.status
                    ].badgeVariant
                  }
                >
                  {
                    PAYROLL_RUN_STATUS_CONFIG[
                      selectedRun.status
                    ].label
                  }
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">
                    Organization scope
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedRun.branchName}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Employees
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {
                      selectedRun.employeeCount
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Period start
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(
                      selectedRun.periodStart,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Period end
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(
                      selectedRun.periodEnd,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Expected pay date
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(
                      selectedRun.payDate,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Current status
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {
                      PAYROLL_RUN_STATUS_CONFIG[
                        selectedRun.status
                      ].label
                    }
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">
                Payroll totals
              </h3>

              <dl className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-control bg-canvas px-4 py-3">
                  <dt className="text-sm text-text-muted">
                    Gross payroll
                  </dt>

                  <dd className="text-sm font-semibold">
                    {formatPKR(
                      selectedRun.grossAmount,
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between rounded-control bg-warning-muted px-4 py-3">
                  <dt className="text-sm font-semibold text-warning">
                    Total deductions
                  </dt>

                  <dd className="text-sm font-bold text-warning">
                    {formatPKR(
                      selectedRun.deductionAmount,
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between rounded-control bg-success-muted px-4 py-3">
                  <dt className="text-sm font-semibold text-success">
                    Net payroll
                  </dt>

                  <dd className="text-sm font-bold text-success">
                    {formatPKR(
                      selectedRun.netAmount,
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">
                Processing note
              </h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedRun.note ||
                  "No payroll processing note has been added."}
              </p>
            </section>

            {selectedRun.status ===
              "paid" && (
              <div className="flex items-center gap-3 rounded-control bg-success-muted p-4 text-success">
                <CircleDollarSign className="size-5" />

                <p className="text-sm font-semibold">
                  This payroll run has been
                  completed and marked as paid.
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        title="Start payroll run"
        description="Create a new payroll run for an organization period and branch scope."
      >
        <PayrollRunForm
          selectedBranchId={
            selectedBranchId
          }
          onCancel={() =>
            setCreateOpen(false)
          }
          onCreate={createRun}
        />
      </Drawer>
    </div>
  );
}
