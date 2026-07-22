"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarClock,
  Check,
  CircleDollarSign,
  Download,
  FilePenLine,
  History,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CompensationForm } from "@/components/payroll/compensation-form";
import { DepartmentCompensationChart } from "@/components/payroll/department-compensation-chart";
import { PayrollTabs } from "@/components/payroll/payroll-tabs";
import { DetailGrid, LineItemList } from "@/components/shared/detail-grid";
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
  COMPENSATION_CHANGE_REASON_CONFIG,
  COMPENSATION_COPY,
  COMPENSATION_REFERENCE_DATE,
  COMPENSATION_STATUS_CONFIG,
  PAY_FREQUENCY_CONFIG,
} from "@/config/compensation";
import { useBranchScope } from "@/context/branch-scope-context";
import { COMPENSATION_HISTORY, COMPENSATION_RECORDS } from "@/data/compensation";
import { EMPLOYEES } from "@/data/employees";
import { formatPKR } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type {
  CompensationHistory as CompensationHistoryType,
  CompensationRecord,
  DepartmentCompensationPoint,
} from "@/types/compensation";

type EditorMode = "create" | "edit" | null;

function getTotalFixedCompensation(record: CompensationRecord) {
  return (
    record.baseSalary +
    record.housingAllowance +
    record.transportAllowance +
    record.medicalAllowance +
    record.otherAllowance
  );
}

function getDaysUntil(date: string) {
  const referenceDate = new Date(`${COMPENSATION_REFERENCE_DATE}T00:00:00`);

  const targetDate = new Date(`${date}T00:00:00`);

  return Math.floor((targetDate.getTime() - referenceDate.getTime()) / 86400000);
}

export function CompensationWorkspace() {
  const { selectedBranch } = useBranchScope();

  const [records, setRecords] = useState<CompensationRecord[]>(COMPENSATION_RECORDS);

  const [history, setHistory] = useState<CompensationHistoryType[]>(COMPENSATION_HISTORY);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [frequencyFilter, setFrequencyFilter] = useState("all");

  const recordSelection = useEntitySelection(records, (record) => record.id);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const scopedRecords = useMemo(
    () =>
      records.filter(
        (record) => selectedBranch.isAggregate || record.branchId === selectedBranch.id,
      ),
    [records, selectedBranch],
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

      const matchesFrequency =
        frequencyFilter === "all" || record.payFrequency === frequencyFilter;

      return searchableValue.includes(query) && matchesStatus && matchesFrequency;
    });
  }, [frequencyFilter, scopedRecords, searchQuery, statusFilter]);

  const selectedRecord = recordSelection.selected;

  const selectedEmployee = selectedRecord
    ? EMPLOYEES.find((employee) => employee.id === selectedRecord.employeeId)
    : null;

  const selectedHistory = history
    .filter((item) => item.compensationId === selectedRecord?.id)
    .sort((first, second) => second.effectiveDate.localeCompare(first.effectiveDate));

  const upcomingReviews = scopedRecords
    .filter((record) => {
      const daysUntil = getDaysUntil(record.nextReviewDate);

      return record.status !== "archived" && daysUntil >= 0 && daysUntil <= 90;
    })
    .sort((first, second) => first.nextReviewDate.localeCompare(second.nextReviewDate));

  const totalBaseSalary = scopedRecords.reduce(
    (total, record) => total + record.baseSalary,
    0,
  );

  const totalFixedCompensation = scopedRecords.reduce(
    (total, record) => total + getTotalFixedCompensation(record),
    0,
  );

  const averageBaseSalary =
    scopedRecords.length > 0 ? Math.round(totalBaseSalary / scopedRecords.length) : 0;

  const totalAllowances = totalFixedCompensation - totalBaseSalary;

  const chartData = useMemo<DepartmentCompensationPoint[]>(() => {
    const grouped = new Map<
      string,
      {
        baseTotal: number;
        compensationTotal: number;
        count: number;
      }
    >();

    scopedRecords.forEach((record) => {
      const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

      if (!employee) {
        return;
      }

      const current = grouped.get(employee.department) ?? {
        baseTotal: 0,
        compensationTotal: 0,
        count: 0,
      };

      current.baseTotal += record.baseSalary;

      current.compensationTotal += getTotalFixedCompensation(record);

      current.count += 1;

      grouped.set(employee.department, current);
    });

    return Array.from(grouped.entries()).map(([department, values]) => ({
      department,
      averageBaseSalary: Math.round(values.baseTotal / values.count),
      averageTotalCompensation: Math.round(values.compensationTotal / values.count),
    }));
  }, [scopedRecords]);

  const metrics = [
    {
      label: "Active compensation",
      value: scopedRecords.filter((record) => record.status === "active").length,
      detail: selectedBranch.name,
      icon: Users,
      tone: "success" as const,
    },
    {
      label: "Average base salary",
      value: formatPKR(averageBaseSalary, true),
      detail: "Monthly employee average",
      icon: CircleDollarSign,
      tone: "info" as const,
    },
    {
      label: "Monthly allowances",
      value: formatPKR(totalAllowances, true),
      detail: "Recurring fixed allowances",
      icon: WalletCards,
      tone: "warning" as const,
    },
    {
      label: "Pending reviews",
      value: scopedRecords.filter((record) => record.status === "pending_review").length,
      detail: "Require compensation action",
      icon: CalendarClock,
      tone: "danger" as const,
    },
  ];

  function saveRecord(nextRecord: CompensationRecord) {
    const previousRecord = records.find((record) => record.id === nextRecord.id);

    setRecords((currentRecords) => {
      const exists = currentRecords.some((record) => record.id === nextRecord.id);

      return exists
        ? currentRecords.map((record) =>
            record.id === nextRecord.id ? nextRecord : record,
          )
        : [nextRecord, ...currentRecords];
    });

    if (previousRecord && previousRecord.baseSalary !== nextRecord.baseSalary) {
      setHistory((currentHistory) => [
        {
          id: crypto.randomUUID(),
          compensationId: nextRecord.id,
          employeeId: nextRecord.employeeId,
          previousBaseSalary: previousRecord.baseSalary,
          newBaseSalary: nextRecord.baseSalary,
          effectiveDate: nextRecord.effectiveDate,
          reason: nextRecord.lastChangeReason,
          approvedBy: nextRecord.updatedBy,
          note: nextRecord.note,
        },
        ...currentHistory,
      ]);
    }

    recordSelection.select(nextRecord.id);

    setEditorMode(null);
  }

  function approveRecord(recordId: string) {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: "active",
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: "Maaz",
            }
          : record,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={COMPENSATION_COPY.eyebrow}
        title={COMPENSATION_COPY.title}
        description={COMPENSATION_COPY.description}
        actions={
          <>
            <Button variant="outline">
              <Download />
              {COMPENSATION_COPY.exportAction}
            </Button>

            <Button
              onClick={() => {
                recordSelection.clear();
                setEditorMode("create");
              }}
            >
              <Plus />
              {COMPENSATION_COPY.addAction}
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={COMPENSATION_COPY.chartTitle}
          description={COMPENSATION_COPY.chartDescription}
        >
          {chartData.length > 0 ? (
            <DepartmentCompensationChart data={chartData} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-text-muted">
              No compensation data is available.
            </div>
          )}
        </ChartCard>

        <Card className="p-5">
          <h2 className="text-lg font-bold">{COMPENSATION_COPY.attentionTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {COMPENSATION_COPY.attentionDescription}
          </p>

          <div className="mt-5 space-y-3">
            {upcomingReviews.length > 0 ? (
              upcomingReviews.map((record) => {
                const employee = EMPLOYEES.find((item) => item.id === record.employeeId);

                if (!employee) {
                  return null;
                }

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
                        Review {formatDate(record.nextReviewDate)}
                      </p>
                    </div>

                    <Badge
                      variant={COMPENSATION_STATUS_CONFIG[record.status].badgeVariant}
                    >
                      {COMPENSATION_STATUS_CONFIG[record.status].label}
                    </Badge>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No compensation reviews are due within ninety days.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{COMPENSATION_COPY.tableTitle}</h2>

          <p className="mt-1 text-sm text-text-muted">
            {COMPENSATION_COPY.tableDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={COMPENSATION_COPY.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{COMPENSATION_COPY.allStatuses}</option>

              {Object.entries(COMPENSATION_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={frequencyFilter}
              onChange={(event) => setFrequencyFilter(event.target.value)}
            >
              <option value="all">{COMPENSATION_COPY.allFrequencies}</option>

              {Object.entries(PAY_FREQUENCY_CONFIG).map(([value, config]) => (
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

                <TableHead>Base salary</TableHead>

                <TableHead>Allowances</TableHead>

                <TableHead>Fixed compensation</TableHead>

                <TableHead>Bonus target</TableHead>

                <TableHead>Effective date</TableHead>

                <TableHead>Next review</TableHead>

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

                const totalFixed = getTotalFixedCompensation(record);

                const allowances = totalFixed - record.baseSalary;

                const statusConfig = COMPENSATION_STATUS_CONFIG[record.status];

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

                    <TableCell>{formatPKR(record.baseSalary)}</TableCell>

                    <TableCell>{formatPKR(allowances)}</TableCell>

                    <TableCell>
                      <strong>{formatPKR(totalFixed)}</strong>
                    </TableCell>

                    <TableCell>{record.bonusTargetPercentage}%</TableCell>

                    <TableCell>{formatDate(record.effectiveDate)}</TableCell>

                    <TableCell>{formatDate(record.nextReviewDate)}</TableCell>

                    <TableCell>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open compensation for ${employee.name}`}
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
            <Banknote className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">{COMPENSATION_COPY.emptyTitle}</h3>

            <p className="mt-2 text-sm text-text-muted">
              {COMPENSATION_COPY.emptyDescription}
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedRecord)}
        onClose={() => recordSelection.clear()}
        title="Employee compensation"
        description={
          selectedEmployee
            ? `${selectedEmployee.name} · ${selectedEmployee.employeeCode}`
            : undefined
        }
        footer={
          selectedRecord ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedRecord.status === "pending_review" && (
                <Button
                  variant="outline"
                  onClick={() => approveRecord(selectedRecord.id)}
                >
                  <Check />
                  Approve compensation
                </Button>
              )}

              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                Edit compensation
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedRecord && selectedEmployee && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedEmployee.name}</h3>

                  <p className="mt-1 text-xs text-text-muted">
                    {selectedEmployee.designation} · {selectedEmployee.branchName}
                  </p>
                </div>

                <Badge
                  variant={COMPENSATION_STATUS_CONFIG[selectedRecord.status].badgeVariant}
                >
                  {COMPENSATION_STATUS_CONFIG[selectedRecord.status].label}
                </Badge>
              </div>

              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Base salary",
                    value: formatPKR(selectedRecord.baseSalary),
                  },
                  {
                    label: "Fixed compensation",
                    value: (
                      <span className="font-bold text-success">
                        {formatPKR(getTotalFixedCompensation(selectedRecord))}
                      </span>
                    ),
                  },
                  {
                    label: "Pay frequency",
                    value: (
                      <Badge
                        variant={
                          PAY_FREQUENCY_CONFIG[selectedRecord.payFrequency].badgeVariant
                        }
                      >
                        {PAY_FREQUENCY_CONFIG[selectedRecord.payFrequency].label}
                      </Badge>
                    ),
                  },
                  {
                    label: "Bonus target",
                    value: `${selectedRecord.bonusTargetPercentage}%`,
                  },
                  {
                    label: "Effective date",
                    value: formatDate(selectedRecord.effectiveDate),
                  },
                  {
                    label: "Next review",
                    value: formatDate(selectedRecord.nextReviewDate),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Fixed allowances</h3>

              <LineItemList
                items={[
                  {
                    label: "Housing allowance",
                    value: formatPKR(selectedRecord.housingAllowance),
                  },
                  {
                    label: "Transport allowance",
                    value: formatPKR(selectedRecord.transportAllowance),
                  },
                  {
                    label: "Medical allowance",
                    value: formatPKR(selectedRecord.medicalAllowance),
                  },
                  {
                    label: "Other allowance",
                    value: formatPKR(selectedRecord.otherAllowance),
                  },
                ]}
              />
            </section>

            <section>
              <h3 className="text-sm font-bold">Latest change</h3>

              <div className="mt-3 rounded-control bg-canvas p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-5 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      {
                        COMPENSATION_CHANGE_REASON_CONFIG[selectedRecord.lastChangeReason]
                          .label
                      }
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Previous base salary: {formatPKR(selectedRecord.previousBaseSalary)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <History className="size-4 text-text-muted" />

                <h3 className="text-sm font-bold">Compensation history</h3>
              </div>

              <div className="mt-3 space-y-3">
                {selectedHistory.length > 0 ? (
                  selectedHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-control border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            {formatPKR(item.previousBaseSalary)} →{" "}
                            {formatPKR(item.newBaseSalary)}
                          </p>

                          <p className="mt-1 text-xs text-text-muted">
                            {COMPENSATION_CHANGE_REASON_CONFIG[item.reason].label} ·{" "}
                            {formatDate(item.effectiveDate)}
                          </p>
                        </div>

                        <Badge variant="neutral">{item.approvedBy}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-control bg-canvas p-4 text-sm text-text-muted">
                    No previous compensation changes are available.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">Compensation note</h3>

              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedRecord.note || "No compensation note has been added."}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create"
            ? "Add employee compensation"
            : "Edit employee compensation"
        }
        description="Configure employee salary, allowances, review dates and compensation status."
        className="max-w-5xl"
      >
        {editorMode && (
          <CompensationForm
            key={editorMode === "create" ? "new-compensation" : selectedRecord?.id}
            record={editorMode === "edit" ? (selectedRecord ?? undefined) : undefined}
            selectedBranchId={selectedBranch.isAggregate ? "all" : selectedBranch.id}
            assignedEmployeeIds={records.map((record) => record.employeeId)}
            onCancel={() => setEditorMode(null)}
            onSave={saveRecord}
          />
        )}
      </Drawer>
    </div>
  );
}
