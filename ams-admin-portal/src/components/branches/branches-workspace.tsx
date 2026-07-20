"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Building2,
  CheckCircle2,
  FilePenLine,
  MapPinned,
  Plus,
  Search,
  Users,
} from "lucide-react";

import {
  BranchDetails,
} from "@/components/branches/branch-details";
import {
  BranchForm,
} from "@/components/branches/branch-form";
import {
  BranchMap,
} from "@/components/branches/branch-map";
import {
  createBranchColumns,
} from "@/components/branches/branch-table-columns";
import {
  MetricCard,
} from "@/components/dashboard/metric-card";
import {
  DataTable,
} from "@/components/shared/data-table";
import {
  PageHeader,
} from "@/components/shared/page-header";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Button,
} from "@/components/ui/button";
import {
  Card,
} from "@/components/ui/card";
import {
  Drawer,
} from "@/components/ui/drawer";
import {
  Input,
} from "@/components/ui/input";
import {
  Select,
} from "@/components/ui/select";
import {
  BRANCH_COPY,
  BRANCH_STATUS_CONFIG,
} from "@/config/branches";
import {
  useBranchScope,
} from "@/context/branch-scope-context";
import {
  CURRENT_ADMIN,
} from "@/data/current-admin";
import {
  BRANCHES,
} from "@/data/branches";
import {
  getBranchCapacityUtilization,
} from "@/lib/branches";
import type {
  BranchRecord,
  BranchStatus,
} from "@/types/branch";

type EditorMode =
  | "create"
  | "edit"
  | null;

export function BranchesWorkspace() {
  const {
    selectedBranch,
    selectedBranchId,
  } = useBranchScope();

  const [branches, setBranches] =
    useState<BranchRecord[]>(
      BRANCHES,
    );
  const [searchQuery, setSearchQuery] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [cityFilter, setCityFilter] =
    useState("all");
  const [selectedRecordId, setSelectedRecordId] =
    useState<string | null>(null);
  const [editorMode, setEditorMode] =
    useState<EditorMode>(null);

  const scopedBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          selectedBranchId === "all" ||
          branch.id ===
            selectedBranchId,
      ),
    [branches, selectedBranchId],
  );

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          scopedBranches.map(
            (branch) => branch.city,
          ),
        ),
      ).sort(),
    [scopedBranches],
  );

  const visibleBranches = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return scopedBranches.filter(
      (branch) => {
        const searchableValue = [
          branch.name,
          branch.code,
          branch.city,
          branch.province,
          branch.country,
          branch.addressLine,
          branch.managerName,
          branch.email,
          branch.phone,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchableValue.includes(
            query,
          ) &&
          (statusFilter === "all" ||
            branch.status ===
              statusFilter) &&
          (cityFilter === "all" ||
            branch.city === cityFilter)
        );
      },
    );
  }, [
    cityFilter,
    scopedBranches,
    searchQuery,
    statusFilter,
  ]);

  const selectedRecord =
    branches.find(
      (branch) =>
        branch.id ===
        selectedRecordId,
    ) ?? null;

  const activeBranches =
    scopedBranches.filter(
      (branch) =>
        branch.status === "active",
    );
  const plannedBranches =
    scopedBranches.filter(
      (branch) =>
        branch.status === "planned",
    );
  const totalEmployees =
    scopedBranches.reduce(
      (total, branch) =>
        total +
        branch.employeeCount,
      0,
    );
  const totalCapacity =
    scopedBranches.reduce(
      (total, branch) =>
        total + branch.capacity,
      0,
    );
  const utilization =
    totalCapacity > 0
      ? Math.round(
          (totalEmployees /
            totalCapacity) *
            100,
        )
      : 0;

  const metrics = [
    {
      label:
        BRANCH_COPY.metrics.total,
      value: String(
        scopedBranches.length,
      ),
      detail: selectedBranch.name,
      icon: Building2,
      tone: "info" as const,
    },
    {
      label:
        BRANCH_COPY.metrics.active,
      value: String(
        activeBranches.length,
      ),
      detail: `${plannedBranches.length} planned`,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label:
        BRANCH_COPY.metrics.employees,
      value:
        totalEmployees.toLocaleString(
          "en-PK",
        ),
      detail: `${totalCapacity.toLocaleString(
        "en-PK",
      )} total capacity`,
      icon: Users,
      tone: "warning" as const,
    },
    {
      label:
        BRANCH_COPY.metrics
          .utilization,
      value: `${utilization}%`,
      detail:
        "Current organization capacity",
      icon: MapPinned,
      tone:
        utilization >= 90
          ? ("danger" as const)
          : ("info" as const),
    },
  ];

  const columns = createBranchColumns({
    onOpen: (branch) =>
      setSelectedRecordId(
        branch.id,
      ),
  });

  function saveBranch(
    branch: BranchRecord,
  ) {
    setBranches(
      (currentBranches) => {
        const exists =
          currentBranches.some(
            (item) =>
              item.id === branch.id,
          );

        return exists
          ? currentBranches.map(
              (item) =>
                item.id === branch.id
                  ? branch
                  : item,
            )
          : [
              branch,
              ...currentBranches,
            ];
      },
    );

    setEditorMode(null);
    setSelectedRecordId(branch.id);
  }

  function updateBranchStatus(
    status: BranchStatus,
  ) {
    if (!selectedRecord) {
      return;
    }

    setBranches(
      (currentBranches) =>
        currentBranches.map(
          (branch) =>
            branch.id ===
            selectedRecord.id
              ? {
                  ...branch,
                  status,
                  updatedAt: new Date()
                    .toISOString()
                    .slice(0, 10),
                  updatedBy:
                    CURRENT_ADMIN.name,
                }
              : branch,
        ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={BRANCH_COPY.eyebrow}
        title={BRANCH_COPY.title}
        description={
          BRANCH_COPY.description
        }
        actions={
          <Button
            onClick={() => {
              setSelectedRecordId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {BRANCH_COPY.addAction}
          </Button>
        }
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <section className="mt-6">
        <div>
          <h2 className="text-lg font-bold">
            {BRANCH_COPY.mapsTitle}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {
              BRANCH_COPY.mapsDescription
            }
          </p>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {visibleBranches.map(
            (branch) => (
              <Card
                key={branch.id}
                className="overflow-hidden"
              >
                <BranchMap
                  branch={branch}
                  compact
                />

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRecordId(
                      branch.id,
                    )
                  }
                  className="w-full p-5 text-left transition hover:bg-canvas"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-primary">
                        {branch.code}
                      </p>
                      <h3 className="mt-1 font-bold">
                        {branch.name}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {branch.addressLine},{" "}
                        {branch.city}
                      </p>
                    </div>

                    <Badge
                      variant={
                        BRANCH_STATUS_CONFIG[
                          branch.status
                        ].badgeVariant
                      }
                    >
                      {
                        BRANCH_STATUS_CONFIG[
                          branch.status
                        ].label
                      }
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-control bg-canvas p-3">
                      <p className="text-xs text-text-muted">
                        Employees
                      </p>
                      <p className="mt-1 font-bold">
                        {
                          branch.employeeCount
                        }
                      </p>
                    </div>

                    <div className="rounded-control bg-canvas p-3">
                      <p className="text-xs text-text-muted">
                        Capacity
                      </p>
                      <p className="mt-1 font-bold">
                        {getBranchCapacityUtilization(
                          branch,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </button>
              </Card>
            ),
          )}
        </div>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {
              BRANCH_COPY.registerTitle
            }
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {
              BRANCH_COPY
                .registerDescription
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
                  BRANCH_COPY
                    .searchPlaceholder
                }
                className="pl-9"
              />
            </div>

            <Select
              value={cityFilter}
              onChange={(event) =>
                setCityFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {BRANCH_COPY.allCities}
              </option>

              {cities.map((city) => (
                <option
                  key={city}
                  value={city}
                >
                  {city}
                </option>
              ))}
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
                  BRANCH_COPY
                    .allStatuses
                }
              </option>

              {Object.entries(
                BRANCH_STATUS_CONFIG,
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

        <DataTable
          rows={visibleBranches}
          columns={columns}
          getRowKey={(branch) =>
            branch.id
          }
          onRowClick={(branch) =>
            setSelectedRecordId(
              branch.id,
            )
          }
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <Building2 className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">
                {
                  BRANCH_COPY.emptyTitle
                }
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {
                  BRANCH_COPY
                    .emptyDescription
                }
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(
          selectedRecord &&
            editorMode === null,
        )}
        onClose={() =>
          setSelectedRecordId(null)
        }
        title="Branch details"
        description={
          selectedRecord?.name
        }
        footer={
          selectedRecord ? (
            <div className="flex flex-wrap justify-end gap-3">
              {selectedRecord.status ===
              "active" ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateBranchStatus(
                      "inactive",
                    )
                  }
                >
                  {
                    BRANCH_COPY.actions
                      .deactivate
                  }
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateBranchStatus(
                      "active",
                    )
                  }
                >
                  {
                    BRANCH_COPY.actions
                      .activate
                  }
                </Button>
              )}

              <Button
                onClick={() =>
                  setEditorMode("edit")
                }
              >
                <FilePenLine />
                {
                  BRANCH_COPY.actions.edit
                }
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedRecord && (
          <BranchDetails
            branch={selectedRecord}
          />
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() =>
          setEditorMode(null)
        }
        title={
          editorMode === "create"
            ? "Add branch"
            : "Edit branch"
        }
        description="Configure branch identity, location coordinates, capacity and operational controls."
      >
        {editorMode && (
          <BranchForm
            key={
              editorMode === "create"
                ? "new-branch"
                : selectedRecord?.id
            }
            branch={
              editorMode === "edit"
                ? selectedRecord ??
                  undefined
                : undefined
            }
            onCancel={() =>
              setEditorMode(null)
            }
            onSave={saveBranch}
          />
        )}
      </Drawer>
    </div>
  );
}
