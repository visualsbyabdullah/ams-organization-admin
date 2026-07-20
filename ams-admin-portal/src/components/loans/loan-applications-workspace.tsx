"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileSearch,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { LoanApplicationForm } from "@/components/loans/loan-application-form";
import { LoanApplicationReview } from "@/components/loans/loan-application-review";
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
  LOAN_STATUS_CONFIG,
  LOAN_TYPE_CONFIG,
} from "@/config/loans";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { EMPLOYEE_LOANS } from "@/data/loans";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  EmployeeLoan,
} from "@/types/loan";

const APPLICATION_STATUSES = [
  "pending_approval",
  "approved",
  "rejected",
] as const;

export function LoanApplicationsWorkspace() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [loans, setLoans] =
    useState<EmployeeLoan[]>(
      EMPLOYEE_LOANS,
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    selectedLoanId,
    setSelectedLoanId,
  ] = useState<string | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const applicationLoans = useMemo(
    () =>
      loans.filter(
        (loan) =>
          APPLICATION_STATUSES.includes(
            loan.status as
              (typeof APPLICATION_STATUSES)[number],
          ) &&
          (selectedBranch.isAggregate ||
            loan.branchId ===
              selectedBranch.id),
      ),
    [loans, selectedBranch],
  );

  const visibleApplications =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return applicationLoans.filter(
        (loan) => {
          const employee =
            EMPLOYEES.find(
              (item) =>
                item.id ===
                loan.employeeId,
            );

          if (!employee) {
            return false;
          }

          const searchableValue = [
            employee.name,
            employee.employeeCode,
            employee.department,
            employee.designation,
            employee.branchName,
            loan.purpose,
            LOAN_TYPE_CONFIG[
              loan.type
            ].label,
          ]
            .join(" ")
            .toLowerCase();

          const matchesType =
            typeFilter === "all" ||
            loan.type === typeFilter;

          const matchesStatus =
            statusFilter === "all" ||
            loan.status ===
              statusFilter;

          return (
            searchableValue.includes(
              query,
            ) &&
            matchesType &&
            matchesStatus
          );
        },
      );
    }, [
      applicationLoans,
      searchQuery,
      statusFilter,
      typeFilter,
    ]);

  const selectedLoan =
    loans.find(
      (loan) =>
        loan.id === selectedLoanId,
    ) ?? null;

  const selectedEmployee =
    selectedLoan
      ? EMPLOYEES.find(
          (employee) =>
            employee.id ===
            selectedLoan.employeeId,
        )
      : null;

  const pendingApplications =
    applicationLoans.filter(
      (loan) =>
        loan.status ===
        "pending_approval",
    );

  const approvedApplications =
    applicationLoans.filter(
      (loan) =>
        loan.status === "approved",
    );

  const rejectedApplications =
    applicationLoans.filter(
      (loan) =>
        loan.status === "rejected",
    );

  const pendingAmount =
    pendingApplications.reduce(
      (total, loan) =>
        total +
        loan.requestedAmount,
      0,
    );

  const approvedAmount =
    approvedApplications.reduce(
      (total, loan) =>
        total +
        loan.approvedAmount,
      0,
    );

  const metrics = [
    {
      label: "Pending requests",
      value:
        pendingApplications.length,
      detail: selectedBranch.name,
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Pending amount",
      value: formatPKR(
        pendingAmount,
        true,
      ),
      detail:
        "Awaiting approval decision",
      icon: CircleDollarSign,
      tone: "info" as const,
    },
    {
      label: "Approved amount",
      value: formatPKR(
        approvedAmount,
        true,
      ),
      detail:
        "Ready for disbursement",
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Rejected requests",
      value:
        rejectedApplications.length,
      detail:
        "Application history",
      icon: XCircle,
      tone: "danger" as const,
    },
  ];

  function createLoan(
    loan: EmployeeLoan,
  ) {
    setLoans(
      (currentLoans) => [
        loan,
        ...currentLoans,
      ],
    );

    setCreateOpen(false);
    setSelectedLoanId(loan.id);
  }

  function approveLoan(
    loanId: string,
    values: {
      approvedAmount: number;
      installmentCount: number;
      repaymentStartDate: string;
      note: string;
    },
  ) {
    const actionDate = new Date()
      .toISOString()
      .slice(0, 10);

    setLoans(
      (currentLoans) =>
        currentLoans.map((loan) => {
          if (loan.id !== loanId) {
            return loan;
          }

          const installmentAmount =
            Math.ceil(
              values.approvedAmount /
                values.installmentCount,
            );

          return {
            ...loan,
            status: "approved",
            approvedAmount:
              values.approvedAmount,
            installmentCount:
              values.installmentCount,
            installmentAmount,
            paidAmount: 0,
            outstandingBalance:
              values.approvedAmount,
            repaymentStartDate:
              values.repaymentStartDate,
            nextDueDate:
              values.repaymentStartDate,
            approvedAt: actionDate,
            reviewedBy:
              CURRENT_ADMIN.name,
            note: values.note,
          };
        }),
    );
  }

  function rejectLoan(
    loanId: string,
    note: string,
  ) {
    setLoans(
      (currentLoans) =>
        currentLoans.map((loan) =>
          loan.id === loanId
            ? {
                ...loan,
                status: "rejected",
                approvedAmount: 0,
                outstandingBalance: 0,
                reviewedBy:
                  CURRENT_ADMIN.name,
                note:
                  note ||
                  "Application rejected during review.",
              }
            : loan,
        ),
    );
  }

  function reopenLoan(
    loanId: string,
  ) {
    setLoans(
      (currentLoans) =>
        currentLoans.map((loan) =>
          loan.id === loanId
            ? {
                ...loan,
                status:
                  "pending_approval",
                approvedAmount: 0,
                outstandingBalance: 0,
                approvedAt: undefined,
                reviewedBy: undefined,
              }
            : loan,
        ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow="Employee Finance"
        title="Loan applications"
        description="Review employee loan and salary-advance requests before approval and disbursement."
        actions={
          <>
            <Button variant="outline">
              <Download />
              Export applications
            </Button>

            <Button
              onClick={() =>
                setCreateOpen(true)
              }
            >
              <Plus />
              New loan request
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
        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <ShieldCheck size={19} />
            </span>

            <div>
              <h2 className="text-lg font-bold">
                Approval queue
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Oldest pending applications
                requiring review.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {pendingApplications.length >
            0 ? (
              [...pendingApplications]
                .sort((first, second) =>
                  first.requestDate.localeCompare(
                    second.requestDate,
                  ),
                )
                .map((loan) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        loan.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  return (
                    <button
                      key={loan.id}
                      type="button"
                      onClick={() =>
                        setSelectedLoanId(
                          loan.id,
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
                            {
                              LOAN_TYPE_CONFIG[
                                loan.type
                              ].label
                            }
                          </p>
                        </div>

                        <Badge variant="warning">
                          Pending
                        </Badge>
                      </div>

                      <p className="mt-3 text-base font-bold">
                        {formatPKR(
                          loan.requestedAmount,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        Requested{" "}
                        {formatDate(
                          loan.requestDate,
                        )}
                      </p>
                    </button>
                  );
                })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No loan applications are
                waiting for approval.
              </div>
            )}
          </div>
        </Card>

        <Card className="order-1">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">
              Application register
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Review loan requests within the
              selected organization scope.
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
                  placeholder="Search employee, ID, department, type or purpose"
                  className="pl-9"
                />
              </div>

              <Select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  All loan types
                </option>

                {Object.entries(
                  LOAN_TYPE_CONFIG,
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
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  All application statuses
                </option>

                <option value="pending_approval">
                  Pending approval
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </Select>
            </div>
          </div>

          {visibleApplications.length >
          0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-canvas">
                    <TableHead>
                      Employee
                    </TableHead>

                    <TableHead>
                      Loan type
                    </TableHead>

                    <TableHead>
                      Requested
                    </TableHead>

                    <TableHead>
                      Installments
                    </TableHead>

                    <TableHead>
                      Request date
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
                  {visibleApplications.map(
                    (loan) => {
                      const employee =
                        EMPLOYEES.find(
                          (item) =>
                            item.id ===
                            loan.employeeId,
                        );

                      if (!employee) {
                        return null;
                      }

                      return (
                        <TableRow
                          key={loan.id}
                          className="cursor-pointer transition hover:bg-canvas"
                          onClick={() =>
                            setSelectedLoanId(
                              loan.id,
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
                            <strong>
                              {formatPKR(
                                loan.requestedAmount,
                              )}
                            </strong>
                          </TableCell>

                          <TableCell>
                            {
                              loan.installmentCount
                            }
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              loan.requestDate,
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                LOAN_STATUS_CONFIG[
                                  loan.status
                                ].badgeVariant
                              }
                            >
                              {
                                LOAN_STATUS_CONFIG[
                                  loan.status
                                ].label
                              }
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Review loan application for ${employee.name}`}
                              onClick={(event) => {
                                event.stopPropagation();

                                setSelectedLoanId(
                                  loan.id,
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
                No loan applications found
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                Change the filters or submit a
                new employee loan request.
              </p>
            </div>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(
          selectedLoan &&
            selectedEmployee,
        )}
        onClose={() =>
          setSelectedLoanId(null)
        }
        title="Loan application review"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
      >
        {selectedLoan &&
          selectedEmployee && (
            <LoanApplicationReview
              key={`${selectedLoan.id}-${selectedLoan.status}`}
              loan={selectedLoan}
              employeeName={
                selectedEmployee.name
              }
              employeeCode={
                selectedEmployee.employeeCode
              }
              branchName={
                selectedEmployee.branchName
              }
              designation={
                selectedEmployee.designation
              }
              onApprove={approveLoan}
              onReject={rejectLoan}
              onReopen={reopenLoan}
            />
          )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        title="New loan request"
        description="Submit an employee loan or salary-advance request for approval."
      >
        <LoanApplicationForm
          selectedBranchId={
            selectedBranchId
          }
          onCancel={() =>
            setCreateOpen(false)
          }
          onCreate={createLoan}
        />
      </Drawer>
    </div>
  );
}
