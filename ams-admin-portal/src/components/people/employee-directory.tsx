"use client";

import { getPeopleMetricToneStyle } from "@/config/people-metrics";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  CircleCheck,
  Clock3,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  Users,
} from "lucide-react";

import { BulkEmployeeImportDrawer } from "@/components/people/bulk-employee-import-drawer";
import { PeopleTabs } from "@/components/people/people-tabs";
import { useImportedEmployees } from "@/components/people/use-imported-employees";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
  Button,
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { PageHeader } from "@/components/shared/page-header";
import {
  EMPLOYEE_FILTERS,
  EMPLOYEE_STATUS_CONFIG,
} from "@/config/employees";
import { useBranchScope } from "@/context/branch-scope-context";
import { EMPLOYEES } from "@/data/employees";
import { formatDate } from "@/lib/date";

export function EmployeeDirectory() {
  const { selectedBranch } = useBranchScope();
  const importedEmployees =
    useImportedEmployees();

  const [searchQuery, setSearchQuery] =
    useState("");
  const [department, setDepartment] =
    useState("all");
  const [status, setStatus] =
    useState("all");
  const [
    bulkImportOpen,
    setBulkImportOpen,
  ] = useState(false);

  const allEmployees = useMemo(
    () => [
      ...importedEmployees,
      ...EMPLOYEES,
    ],
    [importedEmployees],
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          allEmployees.map(
            (employee) =>
              employee.department,
          ),
        ),
      ).sort(),
    [allEmployees],
  );

  const scopedEmployees = useMemo(() => {
    return allEmployees.filter(
      (employee) => {
        const matchesBranch =
          selectedBranch.isAggregate ||
          employee.branchId ===
            selectedBranch.id;

        const searchValue =
          `${employee.name} ${employee.email} ${employee.employeeCode} ${employee.designation}`.toLowerCase();

        const matchesSearch =
          searchValue.includes(
            searchQuery
              .toLowerCase()
              .trim(),
          );

        const matchesDepartment =
          department === "all" ||
          employee.department ===
            department;

        const matchesStatus =
          status === "all" ||
          employee.status === status;

        return (
          matchesBranch &&
          matchesSearch &&
          matchesDepartment &&
          matchesStatus
        );
      },
    );
  }, [
    allEmployees,
    department,
    searchQuery,
    selectedBranch,
    status,
  ]);

  const activeCount =
    scopedEmployees.filter(
      (employee) =>
        employee.status === "active",
    ).length;

  const leaveCount =
    scopedEmployees.filter(
      (employee) =>
        employee.status ===
        "on_leave",
    ).length;

  const probationCount =
    scopedEmployees.filter(
      (employee) =>
        employee.status ===
        "probation",
    ).length;

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow="People"
        title="Employee directory"
        description={`Manage employee records, employment details and access across ${selectedBranch.name.toLowerCase()}.`}
        actions={
          <>
            <Button variant="outline">
              <Download size={17} />
              Export
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setBulkImportOpen(true)
              }
            >
              <Upload size={17} />
              Add employees
            </Button>

            <Link
              href="/people/onboarding"
              className={buttonVariants()}
            >
              <Plus size={17} />
              Add employee
            </Link>
          </>
        }
      />

      <div className="mt-7">
        <PeopleTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total employees",
            value:
              scopedEmployees.length,
            icon: Users,
          },
          {
            label: "Active",
            value: activeCount,
            icon: CircleCheck,
          },
          {
            label: "On leave",
            value: leaveCount,
            icon: CalendarClock,
          },
          {
            label: "On probation",
            value: probationCount,
            icon: Clock3,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted">
                    {item.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    {item.value}
                  </p>
                </div>

                <span
                  className={`flex size-10 items-center justify-center rounded-control ${getPeopleMetricToneStyle(
                    item.label,
                  )}`}
                >
                  <Icon size={20} />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <Input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value,
                )
              }
              placeholder="Search by employee, email, ID or designation"
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-110">
            <Select
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  EMPLOYEE_FILTERS.allDepartments
                }
              </option>

              {departments.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  EMPLOYEE_FILTERS.allStatuses
                }
              </option>

              {Object.entries(
                EMPLOYEE_STATUS_CONFIG,
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

        {scopedEmployees.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-canvas">
                  <TableHead>
                    Employee
                  </TableHead>
                  <TableHead>
                    Employment
                  </TableHead>
                  <TableHead>
                    Branch
                  </TableHead>
                  <TableHead>
                    Status
                  </TableHead>
                  <TableHead>
                    Joined
                  </TableHead>
                  <TableHead className="w-16">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {scopedEmployees.map(
                  (employee) => {
                    const statusConfig =
                      EMPLOYEE_STATUS_CONFIG[
                        employee.status
                      ];

                    return (
                      <TableRow
                        key={employee.id}
                        className="transition hover:bg-canvas"
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
                              <p className="font-semibold text-text">
                                {
                                  employee.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-text-muted">
                                {
                                  employee.employeeCode
                                }{" "}
                                Ã‚Â·{" "}
                                {
                                  employee.email
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="font-medium">
                            {
                              employee.designation
                            }
                          </p>

                          <p className="mt-1 text-xs text-text-muted">
                            {
                              employee.department
                            }
                          </p>
                        </TableCell>

                        <TableCell>
                          {
                            employee.branchName
                          }
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
                          {formatDate(
                            employee.joinDate,
                          )}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${employee.name}`}
                          >
                            <MoreHorizontal
                              size={18}
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-text-muted">
                Showing{" "}
                {scopedEmployees.length}{" "}
                employees
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-info-muted text-info">
              <Users size={22} />
            </span>

            <h2 className="mt-4 text-base font-bold">
              No employees found
            </h2>

            <p className="mt-2 max-w-md text-sm text-text-muted">
              Change the filters or add a
              new employee to this branch.
            </p>
          </div>
        )}
      </Card>

      <BulkEmployeeImportDrawer
        open={bulkImportOpen}
        onClose={() =>
          setBulkImportOpen(false)
        }
        selectedBranchId={
          selectedBranch.isAggregate
            ? "all"
            : selectedBranch.id
        }
      />
    </div>
  );
}
