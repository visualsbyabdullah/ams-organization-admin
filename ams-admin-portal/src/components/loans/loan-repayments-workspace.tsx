"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Banknote,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Download,
  FileSearch,
  MoreHorizontal,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { LoanRepaymentForm } from "@/components/loans/loan-repayment-form";
import { LoanTabs } from "@/components/loans/loan-tabs";
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
  LOAN_REPAYMENTS_COPY,
  LOAN_REPAYMENT_PERIOD_OPTIONS,
  LOAN_REPAYMENT_REFERENCE_PERIOD,
  LOAN_REPAYMENT_SOURCE_CONFIG,
  LOAN_REPAYMENT_STATUS_CONFIG,
} from "@/config/loan-repayments";
import {
  LOAN_TYPE_CONFIG,
} from "@/config/loans";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { LOAN_REPAYMENTS } from "@/data/loan-repayments";
import { EMPLOYEE_LOANS } from "@/data/loans";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  LoanRepayment,
  LoanRepaymentPaymentValues,
  LoanRepaymentStatus,
} from "@/types/loan-repayment";

function formatPeriod(
  period: string,
) {
  const [year, month] =
    period.split("-").map(Number);

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(year, month - 1, 1),
  );
}

export function LoanRepaymentsWorkspace() {
  const {
    selectedBranch,
  } = useBranchScope();

  const [
    repayments,
    setRepayments,
  ] = useState<LoanRepayment[]>(
    LOAN_REPAYMENTS,
  );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sourceFilter, setSourceFilter] =
    useState("all");

  const [periodFilter, setPeriodFilter] =
    useState(
      LOAN_REPAYMENT_REFERENCE_PERIOD,
    );

  const [
    selectedRepaymentId,
    setSelectedRepaymentId,
  ] = useState<string | null>(null);

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const scopedRepayments =
    useMemo(
      () =>
        repayments.filter(
          (repayment) =>
            selectedBranch.isAggregate ||
            repayment.branchId ===
              selectedBranch.id,
        ),
      [
        repayments,
        selectedBranch,
      ],
    );

  const visibleRepayments =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return scopedRepayments.filter(
        (repayment) => {
          const employee =
            EMPLOYEES.find(
              (item) =>
                item.id ===
                repayment.employeeId,
            );

          const loan =
            EMPLOYEE_LOANS.find(
              (item) =>
                item.id ===
                repayment.loanId,
            );

          if (!employee || !loan) {
            return false;
          }

          const searchableValue = [
            employee.name,
            employee.employeeCode,
            employee.department,
            employee.designation,
            repayment.referenceNumber,
            repayment.note,
            LOAN_TYPE_CONFIG[
              loan.type
            ].label,
          ]
            .join(" ")
            .toLowerCase();

          const matchesStatus =
            statusFilter === "all" ||
            repayment.status ===
              statusFilter;

          const matchesSource =
            sourceFilter === "all" ||
            repayment.source ===
              sourceFilter;

          const matchesPeriod =
            periodFilter === "all" ||
            repayment.payrollPeriod ===
              periodFilter;

          return (
            searchableValue.includes(
              query,
            ) &&
            matchesStatus &&
            matchesSource &&
            matchesPeriod
          );
        },
      );
    }, [
      periodFilter,
      scopedRepayments,
      searchQuery,
      sourceFilter,
      statusFilter,
    ]);

  const selectedRepayment =
    repayments.find(
      (repayment) =>
        repayment.id ===
        selectedRepaymentId,
    ) ?? null;

  const selectedEmployee =
    selectedRepayment
      ? EMPLOYEES.find(
          (employee) =>
            employee.id ===
            selectedRepayment.employeeId,
        )
      : null;

  const selectedLoan =
    selectedRepayment
      ? EMPLOYEE_LOANS.find(
          (loan) =>
            loan.id ===
            selectedRepayment.loanId,
        )
      : null;

  const currentPeriodRepayments =
    scopedRepayments.filter(
      (repayment) =>
        repayment.payrollPeriod ===
        LOAN_REPAYMENT_REFERENCE_PERIOD,
    );

  const scheduledAmount =
    currentPeriodRepayments
      .filter(
        (repayment) =>
          ![
            "waived",
            "failed",
          ].includes(
            repayment.status,
          ),
      )
      .reduce(
        (total, repayment) =>
          total + repayment.amount,
        0,
      );

  const collectedAmount =
    currentPeriodRepayments.reduce(
      (total, repayment) =>
        total +
        repayment.paidAmount,
      0,
    );

  const overdueAmount =
    scopedRepayments
      .filter(
        (repayment) =>
          repayment.status ===
          "overdue",
      )
      .reduce(
        (total, repayment) =>
          total +
          repayment.balanceAmount,
        0,
      );

  const collectionRate =
    scheduledAmount > 0
      ? Math.round(
          (collectedAmount /
            scheduledAmount) *
            100,
        )
      : 0;

  const collectionQueue =
    scopedRepayments
      .filter((repayment) =>
        [
          "due",
          "partial",
          "overdue",
          "failed",
        ].includes(
          repayment.status,
        ),
      )
      .sort((first, second) =>
        first.dueDate.localeCompare(
          second.dueDate,
        ),
      );

  const metrics = [
    {
      label: "Scheduled this month",
      value: formatPKR(
        scheduledAmount,
        true,
      ),
      detail: "July 2026",
      icon: WalletCards,
      tone: "info" as const,
    },
    {
      label: "Collected this month",
      value: formatPKR(
        collectedAmount,
        true,
      ),
      detail:
        `${collectionRate}% collection rate`,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Outstanding overdue",
      value: formatPKR(
        overdueAmount,
        true,
      ),
      detail:
        "Requires collection action",
      icon: CircleAlert,
      tone: "danger" as const,
    },
    {
      label: "Pending collections",
      value:
        collectionQueue.length,
      detail: selectedBranch.name,
      icon: CircleDollarSign,
      tone: "warning" as const,
    },
  ];

  function recordPayment(
    repaymentId: string,
    values: LoanRepaymentPaymentValues,
  ) {
    setRepayments(
      (currentRepayments) =>
        currentRepayments.map(
          (repayment) => {
            if (
              repayment.id !==
              repaymentId
            ) {
              return repayment;
            }

            const nextPaidAmount =
              Math.min(
                repayment.paidAmount +
                  values.paidAmount,
                repayment.amount,
              );

            const nextBalance =
              Math.max(
                repayment.amount -
                  nextPaidAmount,
                0,
              );

            return {
              ...repayment,
              paidAmount:
                nextPaidAmount,
              balanceAmount:
                nextBalance,
              status:
                nextBalance === 0
                  ? "paid"
                  : "partial",
              paidDate:
                values.paidDate,
              source: values.source,
              referenceNumber:
                values.referenceNumber,
              processedBy:
                CURRENT_ADMIN.name,
              note: values.note,
            };
          },
        ),
    );

    setPaymentOpen(false);
  }

  function processPayrollDeductions() {
    const processDate = new Date()
      .toISOString()
      .slice(0, 10);

    setRepayments(
      (currentRepayments) =>
        currentRepayments.map(
          (repayment) => {
            const inScope =
              selectedBranch.isAggregate ||
              repayment.branchId ===
                selectedBranch.id;

            const shouldProcess =
              inScope &&
              repayment.payrollPeriod ===
                LOAN_REPAYMENT_REFERENCE_PERIOD &&
              repayment.source ===
                "payroll_deduction" &&
              [
                "due",
                "partial",
                "overdue",
              ].includes(
                repayment.status,
              );

            if (!shouldProcess) {
              return repayment;
            }

            return {
              ...repayment,
              paidAmount:
                repayment.amount,
              balanceAmount: 0,
              status: "paid",
              paidDate: processDate,
              referenceNumber:
                repayment.referenceNumber ||
                `PAY-${repayment.branchId.toUpperCase()}-${repayment.payrollPeriod.replace(
                  "-",
                  "",
                )}-${repayment.installmentNumber}`,
              processedBy:
                CURRENT_ADMIN.name,
              note:
                repayment.note ||
                "Collected through the payroll deduction batch.",
            };
          },
        ),
    );
  }

  function updateStatus(
    repaymentId: string,
    status: LoanRepaymentStatus,
  ) {
    setRepayments(
      (currentRepayments) =>
        currentRepayments.map(
          (repayment) =>
            repayment.id ===
            repaymentId
              ? {
                  ...repayment,
                  status,
                  paidAmount:
                    status === "waived"
                      ? repayment.amount
                      : status === "due"
                        ? 0
                        : repayment.paidAmount,
                  balanceAmount:
                    status === "waived"
                      ? 0
                      : status === "due"
                        ? repayment.amount
                        : repayment.balanceAmount,
                  processedBy:
                    status === "waived"
                      ? CURRENT_ADMIN.name
                      : repayment.processedBy,
                  note:
                    status === "waived"
                      ? repayment.note ||
                        `Installment waived by ${CURRENT_ADMIN.name}.`
                      : repayment.note,
                }
              : repayment,
        ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          LOAN_REPAYMENTS_COPY.eyebrow
        }
        title={
          LOAN_REPAYMENTS_COPY.title
        }
        description={
          LOAN_REPAYMENTS_COPY.description
        }
        actions={
          <>
            <Button variant="outline">
              <Download />
              {
                LOAN_REPAYMENTS_COPY.exportAction
              }
            </Button>

            <Button
              onClick={
                processPayrollDeductions
              }
            >
              <Banknote />
              {
                LOAN_REPAYMENTS_COPY.processAction
              }
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <LoanTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {
                    LOAN_REPAYMENTS_COPY.registerTitle
                  }
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {
                    LOAN_REPAYMENTS_COPY.registerDescription
                  }
                </p>
              </div>

              <div className="w-full shrink-0 xl:w-52">
                <Select
                  value={periodFilter}
                  onChange={(event) =>
                    setPeriodFilter(
                      event.target.value,
                    )
                  }
                >
                  {LOAN_REPAYMENT_PERIOD_OPTIONS.map(
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
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_13rem]">
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
                    LOAN_REPAYMENTS_COPY.searchPlaceholder
                  }
                  className="pl-9"
                />
              </div>

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
                    LOAN_REPAYMENTS_COPY.allStatuses
                  }
                </option>

                {Object.entries(
                  LOAN_REPAYMENT_STATUS_CONFIG,
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

              <Select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  {
                    LOAN_REPAYMENTS_COPY.allSources
                  }
                </option>

                {Object.entries(
                  LOAN_REPAYMENT_SOURCE_CONFIG,
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

          {visibleRepayments.length >
          0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-canvas">
                    <TableHead>
                      Employee
                    </TableHead>

                    <TableHead>
                      Loan
                    </TableHead>

                    <TableHead>
                      Installment
                    </TableHead>

                    <TableHead>
                      Period
                    </TableHead>

                    <TableHead>
                      Due date
                    </TableHead>

                    <TableHead>
                      Amount
                    </TableHead>

                    <TableHead>
                      Collected
                    </TableHead>

                    <TableHead>
                      Balance
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
                  {visibleRepayments.map(
                    (repayment) => {
                      const employee =
                        EMPLOYEES.find(
                          (item) =>
                            item.id ===
                            repayment.employeeId,
                        );

                      const loan =
                        EMPLOYEE_LOANS.find(
                          (item) =>
                            item.id ===
                            repayment.loanId,
                        );

                      if (
                        !employee ||
                        !loan
                      ) {
                        return null;
                      }

                      const statusConfig =
                        LOAN_REPAYMENT_STATUS_CONFIG[
                          repayment.status
                        ];

                      return (
                        <TableRow
                          key={repayment.id}
                          className="cursor-pointer transition hover:bg-canvas"
                          onClick={() =>
                            setSelectedRepaymentId(
                              repayment.id,
                            )
                          }
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={
                                  employee.name
                                }
                                initials={
                                  employee.initials
                                }
                              />

                              <div>
                                <p className="font-semibold">
                                  {employee.name}
                                </p>

                                <p className="mt-1 text-xs text-text-muted">
                                  {
                                    employee.employeeCode
                                  }{" "}
                                  ·{" "}
                                  {
                                    employee.department
                                  }
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                LOAN_TYPE_CONFIG[
                                  loan.type
                                ].badgeVariant
                              }
                            >
                              {
                                LOAN_TYPE_CONFIG[
                                  loan.type
                                ].label
                              }
                            </Badge>
                          </TableCell>

                          <TableCell>
                            #
                            {
                              repayment.installmentNumber
                            }
                          </TableCell>

                          <TableCell>
                            {formatPeriod(
                              repayment.payrollPeriod,
                            )}
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              repayment.dueDate,
                            )}
                          </TableCell>

                          <TableCell>
                            {formatPKR(
                              repayment.amount,
                            )}
                          </TableCell>

                          <TableCell>
                            {formatPKR(
                              repayment.paidAmount,
                            )}
                          </TableCell>

                          <TableCell>
                            <strong>
                              {formatPKR(
                                repayment.balanceAmount,
                              )}
                            </strong>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                statusConfig.badgeVariant
                              }
                            >
                              {statusConfig.label}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Open repayment for ${employee.name}`}
                              onClick={(event) => {
                                event.stopPropagation();

                                setSelectedRepaymentId(
                                  repayment.id,
                                );
                              }}
                            >
                              <MoreHorizontal />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />

              <h3 className="mt-4 font-bold">
                {
                  LOAN_REPAYMENTS_COPY.emptyTitle
                }
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                {
                  LOAN_REPAYMENTS_COPY.emptyDescription
                }
              </p>
            </div>
          )}
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <ShieldCheck size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                {
                  LOAN_REPAYMENTS_COPY.attentionTitle
                }
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {
                  LOAN_REPAYMENTS_COPY.attentionDescription
                }
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {collectionQueue.length >
            0 ? (
              collectionQueue.map(
                (repayment) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        repayment.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  return (
                    <button
                      key={repayment.id}
                      type="button"
                      onClick={() =>
                        setSelectedRepaymentId(
                          repayment.id,
                        )
                      }
                      className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {employee.name}
                          </p>

                          <p className="mt-1 text-xs text-text-muted">
                            Installment #
                            {
                              repayment.installmentNumber
                            }
                          </p>
                        </div>

                        <Badge
                          variant={
                            LOAN_REPAYMENT_STATUS_CONFIG[
                              repayment.status
                            ].badgeVariant
                          }
                        >
                          {
                            LOAN_REPAYMENT_STATUS_CONFIG[
                              repayment.status
                            ].label
                          }
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <strong className="text-sm">
                          {formatPKR(
                            repayment.balanceAmount,
                          )}
                        </strong>

                        <span className="text-xs text-text-muted">
                          {formatDate(
                            repayment.dueDate,
                          )}
                        </span>
                      </div>
                    </button>
                  );
                },
              )
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                All current loan installments have
                been collected.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Drawer
        open={Boolean(
          selectedRepayment &&
            selectedEmployee &&
            selectedLoan,
        )}
        onClose={() => {
          setSelectedRepaymentId(null);
          setPaymentOpen(false);
        }}
        title="Loan repayment"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedRepayment ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedRepayment.status ===
                "paid" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(
                      selectedRepayment.id,
                      "due",
                    )
                  }
                >
                  <RotateCcw />
                  Reverse payment
                </Button>
              )}

              {[
                "due",
                "partial",
                "overdue",
                "failed",
              ].includes(
                selectedRepayment.status,
              ) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateStatus(
                        selectedRepayment.id,
                        "waived",
                      )
                    }
                  >
                    <X />
                    Waive balance
                  </Button>

                  <Button
                    onClick={() =>
                      setPaymentOpen(true)
                    }
                  >
                    <ReceiptText />
                    Record payment
                  </Button>
                </>
              )}

              {selectedRepayment.status ===
                "waived" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(
                      selectedRepayment.id,
                      "due",
                    )
                  }
                >
                  <RotateCcw />
                  Reopen installment
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRepayment &&
          selectedEmployee &&
          selectedLoan && (
            <div className="space-y-6">
              <section className="rounded-card border border-border">
                <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                  <div>
                    <h3 className="font-bold">
                      {
                        LOAN_TYPE_CONFIG[
                          selectedLoan.type
                        ].label
                      }{" "}
                      · Installment #
                      {
                        selectedRepayment.installmentNumber
                      }
                    </h3>

                    <p className="mt-1 text-xs text-text-muted">
                      Due{" "}
                      {formatDate(
                        selectedRepayment.dueDate,
                      )}
                    </p>
                  </div>

                  <Badge
                    variant={
                      LOAN_REPAYMENT_STATUS_CONFIG[
                        selectedRepayment.status
                      ].badgeVariant
                    }
                  >
                    {
                      LOAN_REPAYMENT_STATUS_CONFIG[
                        selectedRepayment.status
                      ].label
                    }
                  </Badge>
                </div>

                <dl className="grid gap-5 p-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-text-muted">
                      Payroll period
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {formatPeriod(
                        selectedRepayment.payrollPeriod,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Payment source
                    </dt>

                    <dd className="mt-1">
                      <Badge
                        variant={
                          LOAN_REPAYMENT_SOURCE_CONFIG[
                            selectedRepayment.source
                          ].badgeVariant
                        }
                      >
                        {
                          LOAN_REPAYMENT_SOURCE_CONFIG[
                            selectedRepayment.source
                          ].label
                        }
                      </Badge>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Installment amount
                    </dt>

                    <dd className="mt-1 text-lg font-bold">
                      {formatPKR(
                        selectedRepayment.amount,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Remaining balance
                    </dt>

                    <dd className="mt-1 text-lg font-bold">
                      {formatPKR(
                        selectedRepayment.balanceAmount,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Payment date
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {selectedRepayment.paidDate
                        ? formatDate(
                            selectedRepayment.paidDate,
                          )
                        : "Not paid"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Processed by
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {selectedRepayment.processedBy ||
                        "Not processed"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Reference number
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {selectedRepayment.referenceNumber ||
                        "Not assigned"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Employee branch
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {
                        selectedEmployee.branchName
                      }
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Collection progress
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-control bg-canvas p-4">
                    <p className="text-xs text-text-muted">
                      Scheduled
                    </p>

                    <p className="mt-1 font-bold">
                      {formatPKR(
                        selectedRepayment.amount,
                      )}
                    </p>
                  </div>

                  <div className="rounded-control bg-success-muted p-4">
                    <p className="text-xs text-success">
                      Collected
                    </p>

                    <p className="mt-1 font-bold text-success">
                      {formatPKR(
                        selectedRepayment.paidAmount,
                      )}
                    </p>
                  </div>

                  <div className="rounded-control bg-warning-muted p-4">
                    <p className="text-xs text-warning">
                      Balance
                    </p>

                    <p className="mt-1 font-bold text-warning">
                      {formatPKR(
                        selectedRepayment.balanceAmount,
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Repayment note
                </h3>

                <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                  {selectedRepayment.note ||
                    "No repayment note has been added."}
                </p>
              </section>
            </div>
          )}
      </Drawer>

      <Drawer
        open={Boolean(
          paymentOpen &&
            selectedRepayment,
        )}
        onClose={() =>
          setPaymentOpen(false)
        }
        title="Record loan payment"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · Installment #${selectedRepayment?.installmentNumber}`
            : undefined
        }
      >
        {selectedRepayment && (
          <LoanRepaymentForm
            key={`${selectedRepayment.id}-${selectedRepayment.balanceAmount}`}
            repayment={
              selectedRepayment
            }
            onCancel={() =>
              setPaymentOpen(false)
            }
            onSubmit={
              recordPayment
            }
          />
        )}
      </Drawer>
    </div>
  );
}
