"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Archive,
  Building2,
  Clock3,
  Copy,
  FilePenLine,
  Globe2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AttendancePolicyForm } from "@/components/attendance/attendance-policy-form";
import { AttendanceTabs } from "@/components/attendance/attendance-tabs";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ATTENDANCE_POLICY_BRANCH_OPTIONS,
  ATTENDANCE_POLICY_COPY,
  ATTENDANCE_POLICY_SCOPE_CONFIG,
  ATTENDANCE_POLICY_STATUS_CONFIG,
} from "@/config/attendance-policies";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { ATTENDANCE_POLICIES } from "@/data/attendance-policies";
import { formatDate } from "@/lib/date";
import {
  formatMinutesAsHours,
} from "@/lib/time";
import type {
  AttendancePolicy,
} from "@/types/attendance-policy";

type EditorMode =
  | "create"
  | "edit"
  | null;

function getBranchLabels(
  branchIds: string[],
) {
  return ATTENDANCE_POLICY_BRANCH_OPTIONS
    .filter((branch) =>
      branchIds.includes(branch.id),
    )
    .map((branch) => branch.label);
}

export function AttendancePoliciesWorkspace() {
  const { selectedBranch } =
    useBranchScope();

  const [policies, setPolicies] =
    useState<AttendancePolicy[]>(
      ATTENDANCE_POLICIES,
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [scopeFilter, setScopeFilter] =
    useState("all");

  const [
    selectedPolicyId,
    setSelectedPolicyId,
  ] = useState<string | null>(null);

  const [
    editorMode,
    setEditorMode,
  ] = useState<EditorMode>(null);

  const scopedPolicies = useMemo(
    () =>
      policies.filter((policy) => {
        if (
          selectedBranch.isAggregate
        ) {
          return true;
        }

        return (
          policy.scope ===
            "all_branches" ||
          policy.branchIds.includes(
            selectedBranch.id,
          )
        );
      }),
    [policies, selectedBranch],
  );

  const visiblePolicies =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return scopedPolicies.filter(
        (policy) => {
          const branchLabels =
            getBranchLabels(
              policy.branchIds,
            );

          const searchableValue = [
            policy.name,
            policy.description,
            ...branchLabels,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            searchableValue.includes(
              query,
            );

          const matchesStatus =
            statusFilter === "all" ||
            policy.status ===
              statusFilter;

          const matchesScope =
            scopeFilter === "all" ||
            policy.scope ===
              scopeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesScope
          );
        },
      );
    }, [
      scopeFilter,
      scopedPolicies,
      searchQuery,
      statusFilter,
    ]);

  const selectedPolicy =
    policies.find(
      (policy) =>
        policy.id === selectedPolicyId,
    ) ?? null;

  const metrics = [
    {
      label: "Active policies",
      value: scopedPolicies.filter(
        (policy) =>
          policy.status === "active",
      ).length,
      detail: selectedBranch.name,
      icon: ShieldCheck,
      tone: "success" as const,
    },
    {
      label: "Organization-wide",
      value: scopedPolicies.filter(
        (policy) =>
          policy.scope ===
          "all_branches",
      ).length,
      detail:
        "Applied to every branch",
      icon: Globe2,
      tone: "info" as const,
    },
    {
      label: "Branch-specific",
      value: scopedPolicies.filter(
        (policy) =>
          policy.scope ===
          "selected_branches",
      ).length,
      detail:
        "Limited organization scope",
      icon: Building2,
      tone: "warning" as const,
    },
    {
      label: "Draft policies",
      value: scopedPolicies.filter(
        (policy) =>
          policy.status === "draft",
      ).length,
      detail:
        "Not currently enforced",
      icon: FilePenLine,
      tone: "neutral" as const,
    },
  ];

  function savePolicy(
    nextPolicy: AttendancePolicy,
  ) {
    setPolicies(
      (currentPolicies) => {
        const exists =
          currentPolicies.some(
            (policy) =>
              policy.id ===
              nextPolicy.id,
          );

        return exists
          ? currentPolicies.map(
              (policy) =>
                policy.id ===
                nextPolicy.id
                  ? nextPolicy
                  : policy,
            )
          : [
              nextPolicy,
              ...currentPolicies,
            ];
      },
    );

    setSelectedPolicyId(
      nextPolicy.id,
    );

    setEditorMode(null);
  }

  function duplicatePolicy(
    policy: AttendancePolicy,
  ) {
    const duplicate: AttendancePolicy =
      {
        ...policy,
        id: crypto.randomUUID(),
        name: `${policy.name} Copy`,
        status: "draft",
        updatedAt: new Date()
          .toISOString()
          .slice(0, 10),
        updatedBy: CURRENT_ADMIN.name,
      };

    setPolicies(
      (currentPolicies) => [
        duplicate,
        ...currentPolicies,
      ],
    );

    setSelectedPolicyId(
      duplicate.id,
    );
  }

  function archivePolicy(
    policyId: string,
  ) {
    setPolicies(
      (currentPolicies) =>
        currentPolicies.map(
          (policy) =>
            policy.id === policyId
              ? {
                  ...policy,
                  status:
                    "archived",
                  updatedAt:
                    new Date()
                      .toISOString()
                      .slice(0, 10),
                  updatedBy:
                    CURRENT_ADMIN.name,
                }
              : policy,
        ),
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={
          ATTENDANCE_POLICY_COPY.eyebrow
        }
        title={
          ATTENDANCE_POLICY_COPY.title
        }
        description={
          ATTENDANCE_POLICY_COPY.description
        }
        actions={
          <Button
            onClick={() => {
              setSelectedPolicyId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {
              ATTENDANCE_POLICY_COPY.createAction
            }
          </Button>
        }
      />

      <div className="mt-7">
        <AttendanceTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      <Card className="mt-6">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {
              ATTENDANCE_POLICY_COPY.policiesTitle
            }
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {
              ATTENDANCE_POLICY_COPY.policiesDescription
            }
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
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
                  ATTENDANCE_POLICY_COPY.searchPlaceholder
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
                  ATTENDANCE_POLICY_COPY.allStatuses
                }
              </option>

              {Object.entries(
                ATTENDANCE_POLICY_STATUS_CONFIG,
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
              value={scopeFilter}
              onChange={(event) =>
                setScopeFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                {
                  ATTENDANCE_POLICY_COPY.allScopes
                }
              </option>

              {Object.entries(
                ATTENDANCE_POLICY_SCOPE_CONFIG,
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

        {visiblePolicies.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {visiblePolicies.map(
              (policy) => {
                const statusConfig =
                  ATTENDANCE_POLICY_STATUS_CONFIG[
                    policy.status
                  ];

                const scopeConfig =
                  ATTENDANCE_POLICY_SCOPE_CONFIG[
                    policy.scope
                  ];

                const branchLabels =
                  getBranchLabels(
                    policy.branchIds,
                  );

                return (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() =>
                      setSelectedPolicyId(
                        policy.id,
                      )
                    }
                    className="text-left"
                  >
                    <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                          <ShieldCheck size={20} />
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Open ${policy.name}`}
                          onClick={(event) => {
                            event.stopPropagation();

                            setSelectedPolicyId(
                              policy.id,
                            );
                          }}
                        >
                          <MoreHorizontal />
                        </Button>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Badge
                          variant={
                            statusConfig.badgeVariant
                          }
                        >
                          {
                            statusConfig.label
                          }
                        </Badge>

                        <Badge
                          variant={
                            scopeConfig.badgeVariant
                          }
                        >
                          {
                            scopeConfig.label
                          }
                        </Badge>
                      </div>

                      <h3 className="mt-4 text-lg font-bold">
                        {policy.name}
                      </h3>

                      <p className="mt-2 min-h-18 text-sm leading-6 text-text-muted">
                        {
                          policy.description
                        }
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-control bg-canvas p-3">
                          <p className="text-xs text-text-muted">
                            Employees
                          </p>

                          <p className="mt-1 font-bold">
                            {
                              policy.applicableEmployees
                            }
                          </p>
                        </div>

                        <div className="rounded-control bg-canvas p-3">
                          <p className="text-xs text-text-muted">
                            Grace period
                          </p>

                          <p className="mt-1 font-bold">
                            {
                              policy.rules
                                .gracePeriodMinutes
                            }{" "}
                            min
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-border pt-4">
                        <p className="text-xs text-text-muted">
                          {policy.scope ===
                          "all_branches"
                            ? "Islamabad, Lahore and Karachi"
                            : branchLabels.join(
                                ", ",
                              )}
                        </p>
                      </div>
                    </Card>
                  </button>
                );
              },
            )}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="size-8 text-text-muted" />

            <h3 className="mt-4 font-bold">
              {
                ATTENDANCE_POLICY_COPY.emptyTitle
              }
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              {
                ATTENDANCE_POLICY_COPY.emptyDescription
              }
            </p>
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(selectedPolicy)}
        onClose={() =>
          setSelectedPolicyId(null)
        }
        title="Attendance policy"
        description={
          selectedPolicy?.name
        }
        footer={
          selectedPolicy ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  duplicatePolicy(
                    selectedPolicy,
                  )
                }
              >
                <Copy />
                Duplicate
              </Button>

              {selectedPolicy.status !==
                "archived" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    archivePolicy(
                      selectedPolicy.id,
                    )
                  }
                >
                  <Archive />
                  Archive
                </Button>
              )}

              <Button
                onClick={() =>
                  setEditorMode("edit")
                }
              >
                <FilePenLine />
                Edit policy
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedPolicy && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">
                    {
                      selectedPolicy.name
                    }
                  </h3>

                  <p className="mt-1 text-xs text-text-muted">
                    Updated by{" "}
                    {
                      selectedPolicy.updatedBy
                    }{" "}
                    on{" "}
                    {formatDate(
                      selectedPolicy.updatedAt,
                    )}
                  </p>
                </div>

                <Badge
                  variant={
                    ATTENDANCE_POLICY_STATUS_CONFIG[
                      selectedPolicy.status
                    ].badgeVariant
                  }
                >
                  {
                    ATTENDANCE_POLICY_STATUS_CONFIG[
                      selectedPolicy.status
                    ].label
                  }
                </Badge>
              </div>

              <div className="p-5">
                <p className="text-sm leading-6 text-text-muted">
                  {
                    selectedPolicy.description
                  }
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">
                Policy scope
              </h3>

              <div className="mt-3 rounded-control bg-canvas p-4">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      {
                        selectedPolicy.applicableEmployees
                      }{" "}
                      employees
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {selectedPolicy.scope ===
                      "all_branches"
                        ? "All organization branches"
                        : getBranchLabels(
                            selectedPolicy.branchIds,
                          ).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold">
                Attendance thresholds
              </h3>

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Grace period",
                    value: `${selectedPolicy.rules.gracePeriodMinutes} min`,
                  },
                  {
                    label: "Late after",
                    value: `${selectedPolicy.rules.lateAfterMinutes} min`,
                  },
                  {
                    label: "Absent after",
                    value: `${selectedPolicy.rules.absenceAfterMinutes} min`,
                  },
                  {
                    label:
                      "Half-day minimum",
                    value:
                      formatMinutesAsHours(
                        selectedPolicy.rules
                          .minimumHalfDayMinutes,
                      ),
                  },
                  {
                    label:
                      "Standard workday",
                    value:
                      formatMinutesAsHours(
                        selectedPolicy.rules
                          .standardDailyMinutes,
                      ),
                  },
                  {
                    label:
                      "Overtime begins",
                    value:
                      formatMinutesAsHours(
                        selectedPolicy.rules
                          .overtimeAfterMinutes,
                      ),
                  },
                  {
                    label:
                      "Correction window",
                    value: `${selectedPolicy.rules.correctionWindowDays} days`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-control bg-canvas p-4"
                  >
                    <dt className="text-xs text-text-muted">
                      {item.label}
                    </dt>

                    <dd className="mt-1 text-sm font-semibold">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold">
                Attendance controls
              </h3>

              <div className="mt-3 space-y-3">
                {[
                  {
                    label:
                      "Location required",
                    enabled:
                      selectedPolicy.rules
                        .requireLocation,
                  },
                  {
                    label:
                      "Remote attendance",
                    enabled:
                      selectedPolicy.rules
                        .allowRemoteAttendance,
                  },
                  {
                    label:
                      "Automatic overtime approval",
                    enabled:
                      selectedPolicy.rules
                        .autoApproveOvertime,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-control border border-border p-4"
                  >
                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                    <Badge
                      variant={
                        item.enabled
                          ? "success"
                          : "neutral"
                      }
                    >
                      {item.enabled
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() =>
          setEditorMode(null)
        }
        title={
          editorMode === "create"
            ? "Create attendance policy"
            : "Edit attendance policy"
        }
        description="Configure policy scope, attendance thresholds and organization controls."
        className="max-w-5xl"
      >
        {editorMode && (
          <AttendancePolicyForm
            key={
              editorMode === "create"
                ? "new-policy"
                : selectedPolicy?.id
            }
            policy={
              editorMode === "edit"
                ? selectedPolicy ??
                  undefined
                : undefined
            }
            onCancel={() =>
              setEditorMode(null)
            }
            onSave={savePolicy}
          />
        )}
      </Drawer>
    </div>
  );
}
