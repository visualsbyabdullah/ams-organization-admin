"use client";

import { getPeopleMetricToneStyle } from "@/config/people-metrics";

import { useMemo, useState } from "react";
import {
  Building2,
  MoreHorizontal,
  Network,
  Plus,
  Search,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

import { PeopleTabs } from "@/components/people/people-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEPARTMENT_STATUS_CONFIG,
  DESIGNATION_LEVEL_CONFIG,
  ORGANIZATION_STRUCTURE_COPY,
} from "@/config/organization-structure";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { EMPLOYEES } from "@/data/employees";
import {
  BRANCH_STRUCTURE_SUMMARIES,
  DEPARTMENTS,
  DESIGNATIONS,
  UNASSIGNED_EMPLOYEE_COUNTS,
} from "@/data/organization-structure";

function getDepartmentEmployeeCount(
  branchId: string,
  branchCounts: Record<string, number>,
) {
  if (branchId === "all") {
    return Object.values(branchCounts).reduce((total, count) => total + count, 0);
  }

  return branchCounts[branchId] ?? 0;
}

export function OrganizationStructure() {
  const { selectedBranch } = useBranchScope();

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [designationSearch, setDesignationSearch] = useState("");

  const visibleDepartments = useMemo(() => {
    const query = departmentSearch.trim().toLowerCase();

    return DEPARTMENTS.filter((department) => {
      const employeeCount = getDepartmentEmployeeCount(
        selectedBranch.id,
        department.branchCounts,
      );

      const isAvailableInScope = selectedBranch.isAggregate || employeeCount > 0;

      const matchesSearch =
        department.name.toLowerCase().includes(query) ||
        department.code.toLowerCase().includes(query);

      return isAvailableInScope && matchesSearch;
    });
  }, [departmentSearch, selectedBranch]);

  const visibleDesignations = useMemo(() => {
    const query = designationSearch.trim().toLowerCase();

    const departmentIds = new Set(visibleDepartments.map((department) => department.id));

    return DESIGNATIONS.filter(
      (designation) =>
        departmentIds.has(designation.departmentId) &&
        designation.title.toLowerCase().includes(query),
    );
  }, [designationSearch, visibleDepartments]);

  const scopedEmployeeCount = selectedBranch.isAggregate
    ? BRANCH_STRUCTURE_SUMMARIES.reduce(
        (total, branch) => total + branch.employeeCount,
        0,
      )
    : (BRANCH_STRUCTURE_SUMMARIES.find((branch) => branch.branchId === selectedBranch.id)
        ?.employeeCount ?? 0);

  const scopedManagerCount = selectedBranch.isAggregate
    ? BRANCH_STRUCTURE_SUMMARIES.reduce((total, branch) => total + branch.managerCount, 0)
    : (BRANCH_STRUCTURE_SUMMARIES.find((branch) => branch.branchId === selectedBranch.id)
        ?.managerCount ?? 0);

  const visibleBranchSummaries = BRANCH_STRUCTURE_SUMMARIES.filter(
    (summary) => selectedBranch.isAggregate || summary.branchId === selectedBranch.id,
  );

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={ORGANIZATION_STRUCTURE_COPY.eyebrow}
        title={ORGANIZATION_STRUCTURE_COPY.title}
        description={ORGANIZATION_STRUCTURE_COPY.description}
        actions={
          <>
            <Button variant="outline">
              <Plus />
              {ORGANIZATION_STRUCTURE_COPY.addDesignation}
            </Button>

            <Button>
              <Plus />
              {ORGANIZATION_STRUCTURE_COPY.addDepartment}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <PeopleTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Departments",
            value: visibleDepartments.length,
            icon: Building2,
          },
          {
            label: "Designations",
            value: visibleDesignations.length,
            icon: Network,
          },
          {
            label: "Employees assigned",
            value: scopedEmployeeCount,
            icon: Users,
          },
          {
            label: "Reporting managers",
            value: scopedManagerCount,
            icon: UserRoundCog,
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted">{metric.label}</p>

                  <p className="mt-3 text-3xl font-bold tracking-tight">{metric.value}</p>
                </div>

                <span
                  className={`flex size-10 items-center justify-center rounded-control ${getPeopleMetricToneStyle(metric.label)}`}
                >
                  <Icon size={19} />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="p-6">
          <div>
            <h2 className="text-lg font-bold">Branch structure</h2>

            <p className="mt-1 text-sm text-text-muted">
              Workforce distribution across the current organization scope.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {visibleBranchSummaries.map((summary) => {
              const branch = BRANCH_OPTIONS.find((item) => item.id === summary.branchId);

              return (
                <div
                  key={summary.branchId}
                  className="rounded-card border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{branch?.name}</p>

                      <p className="mt-1 text-xs text-text-muted">
                        {summary.departmentCount} departments Ã‚Â· {summary.managerCount}{" "}
                        managers
                      </p>
                    </div>

                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {summary.employeeCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-control bg-warning-muted px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-warning">Unassigned employees</p>

              <p className="mt-1 text-xs text-text-muted">
                Employees without a department.
              </p>
            </div>

            <strong className="text-lg text-warning">
              {UNASSIGNED_EMPLOYEE_COUNTS[selectedBranch.id] ?? 0}
            </strong>
          </div>
        </Card>

        <Card>
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <Input
                value={departmentSearch}
                onChange={(event) => setDepartmentSearch(event.target.value)}
                placeholder={ORGANIZATION_STRUCTURE_COPY.departmentSearch}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-canvas">
                <TableHead>Department</TableHead>
                <TableHead>Department head</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleDepartments.map((department) => {
                const head = EMPLOYEES.find(
                  (employee) => employee.id === department.headEmployeeId,
                );

                const statusConfig = DEPARTMENT_STATUS_CONFIG[department.status];

                return (
                  <TableRow key={department.id} className="transition hover:bg-canvas">
                    <TableCell>
                      <div>
                        <p className="font-semibold">{department.name}</p>

                        <p className="mt-1 text-xs text-text-muted">
                          {department.code} Ã‚Â· {department.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {head?.name ?? (
                        <span className="text-text-muted">Not assigned</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {getDepartmentEmployeeCount(
                        selectedBranch.id,
                        department.branchCounts,
                      )}
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
                        aria-label={`Actions for ${department.name}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold">Designations</h2>

            <p className="mt-1 text-sm text-text-muted">
              Job titles and levels available to employees.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <Input
              value={designationSearch}
              onChange={(event) => setDesignationSearch(event.target.value)}
              placeholder={ORGANIZATION_STRUCTURE_COPY.designationSearch}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-canvas">
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleDesignations.map((designation) => {
              const department = DEPARTMENTS.find(
                (item) => item.id === designation.departmentId,
              );

              const levelConfig = DESIGNATION_LEVEL_CONFIG[designation.level];

              return (
                <TableRow key={designation.id} className="transition hover:bg-canvas">
                  <TableCell className="font-semibold">{designation.title}</TableCell>

                  <TableCell>{department?.name}</TableCell>

                  <TableCell>
                    <Badge variant={levelConfig.badgeVariant}>{levelConfig.label}</Badge>
                  </TableCell>

                  <TableCell>{designation.employeeCount}</TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${designation.title}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center gap-2 border-t border-border px-5 py-4 text-xs text-text-muted">
          <ShieldCheck size={15} />
          Changes to departments and designations will be recorded in the audit log.
        </div>
      </Card>
    </div>
  );
}
