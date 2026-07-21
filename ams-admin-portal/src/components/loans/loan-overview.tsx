"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Check,
  CircleAlert,
  CircleDollarSign,
  Download,
  HandCoins,
  MoreHorizontal,
  PauseCircle,
  Play,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LoanApplicationForm } from "@/components/loans/loan-application-form";
import { LoanRepaymentChart } from "@/components/loans/loan-repayment-chart";
import { LoanTabs } from "@/components/loans/loan-tabs";
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
  LOANS_COPY,
  LOAN_REPAYMENT_METHOD_CONFIG,
  LOAN_STATUS_CONFIG,
  LOAN_TYPE_CONFIG,
} from "@/config/loans";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { EMPLOYEE_LOANS, LOAN_REPAYMENT_TRENDS } from "@/data/loans";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { EmployeeLoan, EmployeeLoanStatus } from "@/types/loan";

function addOneMonth(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);

  date.setMonth(date.getMonth() + 1);

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function LoanOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();

  const [loans, setLoans] = useState<EmployeeLoan[]>(EMPLOYEE_LOANS);

  const [searchQuery, setSearchQuery] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const loanSelection = useEntitySelection(loans, (loan) => loan.id);

  const [createOpen, setCreateOpen] = useState(false);

  const scopedLoans = useMemo(
    () =>
      loans.filter(
        (loan) => selectedBranch.isAggregate || loan.branchId === selectedBranch.id,
      ),
    [loans, selectedBranch],
  );

  const visibleLoans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedLoans.filter((loan) => {
      const employee = EMPLOYEES.find((item) => item.id === loan.employeeId);

      if (!employee) {
        return false;
      }

      const searchableValue = [
        employee.name,
        employee.employeeCode,
        employee.department,
        employee.designation,
        loan.purpose,
        LOAN_TYPE_CONFIG[loan.type].label,
      ]
        .join(" ")
        .toLowerCase();

      const matchesType = typeFilter === "all" || loan.type === typeFilter;

      const matchesStatus = statusFilter === "all" || loan.status === statusFilter;

      return searchableValue.includes(query) && matchesType && matchesStatus;
    });
  }, [scopedLoans, searchQuery, statusFilter, typeFilter]);

  const selectedLoan = loanSelection.selected;

  const selectedEmployee = selectedLoan
    ? EMPLOYEES.find((employee) => employee.id === selectedLoan.employeeId)
    : null;

  const activeLoans = scopedLoans.filter((loan) =>
    ["repaying", "on_hold"].includes(loan.status),
  );

  const outstandingBalance = activeLoans.reduce(
    (total, loan) => total + loan.outstandingBalance,
    0,
  );

  const overdueAmount = scopedLoans.reduce(
    (total, loan) => total + loan.overdueAmount,
    0,
  );

  const pendingApplications = scopedLoans.filter(
    (loan) => loan.status === "pending_approval",
  );

  const attentionLoans = scopedLoans.filter(
    (loan) => loan.status === "pending_approval" || loan.overdueAmount > 0,
  );

  const trend = LOAN_REPAYMENT_TRENDS[selectedBranchId] ?? LOAN_REPAYMENT_TRENDS.all;

  const metrics = [
    {
      label: "Outstanding balance",
      value: formatPKR(outstandingBalance, true),
      detail: selectedBranch.name,
      icon: CircleDollarSign,
      tone: "info" as const,
    },
    {
      label: "Active loans",
      value: activeLoans.length,
      detail: "Repaying or temporarily held",
      icon: HandCoins,
      tone: "success" as const,
    },
    {
      label: "Pending applications",
      value: pendingApplications.length,
      detail: "Waiting for approval",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
    {
      label: "Overdue repayments",
      value: formatPKR(overdueAmount, true),
      detail: "Requires payroll action",
      icon: CircleAlert,
      tone: "danger" as const,
    },
  ];

  function createLoan(loan: EmployeeLoan) {
    setLoans((currentLoans) => [loan, ...currentLoans]);

    setCreateOpen(false);
    loanSelection.select(loan.id);
  }

  function updateStatus(loanId: string, status: EmployeeLoanStatus) {
    const actionDate = new Date().toISOString().slice(0, 10);

    setLoans((currentLoans) =>
      currentLoans.map((loan) => {
        if (loan.id !== loanId) {
          return loan;
        }

        if (status === "approved") {
          return {
            ...loan,
            status,
            approvedAmount: loan.requestedAmount,
            installmentAmount: Math.ceil(loan.requestedAmount / loan.installmentCount),
            outstandingBalance: loan.requestedAmount,
            approvedAt: actionDate,
            reviewedBy: CURRENT_ADMIN.name,
          };
        }

        if (status === "repaying") {
          return {
            ...loan,
            status,
            disbursedAt: loan.disbursedAt ?? actionDate,
            reviewedBy: loan.reviewedBy ?? CURRENT_ADMIN.name,
          };
        }

        if (status === "rejected") {
          return {
            ...loan,
            status,
            approvedAmount: 0,
            outstandingBalance: 0,
            reviewedBy: CURRENT_ADMIN.name,
          };
        }

        return {
          ...loan,
          status,
        };
      }),
    );
  }

  function recordInstallment(loanId: string) {
    setLoans((currentLoans) =>
      currentLoans.map((loan) => {
        if (loan.id !== loanId || loan.status !== "repaying") {
          return loan;
        }

        const payment = Math.min(loan.installmentAmount, loan.outstandingBalance);

        const nextOutstanding = Math.max(loan.outstandingBalance - payment, 0);

        return {
          ...loan,
          paidAmount: loan.paidAmount + payment,
          outstandingBalance: nextOutstanding,
          overdueAmount: Math.max(loan.overdueAmount - payment, 0),
          nextDueDate:
            nextOutstanding > 0 ? addOneMonth(loan.nextDueDate) : loan.nextDueDate,
          status: nextOutstanding === 0 ? "completed" : "repaying",
        };
      }),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={LOANS_COPY.eyebrow}
        title={LOANS_COPY.title}
        description={LOANS_COPY.description}
        actions={
          <>
            <Button variant="outline">
              <Download />
              {LOANS_COPY.exportAction}
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              {LOANS_COPY.createAction}
            </Button>
          </>
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={LOANS_COPY.chartTitle}
          description={LOANS_COPY.chartDescription}
        >
          <LoanRepaymentChart data={trend} />
        </ChartCard>

        <Card className="p-5">
          <h2 className="text-lg font-bold">{LOANS_COPY.attentionTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {LOANS_COPY.attentionDescription}
          </p>

          <div className="mt-5 space-y-3">
            {attentionLoans.length > 0 ? (
              attentionLoans.map((loan) => {
                const employee = EMPLOYEES.find((item) => item.id === loan.employeeId);

                if (!employee) {
                  return null;
                }

                return (
                  <button
                    key={loan.id}
                    type="button"
                    onClick={() => loanSelection.select(loan.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{employee.name}</p>

                        <p className="mt-1 text-xs text-text-muted">
                          {LOAN_TYPE_CONFIG[loan.type].label}
                        </p>
                      </div>

                      <Badge variant={loan.overdueAmount > 0 ? "danger" : "warning"}>
                        {loan.overdueAmount > 0 ? "Overdue" : "Pending"}
                      </Badge>
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      {formatPKR(
                        loan.overdueAmount > 0
                          ? loan.overdueAmount
                          : loan.requestedAmount,
                      )}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No loan applications or repayments currently require attention.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{LOANS_COPY.tableTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">{LOANS_COPY.tableDescription}</p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={LOANS_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">{LOANS_COPY.allTypes}</option>

              {Object.entries(LOAN_TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{LOANS_COPY.allStatuses}</option>

              {Object.entries(LOAN_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visibleLoans.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Employee</TableHead>

                <TableHead>Loan type</TableHead>

                <TableHead>Requested</TableHead>

                <TableHead>Approved</TableHead>

                <TableHead>Paid</TableHead>

                <TableHead>Outstanding</TableHead>

                <TableHead>Next due</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleLoans.map((loan) => {
                const employee = EMPLOYEES.find((item) => item.id === loan.employeeId);

                if (!employee) {
                  return null;
                }

                const typeConfig = LOAN_TYPE_CONFIG[loan.type];

                const statusConfig = LOAN_STATUS_CONFIG[loan.status];

                return (
                  <TableRow
                    key={loan.id}
                    className="cursor-pointer transition hover:bg-canvas"
                    onClick={() => loanSelection.select(loan.id)}
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
                      <Badge variant={typeConfig.badgeVariant}>{typeConfig.label}</Badge>
                    </TableCell>

                    <TableCell>{formatPKR(loan.requestedAmount)}</TableCell>

                    <TableCell>{formatPKR(loan.approvedAmount)}</TableCell>

                    <TableCell>{formatPKR(loan.paidAmount)}</TableCell>

                    <TableCell>
                      <strong>{formatPKR(loan.outstandingBalance)}</strong>
                    </TableCell>

                    <TableCell>{formatDate(loan.nextDueDate)}</TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open loan for ${employee.name}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          loanSelection.select(loan.id);
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
            <HandCoins className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">{LOANS_COPY.emptyTitle}</h3>

            <p className="mt-2 text-sm text-text-muted">{LOANS_COPY.emptyDescription}</p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedLoan)}
        onClose={() => loanSelection.clear()}
        title="Employee loan"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedLoan ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedLoan.status === "pending_approval" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedLoan.id, "rejected")}
                  >
                    <X />
                    Reject
                  </Button>

                  <Button onClick={() => updateStatus(selectedLoan.id, "approved")}>
                    <Check />
                    Approve loan
                  </Button>
                </>
              )}

              {selectedLoan.status === "approved" && (
                <Button onClick={() => updateStatus(selectedLoan.id, "repaying")}>
                  <Send />
                  Disburse loan
                </Button>
              )}

              {selectedLoan.status === "repaying" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedLoan.id, "on_hold")}
                  >
                    <PauseCircle />
                    Hold repayment
                  </Button>

                  <Button onClick={() => recordInstallment(selectedLoan.id)}>
                    <Banknote />
                    Record installment
                  </Button>
                </>
              )}

              {selectedLoan.status === "on_hold" && (
                <Button onClick={() => updateStatus(selectedLoan.id, "repaying")}>
                  <Play />
                  Resume repayment
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedLoan && selectedEmployee && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">
                    {LOAN_TYPE_CONFIG[selectedLoan.type].label}
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Requested {formatDate(selectedLoan.requestDate)}
                  </p>
                </div>

                <Badge variant={LOAN_STATUS_CONFIG[selectedLoan.status].badgeVariant}>
                  {LOAN_STATUS_CONFIG[selectedLoan.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Requested amount",
                    value: formatPKR(selectedLoan.requestedAmount),
                  },
                  {
                    label: "Approved amount",
                    value: formatPKR(selectedLoan.approvedAmount),
                  },
                  {
                    label: "Installment",
                    value: formatPKR(selectedLoan.installmentAmount),
                  },
                  {
                    label: "Total installments",
                    value: selectedLoan.installmentCount,
                  },
                  {
                    label: "Repayment method",
                    value: (
                      <Badge
                        variant={
                          LOAN_REPAYMENT_METHOD_CONFIG[selectedLoan.repaymentMethod]
                            .badgeVariant
                        }
                      >
                        {LOAN_REPAYMENT_METHOD_CONFIG[selectedLoan.repaymentMethod].label}
                      </Badge>
                    ),
                  },
                  {
                    label: "Next repayment",
                    value: formatDate(selectedLoan.nextDueDate),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Repayment progress</h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-control bg-info-muted p-4">
                  <p className="text-xs text-info">Paid</p>

                  <p className="mt-1 font-bold text-info">
                    {formatPKR(selectedLoan.paidAmount)}
                  </p>
                </div>

                <div className="rounded-control bg-warning-muted p-4">
                  <p className="text-xs text-warning">Outstanding</p>

                  <p className="mt-1 font-bold text-warning">
                    {formatPKR(selectedLoan.outstandingBalance)}
                  </p>
                </div>

                <div className="rounded-control bg-danger-muted p-4">
                  <p className="text-xs text-danger">Overdue</p>

                  <p className="mt-1 font-bold text-danger">
                    {formatPKR(selectedLoan.overdueAmount)}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Loan purpose</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedLoan.purpose}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold">Review information</h3>

              <DetailGrid
                items={[
                  {
                    label: "Reviewed by",
                    value: selectedLoan.reviewedBy || "Not reviewed",
                  },
                  {
                    label: "Approved date",
                    value: selectedLoan.approvedAt
                      ? formatDate(selectedLoan.approvedAt)
                      : "Not approved",
                  },
                  {
                    label: "Disbursed date",
                    value: selectedLoan.disbursedAt
                      ? formatDate(selectedLoan.disbursedAt)
                      : "Not disbursed",
                  },
                  {
                    label: "Branch",
                    value: selectedEmployee.branchName,
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Internal note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedLoan.note || "No loan note has been added."}
              </p>
            </section>

            {selectedLoan.status === "completed" && (
              <div className="flex items-center gap-3 rounded-control bg-success-muted p-4 text-success">
                <ReceiptText className="size-5" />

                <p className="text-sm font-semibold">
                  This employee loan has been fully repaid.
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New loan request"
        description="Submit an employee loan or salary-advance request for approval."
      >
        <LoanApplicationForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onCreate={createLoan}
        />
      </Drawer>
    </div>
  );
}
