"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  BadgeCheck,
  Banknote,
  Check,
  CircleAlert,
  Clock3,
  Download,
  FileCheck2,
  FilePenLine,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PayrollTabs } from "@/components/payroll/payroll-tabs";
import { StatutoryContributionChart } from "@/components/payroll/statutory-contribution-chart";
import { StatutoryFilingForm } from "@/components/payroll/statutory-filing-form";
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
  PAYROLL_STATUTORY_COPY,
  STATUTORY_EMPLOYEE_STATUS_CONFIG,
  STATUTORY_FILING_CATEGORY_CONFIG,
  STATUTORY_FILING_STATUS_CONFIG,
  STATUTORY_PERIOD_OPTIONS,
  STATUTORY_REFERENCE_DATE,
  STATUTORY_REFERENCE_PERIOD,
} from "@/config/payroll-statutory";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import {
  EMPLOYEE_STATUTORY_RECORDS,
  STATUTORY_FILINGS,
} from "@/data/payroll-statutory";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  EmployeeStatutoryRecord,
  StatutoryContributionPoint,
  StatutoryFiling,
  StatutoryFilingStatus,
} from "@/types/payroll-statutory";

type FilingEditorMode =
  | "create"
  | "edit"
  | null;

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

function getEmployeeContribution(
  record: EmployeeStatutoryRecord,
) {
  return (
    record.incomeTax +
    record.employeeSocialSecurity +
    record.employeeRetirement +
    record.otherEmployeeDeductions
  );
}

function getEmployerContribution(
  record: EmployeeStatutoryRecord,
) {
  return (
    record.employerSocialSecurity +
    record.employerRetirement +
    record.otherEmployerContributions
  );
}

export function PayrollStatutoryWorkspace() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [
    employeeRecords,
    setEmployeeRecords,
  ] = useState<
    EmployeeStatutoryRecord[]
  >(EMPLOYEE_STATUTORY_RECORDS);

  const [filings, setFilings] =
    useState<StatutoryFiling[]>(
      STATUTORY_FILINGS,
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    employeeStatusFilter,
    setEmployeeStatusFilter,
  ] = useState("all");

  const [
    filingStatusFilter,
    setFilingStatusFilter,
  ] = useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [periodFilter, setPeriodFilter] =
    useState("all");

  const [
    selectedEmployeeRecordId,
    setSelectedEmployeeRecordId,
  ] = useState<string | null>(null);

  const [
    selectedFilingId,
    setSelectedFilingId,
  ] = useState<string | null>(null);

  const [
    filingEditorMode,
    setFilingEditorMode,
  ] = useState<FilingEditorMode>(null);

  const scopedEmployeeRecords =
    useMemo(
      () =>
        employeeRecords.filter(
          (record) =>
            record.period ===
              STATUTORY_REFERENCE_PERIOD &&
            (selectedBranch.isAggregate ||
              record.branchId ===
                selectedBranch.id),
        ),
      [
        employeeRecords,
        selectedBranch,
      ],
    );

  const visibleEmployeeRecords =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return scopedEmployeeRecords.filter(
        (record) => {
          const employee =
            EMPLOYEES.find(
              (item) =>
                item.id ===
                record.employeeId,
            );

          if (!employee) {
            return false;
          }

          const searchableValue = [
            employee.name,
            employee.employeeCode,
            employee.department,
            employee.designation,
            record.registrationNumber,
          ]
            .join(" ")
            .toLowerCase();

          const matchesStatus =
            employeeStatusFilter ===
              "all" ||
            record.status ===
              employeeStatusFilter;

          return (
            searchableValue.includes(
              query,
            ) && matchesStatus
          );
        },
      );
    }, [
      employeeStatusFilter,
      scopedEmployeeRecords,
      searchQuery,
    ]);

  const scopedFilings =
    useMemo(
      () =>
        filings.filter(
          (filing) =>
            selectedBranch.isAggregate ||
            filing.branchId ===
              selectedBranch.id,
        ),
      [filings, selectedBranch],
    );

  const visibleFilings =
    useMemo(
      () =>
        scopedFilings.filter(
          (filing) => {
            const matchesStatus =
              filingStatusFilter ===
                "all" ||
              filing.status ===
                filingStatusFilter;

            const matchesCategory =
              categoryFilter === "all" ||
              filing.category ===
                categoryFilter;

            const matchesPeriod =
              periodFilter === "all" ||
              filing.period ===
                periodFilter;

            return (
              matchesStatus &&
              matchesCategory &&
              matchesPeriod
            );
          },
        ),
      [
        categoryFilter,
        filingStatusFilter,
        periodFilter,
        scopedFilings,
      ],
    );

  const selectedEmployeeRecord =
    employeeRecords.find(
      (record) =>
        record.id ===
        selectedEmployeeRecordId,
    ) ?? null;

  const selectedEmployee =
    selectedEmployeeRecord
      ? EMPLOYEES.find(
          (employee) =>
            employee.id ===
            selectedEmployeeRecord.employeeId,
        )
      : null;

  const selectedFiling =
    filings.find(
      (filing) =>
        filing.id ===
        selectedFilingId,
    ) ?? null;

  const employeeDeductions =
    scopedEmployeeRecords.reduce(
      (total, record) =>
        total +
        getEmployeeContribution(
          record,
        ),
      0,
    );

  const employerContributions =
    scopedEmployeeRecords.reduce(
      (total, record) =>
        total +
        getEmployerContribution(
          record,
        ),
      0,
    );

  const pendingFilings =
    scopedFilings.filter(
      (filing) =>
        [
          "draft",
          "ready",
          "submitted",
        ].includes(filing.status),
    );

  const overdueFilings =
    scopedFilings.filter(
      (filing) =>
        filing.status === "overdue" ||
        (filing.status !== "accepted" &&
          filing.dueDate <
            STATUTORY_REFERENCE_DATE),
    );

  const chartData =
    useMemo<
      StatutoryContributionPoint[]
    >(() => {
      const grouped =
        new Map<
          string,
          {
            employeeContribution: number;
            employerContribution: number;
          }
        >();

      scopedEmployeeRecords.forEach(
        (record) => {
          const employee =
            EMPLOYEES.find(
              (item) =>
                item.id ===
                record.employeeId,
            );

          if (!employee) {
            return;
          }

          const current =
            grouped.get(
              employee.branchName,
            ) ?? {
              employeeContribution: 0,
              employerContribution: 0,
            };

          current.employeeContribution +=
            getEmployeeContribution(
              record,
            );

          current.employerContribution +=
            getEmployerContribution(
              record,
            );

          grouped.set(
            employee.branchName,
            current,
          );
        },
      );

      return Array.from(
        grouped.entries(),
      ).map(
        ([branchName, values]) => ({
          branch:
            branchName.replace(
              " Branch",
              "",
            ),
          ...values,
        }),
      );
    }, [scopedEmployeeRecords]);

  const metrics = [
    {
      label: "Employee deductions",
      value: formatPKR(
        employeeDeductions,
        true,
      ),
      detail: "July 2026 payroll",
      icon: Banknote,
      tone: "info" as const,
    },
    {
      label: "Employer contributions",
      value: formatPKR(
        employerContributions,
        true,
      ),
      detail: selectedBranch.name,
      icon: ShieldCheck,
      tone: "success" as const,
    },
    {
      label: "Pending filings",
      value: pendingFilings.length,
      detail:
        "Not yet formally accepted",
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Overdue items",
      value: overdueFilings.length,
      detail:
        "Require immediate action",
      icon: CircleAlert,
      tone: "danger" as const,
    },
  ];

  function saveFiling(
    nextFiling: StatutoryFiling,
  ) {
    setFilings(
      (currentFilings) => {
        const exists =
          currentFilings.some(
            (filing) =>
              filing.id ===
              nextFiling.id,
          );

        return exists
          ? currentFilings.map(
              (filing) =>
                filing.id ===
                nextFiling.id
                  ? nextFiling
                  : filing,
            )
          : [
              nextFiling,
              ...currentFilings,
            ];
      },
    );

    setSelectedFilingId(
      nextFiling.id,
    );

    setFilingEditorMode(null);
  }

  function updateFilingStatus(
    filingId: string,
    status: StatutoryFilingStatus,
  ) {
    const actionDate = new Date()
      .toISOString()
      .slice(0, 10);

    setFilings(
      (currentFilings) =>
        currentFilings.map(
          (filing) =>
            filing.id === filingId
              ? {
                  ...filing,
                  status,
                  submittedAt:
                    status === "submitted"
                      ? actionDate
                      : filing.submittedAt,
                  acceptedAt:
                    status === "accepted"
                      ? actionDate
                      : filing.acceptedAt,
                  referenceNumber:
                    status === "submitted" &&
                    !filing.referenceNumber
                      ? `SUB-${filing.branchId.toUpperCase()}-${filing.period.replace("-", "")}`
                      : filing.referenceNumber,
                }
              : filing,
        ),
    );
  }

  function markEmployeeCompliant(
    recordId: string,
  ) {
    setEmployeeRecords(
      (currentRecords) =>
        currentRecords.map(
          (record) =>
            record.id === recordId
              ? {
                  ...record,
                  status: "compliant",
                  note:
                    record.note ||
                    `Reviewed by ${CURRENT_ADMIN.name}.`,
                }
              : record,
        ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          PAYROLL_STATUTORY_COPY.eyebrow
        }
        title={
          PAYROLL_STATUTORY_COPY.title
        }
        description={
          PAYROLL_STATUTORY_COPY.description
        }
        actions={
          <>
            <Button variant="outline">
              <Download />
              {
                PAYROLL_STATUTORY_COPY.exportAction
              }
            </Button>

            <Button
              onClick={() => {
                setSelectedFilingId(null);
                setFilingEditorMode(
                  "create",
                );
              }}
            >
              <Plus />
              {
                PAYROLL_STATUTORY_COPY.createAction
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={
            PAYROLL_STATUTORY_COPY.chartTitle
          }
          description={
            PAYROLL_STATUTORY_COPY.chartDescription
          }
        >
          {chartData.length > 0 ? (
            <StatutoryContributionChart
              data={chartData}
            />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-text-muted">
              No contribution data is
              available.
            </div>
          )}
        </ChartCard>

        <Card className="p-5">
          <h2 className="text-lg font-bold">
            {
              PAYROLL_STATUTORY_COPY.deadlinesTitle
            }
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              PAYROLL_STATUTORY_COPY.deadlinesDescription
            }
          </p>

          <div className="mt-5 space-y-3">
            {scopedFilings
              .filter(
                (filing) =>
                  filing.status !==
                  "accepted",
              )
              .sort((first, second) =>
                first.dueDate.localeCompare(
                  second.dueDate,
                ),
              )
              .slice(0, 5)
              .map((filing) => (
                <button
                  key={filing.id}
                  type="button"
                  onClick={() =>
                    setSelectedFilingId(
                      filing.id,
                    )
                  }
                  className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {
                          STATUTORY_FILING_CATEGORY_CONFIG[
                            filing.category
                          ].label
                        }
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {filing.branchName}
                      </p>
                    </div>

                    <Badge
                      variant={
                        STATUTORY_FILING_STATUS_CONFIG[
                          filing.status
                        ].badgeVariant
                      }
                    >
                      {
                        STATUTORY_FILING_STATUS_CONFIG[
                          filing.status
                        ].label
                      }
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-text-muted">
                      Due{" "}
                      {formatDate(
                        filing.dueDate,
                      )}
                    </span>

                    <strong className="text-sm">
                      {formatPKR(
                        filing.amount,
                        true,
                      )}
                    </strong>
                  </div>
                </button>
              ))}
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {
              PAYROLL_STATUTORY_COPY.employeeTitle
            }
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              PAYROLL_STATUTORY_COPY.employeeDescription
            }
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]">
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
                  PAYROLL_STATUTORY_COPY.searchPlaceholder
                }
                className="pl-9"
              />
            </div>

            <Select
              value={
                employeeStatusFilter
              }
              onChange={(event) =>
                setEmployeeStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  PAYROLL_STATUTORY_COPY.allEmployeeStatuses
                }
              </option>

              {Object.entries(
                STATUTORY_EMPLOYEE_STATUS_CONFIG,
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

        {visibleEmployeeRecords.length >
        0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>
                  Employee
                </TableHead>

                <TableHead>
                  Taxable income
                </TableHead>

                <TableHead>
                  Income tax
                </TableHead>

                <TableHead>
                  Employee contribution
                </TableHead>

                <TableHead>
                  Employer contribution
                </TableHead>

                <TableHead>
                  Registration
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
              {visibleEmployeeRecords.map(
                (record) => {
                  const employee =
                    EMPLOYEES.find(
                      (item) =>
                        item.id ===
                        record.employeeId,
                    );

                  if (!employee) {
                    return null;
                  }

                  const statusConfig =
                    STATUTORY_EMPLOYEE_STATUS_CONFIG[
                      record.status
                    ];

                  return (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer transition hover:bg-canvas"
                      onClick={() =>
                        setSelectedEmployeeRecordId(
                          record.id,
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
                        {formatPKR(
                          record.taxableIncome,
                        )}
                      </TableCell>

                      <TableCell>
                        {formatPKR(
                          record.incomeTax,
                        )}
                      </TableCell>

                      <TableCell>
                        {formatPKR(
                          getEmployeeContribution(
                            record,
                          ),
                        )}
                      </TableCell>

                      <TableCell>
                        {formatPKR(
                          getEmployerContribution(
                            record,
                          ),
                        )}
                      </TableCell>

                      <TableCell>
                        {record.registrationNumber ||
                          "Missing"}
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
                          aria-label={`Open statutory record for ${employee.name}`}
                          onClick={(event) => {
                            event.stopPropagation();

                            setSelectedEmployeeRecordId(
                              record.id,
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
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <Users className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">
              No employee records found
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              Change the branch, search or status
              filter.
            </p>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {
              PAYROLL_STATUTORY_COPY.filingsTitle
            }
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              PAYROLL_STATUTORY_COPY.filingsDescription
            }
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Select
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(
                  event.target.value,
                )
              }
            >
              {STATUTORY_PERIOD_OPTIONS.map(
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
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  PAYROLL_STATUTORY_COPY.allCategories
                }
              </option>

              {Object.entries(
                STATUTORY_FILING_CATEGORY_CONFIG,
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
              value={
                filingStatusFilter
              }
              onChange={(event) =>
                setFilingStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  PAYROLL_STATUTORY_COPY.allFilingStatuses
                }
              </option>

              {Object.entries(
                STATUTORY_FILING_STATUS_CONFIG,
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

        <Table>
          <TableHeader>
            <TableRow className="bg-canvas">
              <TableHead>
                Period
              </TableHead>

              <TableHead>
                Branch
              </TableHead>

              <TableHead>
                Category
              </TableHead>

              <TableHead>
                Amount
              </TableHead>

              <TableHead>
                Due date
              </TableHead>

              <TableHead>
                Reference
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
            {visibleFilings.map(
              (filing) => (
                <TableRow
                  key={filing.id}
                  className="cursor-pointer transition hover:bg-canvas"
                  onClick={() =>
                    setSelectedFilingId(
                      filing.id,
                    )
                  }
                >
                  <TableCell>
                    {formatPeriod(
                      filing.period,
                    )}
                  </TableCell>

                  <TableCell>
                    {filing.branchName}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        STATUTORY_FILING_CATEGORY_CONFIG[
                          filing.category
                        ].badgeVariant
                      }
                    >
                      {
                        STATUTORY_FILING_CATEGORY_CONFIG[
                          filing.category
                        ].label
                      }
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {formatPKR(
                      filing.amount,
                    )}
                  </TableCell>

                  <TableCell>
                    {formatDate(
                      filing.dueDate,
                    )}
                  </TableCell>

                  <TableCell>
                    {filing.referenceNumber ||
                      "Not assigned"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        STATUTORY_FILING_STATUS_CONFIG[
                          filing.status
                        ].badgeVariant
                      }
                    >
                      {
                        STATUTORY_FILING_STATUS_CONFIG[
                          filing.status
                        ].label
                      }
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Open statutory filing for ${filing.branchName}`}
                      onClick={(event) => {
                        event.stopPropagation();

                        setSelectedFilingId(
                          filing.id,
                        );
                      }}
                    >
                      <MoreHorizontal />
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </Card>

      <Drawer
        open={Boolean(
          selectedEmployeeRecord,
        )}
        onClose={() =>
          setSelectedEmployeeRecordId(
            null,
          )
        }
        title="Employee statutory record"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedEmployeeRecord &&
          [
            "pending_review",
            "blocked",
          ].includes(
            selectedEmployeeRecord.status,
          ) ? (
            <Button
              onClick={() =>
                markEmployeeCompliant(
                  selectedEmployeeRecord.id,
                )
              }
            >
              <BadgeCheck />
              Mark compliant
            </Button>
          ) : undefined
        }
      >
        {selectedEmployeeRecord &&
          selectedEmployee && (
            <div className="space-y-6">
              <section className="rounded-card border border-border">
                <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                  <div>
                    <h3 className="font-bold">
                      {selectedEmployee.name}
                    </h3>

                    <p className="mt-1 text-xs text-text-muted">
                      {
                        selectedEmployee.designation
                      }{" "}
                      ·{" "}
                      {
                        selectedEmployee.branchName
                      }
                    </p>
                  </div>

                  <Badge
                    variant={
                      STATUTORY_EMPLOYEE_STATUS_CONFIG[
                        selectedEmployeeRecord.status
                      ].badgeVariant
                    }
                  >
                    {
                      STATUTORY_EMPLOYEE_STATUS_CONFIG[
                        selectedEmployeeRecord.status
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
                        selectedEmployeeRecord.period,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Registration number
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {selectedEmployeeRecord.registrationNumber ||
                        "Not registered"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Taxable income
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {formatPKR(
                        selectedEmployeeRecord.taxableIncome,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-text-muted">
                      Income tax
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {formatPKR(
                        selectedEmployeeRecord.incomeTax,
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Employee deductions
                </h3>

                <dl className="mt-3 space-y-3">
                  {[
                    {
                      label: "Income tax",
                      value:
                        selectedEmployeeRecord.incomeTax,
                    },
                    {
                      label:
                        "Social security",
                      value:
                        selectedEmployeeRecord.employeeSocialSecurity,
                    },
                    {
                      label:
                        "Retirement contribution",
                      value:
                        selectedEmployeeRecord.employeeRetirement,
                    },
                    {
                      label:
                        "Other deductions",
                      value:
                        selectedEmployeeRecord.otherEmployeeDeductions,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-control bg-canvas px-4 py-3"
                    >
                      <dt className="text-sm text-text-muted">
                        {item.label}
                      </dt>

                      <dd className="text-sm font-semibold">
                        {formatPKR(
                          item.value,
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Employer contributions
                </h3>

                <dl className="mt-3 space-y-3">
                  {[
                    {
                      label:
                        "Social security",
                      value:
                        selectedEmployeeRecord.employerSocialSecurity,
                    },
                    {
                      label:
                        "Retirement contribution",
                      value:
                        selectedEmployeeRecord.employerRetirement,
                    },
                    {
                      label:
                        "Other contributions",
                      value:
                        selectedEmployeeRecord.otherEmployerContributions,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-control bg-canvas px-4 py-3"
                    >
                      <dt className="text-sm text-text-muted">
                        {item.label}
                      </dt>

                      <dd className="text-sm font-semibold">
                        {formatPKR(
                          item.value,
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-bold">
                  Review note
                </h3>

                <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                  {selectedEmployeeRecord.note ||
                    "No review note has been added."}
                </p>
              </section>
            </div>
          )}
      </Drawer>

      <Drawer
        open={Boolean(
          selectedFiling,
        )}
        onClose={() =>
          setSelectedFilingId(null)
        }
        title="Statutory filing"
        description={
          selectedFiling
            ? `${selectedFiling.branchName} · ${formatPeriod(selectedFiling.period)}`
            : undefined
        }
        footer={
          selectedFiling ? (
            <div className="flex flex-wrap justify-end gap-3">
              {[
                "draft",
                "overdue",
              ].includes(
                selectedFiling.status,
              ) && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilingEditorMode(
                      "edit",
                    )
                  }
                >
                  <FilePenLine />
                  Edit filing
                </Button>
              )}

              {selectedFiling.status ===
                "draft" && (
                <Button
                  onClick={() =>
                    updateFilingStatus(
                      selectedFiling.id,
                      "ready",
                    )
                  }
                >
                  <FileCheck2 />
                  Mark ready
                </Button>
              )}

              {[
                "ready",
                "overdue",
              ].includes(
                selectedFiling.status,
              ) && (
                <Button
                  onClick={() =>
                    updateFilingStatus(
                      selectedFiling.id,
                      "submitted",
                    )
                  }
                >
                  <Send />
                  Mark submitted
                </Button>
              )}

              {selectedFiling.status ===
                "submitted" && (
                <Button
                  onClick={() =>
                    updateFilingStatus(
                      selectedFiling.id,
                      "accepted",
                    )
                  }
                >
                  <Check />
                  Mark accepted
                </Button>
              )}

              {selectedFiling.status ===
                "accepted" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateFilingStatus(
                      selectedFiling.id,
                      "draft",
                    )
                  }
                >
                  <RotateCcw />
                  Reopen filing
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedFiling && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">
                    {
                      STATUTORY_FILING_CATEGORY_CONFIG[
                        selectedFiling.category
                      ].label
                    }
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Created by{" "}
                    {
                      selectedFiling.createdBy
                    }{" "}
                    on{" "}
                    {formatDate(
                      selectedFiling.createdAt,
                    )}
                  </p>
                </div>

                <Badge
                  variant={
                    STATUTORY_FILING_STATUS_CONFIG[
                      selectedFiling.status
                    ].badgeVariant
                  }
                >
                  {
                    STATUTORY_FILING_STATUS_CONFIG[
                      selectedFiling.status
                    ].label
                  }
                </Badge>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">
                    Filing amount
                  </dt>

                  <dd className="mt-1 text-lg font-bold">
                    {formatPKR(
                      selectedFiling.amount,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Due date
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(
                      selectedFiling.dueDate,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Branch
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {
                      selectedFiling.branchName
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Payroll period
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {formatPeriod(
                      selectedFiling.period,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Submitted date
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedFiling.submittedAt
                      ? formatDate(
                          selectedFiling.submittedAt,
                        )
                      : "Not submitted"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-text-muted">
                    Reference number
                  </dt>

                  <dd className="mt-1 text-sm font-semibold">
                    {selectedFiling.referenceNumber ||
                      "Not assigned"}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">
                Filing note
              </h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedFiling.note ||
                  "No filing note has been added."}
              </p>
            </section>

            {selectedFiling.acceptedAt && (
              <div className="flex items-center gap-3 rounded-control bg-success-muted p-4 text-success">
                <BadgeCheck className="size-5" />

                <p className="text-sm font-semibold">
                  Accepted on{" "}
                  {formatDate(
                    selectedFiling.acceptedAt,
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={
          filingEditorMode !== null
        }
        onClose={() =>
          setFilingEditorMode(null)
        }
        title={
          filingEditorMode === "create"
            ? "Add statutory filing"
            : "Edit statutory filing"
        }
        description="Configure branch filing amount, period, due date and submission status."
      >
        {filingEditorMode && (
          <StatutoryFilingForm
            key={
              filingEditorMode ===
              "create"
                ? "new-statutory-filing"
                : selectedFiling?.id
            }
            filing={
              filingEditorMode ===
              "edit"
                ? selectedFiling ??
                  undefined
                : undefined
            }
            selectedBranchId={
              selectedBranchId
            }
            onCancel={() =>
              setFilingEditorMode(null)
            }
            onSave={saveFiling}
          />
        )}
      </Drawer>
    </div>
  );
}
