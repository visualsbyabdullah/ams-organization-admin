"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  Archive,
  Building2,
  CheckCircle2,
  Copy,
  FilePenLine,
  Globe2,
  Plus,
  Search,
  Tags,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { FormField } from "@/components/forms/form-field";
import { SupportTabs } from "@/components/support/support-tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DetailGrid } from "@/components/shared/detail-grid";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_ACTION_LABELS,
  SUPPORT_CATEGORY_STATUS_CONFIG,
  SUPPORT_COPY,
  SUPPORT_PRIORITY_CONFIG,
  SUPPORT_SCOPE_CONFIG,
} from "@/config/support";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { SUPPORT_CATEGORIES } from "@/data/support";
import { formatDate } from "@/lib/date";
import type {
  SupportCategory,
  SupportCategoryStatus,
  SupportScope,
  SupportTicketPriority,
} from "@/types/support";

function CategoryForm({
  category,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  category?: SupportCategory;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (category: SupportCategory) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [code, setCode] = useState(category?.code ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [scope, setScope] = useState<SupportScope>(category?.scope ?? "organization");
  const [branchId, setBranchId] = useState(
    category?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SupportCategoryStatus>(
    category?.status ?? "active",
  );
  const [defaultPriority, setDefaultPriority] = useState<SupportTicketPriority>(
    category?.defaultPriority ?? "medium",
  );
  const [defaultAssignee, setDefaultAssignee] = useState(category?.defaultAssignee ?? "");
  const [firstResponseHours, setFirstResponseHours] = useState(
    String(category?.firstResponseHours ?? 4),
  );
  const [resolutionHours, setResolutionHours] = useState(
    String(category?.resolutionHours ?? 24),
  );
  const [employeeVisible, setEmployeeVisible] = useState(
    category?.employeeVisible ?? true,
  );
  const [allowAttachments, setAllowAttachments] = useState(
    category?.allowAttachments ?? true,
  );
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !name.trim() ||
      !code.trim() ||
      !description.trim() ||
      (scope === "branch" && !branchId) ||
      Number(firstResponseHours) <= 0 ||
      Number(resolutionHours) <= 0
    ) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    onSave({
      id: category?.id ?? crypto.randomUUID(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      defaultPriority,
      defaultAssignee: defaultAssignee.trim() || undefined,
      firstResponseHours: Number(firstResponseHours),
      resolutionHours: Number(resolutionHours),
      employeeVisible,
      allowAttachments,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Category name"
          htmlFor="supportCategoryName"
          error={submitted && !name.trim() ? "Enter a category name" : undefined}
        >
          <Input
            id="supportCategoryName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Payroll & Compensation"
          />
        </FormField>

        <FormField
          label="Category code"
          htmlFor="supportCategoryCode"
          error={submitted && !code.trim() ? "Enter a category code" : undefined}
        >
          <Input
            id="supportCategoryCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Example: PAY"
          />
        </FormField>

        <FormField label="Scope" htmlFor="supportCategoryScope">
          <Select
            id="supportCategoryScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as SupportScope)}
          >
            {Object.entries(SUPPORT_SCOPE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="supportCategoryBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="supportCategoryBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Status" htmlFor="supportCategoryStatus">
          <Select
            id="supportCategoryStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as SupportCategoryStatus)}
          >
            {Object.entries(SUPPORT_CATEGORY_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Default priority" htmlFor="supportDefaultPriority">
          <Select
            id="supportDefaultPriority"
            value={defaultPriority}
            onChange={(event) =>
              setDefaultPriority(event.target.value as SupportTicketPriority)
            }
          >
            {Object.entries(SUPPORT_PRIORITY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Default assignee" htmlFor="supportDefaultAssignee" optional>
          <Input
            id="supportDefaultAssignee"
            value={defaultAssignee}
            onChange={(event) => setDefaultAssignee(event.target.value)}
            placeholder="Example: People Operations"
          />
        </FormField>

        <FormField
          label="First response target"
          htmlFor="supportFirstResponse"
          description="Target time in hours."
        >
          <Input
            id="supportFirstResponse"
            type="number"
            min="1"
            value={firstResponseHours}
            onChange={(event) => setFirstResponseHours(event.target.value)}
          />
        </FormField>

        <FormField
          label="Resolution target"
          htmlFor="supportResolution"
          description="Target time in hours."
        >
          <Input
            id="supportResolution"
            type="number"
            min="1"
            value={resolutionHours}
            onChange={(event) => setResolutionHours(event.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label="Category description"
        htmlFor="supportCategoryDescription"
        error={
          submitted && !description.trim() ? "Enter a category description" : undefined
        }
      >
        <Textarea
          id="supportCategoryDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Explain the requests routed through this category..."
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
          <div>
            <p className="text-sm font-semibold">Visible to employees</p>
            <p className="mt-1 text-xs text-text-muted">
              Allow employees to select this category in the support portal.
            </p>
          </div>
          <Switch
            checked={employeeVisible}
            onCheckedChange={setEmployeeVisible}
            ariaLabel="Visible to employees"
          />
        </div>
        <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
          <div>
            <p className="text-sm font-semibold">Allow attachments</p>
            <p className="mt-1 text-xs text-text-muted">
              Allow supporting files on tickets in this category.
            </p>
          </div>
          <Switch
            checked={allowAttachments}
            onCheckedChange={setAllowAttachments}
            ariaLabel="Allow attachments"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SUPPORT_ACTION_LABELS.cancel}
        </Button>
        <Button type="submit">{category ? "Save category" : "Create category"}</Button>
      </div>
    </form>
  );
}

export function SupportCategoriesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [categories, setCategories] = useState<SupportCategory[]>(SUPPORT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const categorySelection = useEntitySelection(categories, (category) => category.id);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          selectedBranch.isAggregate ||
          category.scope === "organization" ||
          category.branchId === selectedBranch.id,
      ),
    [categories, selectedBranch],
  );

  const visibleCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedCategories.filter((category) => {
      const searchable = [
        category.name,
        category.code,
        category.description,
        category.defaultAssignee,
        category.branchName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "all" || category.status === statusFilter) &&
        (scopeFilter === "all" || category.scope === scopeFilter)
      );
    });
  }, [scopedCategories, scopeFilter, searchQuery, statusFilter]);

  const selectedCategory = categorySelection.selected;

  const activeCategories = scopedCategories.filter(
    (category) => category.status === "active",
  );
  const branchOverrides = scopedCategories.filter(
    (category) => category.scope === "branch",
  );
  const employeeVisible = activeCategories.filter((category) => category.employeeVisible);
  const averageResolution = activeCategories.length
    ? Math.round(
        activeCategories.reduce(
          (total, category) => total + category.resolutionHours,
          0,
        ) / activeCategories.length,
      )
    : 0;

  const metrics = [
    {
      label: "Active categories",
      value: String(activeCategories.length),
      detail: selectedBranch.name,
      icon: Tags,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: String(branchOverrides.length),
      detail: "Custom routing categories",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Employee visible",
      value: String(employeeVisible.length),
      detail: "Available in support portal",
      icon: Globe2,
      tone: "info" as const,
    },
    {
      label: "Average resolution",
      value: `${averageResolution}h`,
      detail: "Across active categories",
      icon: CheckCircle2,
      tone: "warning" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<SupportCategory>[]>(
    () => [
      {
        id: "category",
        header: "Category",
        cell: (category) => (
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              {category.scope === "organization" ? (
                <Globe2 size={18} />
              ) : (
                <Building2 size={18} />
              )}
            </span>
            <div>
              <p className="font-semibold">{category.name}</p>
              <p className="mt-1 text-xs text-text-muted">
                {category.code} · {category.branchName ?? "All branches"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "scope",
        header: "Scope",
        cell: (category) => (
          <Badge variant={SUPPORT_SCOPE_CONFIG[category.scope].badgeVariant}>
            {SUPPORT_SCOPE_CONFIG[category.scope].label}
          </Badge>
        ),
      },
      {
        id: "priority",
        header: "Default priority",
        cell: (category) => (
          <Badge variant={SUPPORT_PRIORITY_CONFIG[category.defaultPriority].badgeVariant}>
            {SUPPORT_PRIORITY_CONFIG[category.defaultPriority].label}
          </Badge>
        ),
      },
      {
        id: "assignee",
        header: "Default assignee",
        cell: (category) => category.defaultAssignee ?? "Unassigned",
      },
      {
        id: "response",
        header: "First response",
        cell: (category) => `${category.firstResponseHours} hours`,
      },
      {
        id: "resolution",
        header: "Resolution",
        cell: (category) => `${category.resolutionHours} hours`,
      },
      {
        id: "status",
        header: "Status",
        cell: (category) => (
          <Badge variant={SUPPORT_CATEGORY_STATUS_CONFIG[category.status].badgeVariant}>
            {SUPPORT_CATEGORY_STATUS_CONFIG[category.status].label}
          </Badge>
        ),
      },
    ],
    [],
  );

  function saveCategory(category: SupportCategory) {
    setCategories((current) => {
      const exists = current.some((item) => item.id === category.id);
      return exists
        ? current.map((item) => (item.id === category.id ? category : item))
        : [category, ...current];
    });
    setEditorMode(null);
    categorySelection.select(category.id);
  }

  function updateStatus(status: SupportCategory["status"]) {
    if (!selectedCategory) return;
    setCategories((current) =>
      current.map((category) =>
        category.id === selectedCategory.id
          ? {
              ...category,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : category,
      ),
    );
  }

  function duplicateCategory() {
    if (!selectedCategory) return;
    const duplicate: SupportCategory = {
      ...selectedCategory,
      id: crypto.randomUUID(),
      name: `${selectedCategory.name} Copy`,
      code: `${selectedCategory.code}-COPY`,
      status: "inactive",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };
    setCategories((current) => [duplicate, ...current]);
    categorySelection.select(duplicate.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.categories.eyebrow}
        title={SUPPORT_COPY.categories.title}
        description={SUPPORT_COPY.categories.description}
        actions={
          <Button
            onClick={() => {
              categorySelection.clear();
              setEditorMode("create");
            }}
          >
            <Plus />
            {SUPPORT_COPY.categories.createAction}
          </Button>
        }
      />

      <div className="mt-7">
        <SupportTabs />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{SUPPORT_COPY.categories.registerTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {SUPPORT_COPY.categories.registerDescription}
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={SUPPORT_COPY.categories.searchPlaceholder}
                className="pl-9"
              />
            </div>
            <Select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.categories.allScopes}</option>
              {Object.entries(SUPPORT_SCOPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.categories.allStatuses}</option>
              {Object.entries(SUPPORT_CATEGORY_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleCategories}
          columns={columns}
          getRowKey={(category) => category.id}
          onRowClick={(category) => categorySelection.select(category.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <Tags className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{SUPPORT_COPY.categories.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {SUPPORT_COPY.categories.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedCategory)}
        onClose={() => categorySelection.clear()}
        title="Support category"
        description={selectedCategory?.name}
        footer={
          selectedCategory ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateCategory}>
                <Copy />
                {SUPPORT_ACTION_LABELS.duplicate}
              </Button>
              {selectedCategory.status === "active" && (
                <Button variant="outline" onClick={() => updateStatus("inactive")}>
                  {SUPPORT_ACTION_LABELS.deactivate}
                </Button>
              )}
              {selectedCategory.status !== "active" && (
                <Button variant="outline" onClick={() => updateStatus("active")}>
                  <CheckCircle2 />
                  {SUPPORT_ACTION_LABELS.activate}
                </Button>
              )}
              {selectedCategory.status !== "archived" && (
                <Button variant="outline" onClick={() => updateStatus("archived")}>
                  <Archive />
                  {SUPPORT_ACTION_LABELS.archive}
                </Button>
              )}
              <Button onClick={() => setEditorMode("edit")}>
                <FilePenLine />
                {SUPPORT_ACTION_LABELS.edit}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedCategory && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedCategory.name}</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Updated by {selectedCategory.updatedBy} on{" "}
                    {formatDate(selectedCategory.updatedAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    SUPPORT_CATEGORY_STATUS_CONFIG[selectedCategory.status].badgeVariant
                  }
                >
                  {SUPPORT_CATEGORY_STATUS_CONFIG[selectedCategory.status].label}
                </Badge>
              </div>
              <DetailGrid
                variant="none"
                items={[
                  {
                    label: "Code",
                    value: selectedCategory.code,
                  },
                  {
                    label: "Scope",
                    value: SUPPORT_SCOPE_CONFIG[selectedCategory.scope].label,
                  },
                  {
                    label: "Default assignee",
                    value: selectedCategory.defaultAssignee ?? "Unassigned",
                  },
                  {
                    label: "Resolution",
                    value: `${selectedCategory.resolutionHours} hours`,
                  },
                ]}
              />
            </section>
            <section>
              <h3 className="text-sm font-bold">Description</h3>
              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedCategory.description}
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={editorMode === "create" ? "Add support category" : "Edit support category"}
        description="Configure routing, service levels and employee visibility."
      >
        {editorMode && (
          <CategoryForm
            key={editorMode === "create" ? "new-support-category" : selectedCategory?.id}
            category={editorMode === "edit" ? (selectedCategory ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveCategory}
          />
        )}
      </Drawer>
    </div>
  );
}
