"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookOpen,
  Building2,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FilePenLine,
  FileSearch,
  Globe2,
  Headphones,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  ThumbsUp,
  Ticket,
  UserCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { FormField } from "@/components/forms/form-field";
import { SupportTabs } from "@/components/support/support-tabs";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CHART_AXIS_STYLE,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/config/charts";
import {
  SUPPORT_ACTION_LABELS,
  SUPPORT_ARTICLE_STATUS_CONFIG,
  SUPPORT_ARTICLE_VISIBILITY_CONFIG,
  SUPPORT_CATEGORY_STATUS_CONFIG,
  SUPPORT_CHANNEL_CONFIG,
  SUPPORT_COPY,
  SUPPORT_PRIORITY_CONFIG,
  SUPPORT_SCOPE_CONFIG,
  SUPPORT_SETTINGS_CONTROLS,
  SUPPORT_SETTINGS_STATUS_CONFIG,
  SUPPORT_SLA_CONFIG,
  SUPPORT_TICKET_STATUS_CONFIG,
} from "@/config/support";
import { useBranchScope } from "@/context/branch-scope-context";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import {
  SUPPORT_ARTICLES,
  SUPPORT_CATEGORIES,
  SUPPORT_SETTINGS,
  SUPPORT_TICKETS,
  SUPPORT_VOLUME_TRENDS,
} from "@/data/support";
import { formatDate } from "@/lib/date";
import {
  exportSupportTickets,
  formatSupportDateTime,
  getSupportSlaState,
} from "@/lib/support";
import type {
  SupportArticle,
  SupportArticleStatus,
  SupportArticleVisibility,
  SupportCategory,
  SupportCategoryStatus,
  SupportScope,
  SupportSettings,
  SupportSettingsStatus,
  SupportTicket,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportVolumePoint,
} from "@/types/support";

function SupportVolumeChart({ data }: { data: SupportVolumePoint[] }) {
  return (
    <div className="h-72 w-full [&_*:focus]:outline-none [&_svg]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer={false}
          data={data}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            width={44}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", paddingTop: "18px" }}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Created"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.08}
            strokeWidth={2.5}
          />
          <Area
            type="monotone"
            dataKey="resolved"
            name="Resolved"
            stroke={CHART_COLORS.present}
            fill={CHART_COLORS.present}
            fillOpacity={0.08}
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TicketForm({
  ticket,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  ticket?: SupportTicket;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (ticket: SupportTicket) => void;
}) {
  const availableEmployees = EMPLOYEES.filter(
    (employee) =>
      selectedBranchId === "all" || employee.branchId === selectedBranchId,
  );

  const availableCategories = SUPPORT_CATEGORIES.filter(
    (category) =>
      category.status === "active" &&
      (category.scope === "organization" ||
        selectedBranchId === "all" ||
        category.branchId === selectedBranchId),
  );

  const [employeeId, setEmployeeId] = useState(
    ticket?.employeeId ?? availableEmployees[0]?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    ticket?.categoryId ?? availableCategories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [priority, setPriority] = useState<SupportTicketPriority>(
    ticket?.priority ?? "medium",
  );
  const [channel, setChannel] = useState<SupportTicketChannel>(
    ticket?.channel ?? "portal",
  );
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo ?? "");
  const [internalNote, setInternalNote] = useState(ticket?.internalNote ?? "");
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!employeeId || !categoryId || !title.trim() || !description.trim()) {
      return;
    }

    const employee = EMPLOYEES.find((item) => item.id === employeeId);
    const category = SUPPORT_CATEGORIES.find((item) => item.id === categoryId);

    if (!employee || !category) {
      return;
    }

    const now = new Date();
    const dueAt = new Date(
      now.getTime() + category.resolutionHours * 60 * 60 * 1000,
    ).toISOString();

    onSave({
      id: ticket?.id ?? crypto.randomUUID(),
      ticketNumber:
        ticket?.ticketNumber ?? `AMS-SUP-${Date.now().toString().slice(-6)}`,
      employeeId,
      branchId: employee.branchId,
      categoryId,
      title: title.trim(),
      description: description.trim(),
      status: ticket?.status ?? "open",
      priority,
      channel,
      assignedTo: assignedTo.trim() || category.defaultAssignee,
      createdAt: ticket?.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString(),
      dueAt: ticket?.dueAt ?? dueAt,
      firstRespondedAt: ticket?.firstRespondedAt,
      resolvedAt: ticket?.resolvedAt,
      closedAt: ticket?.closedAt,
      satisfactionRating: ticket?.satisfactionRating,
      tags: ticket?.tags ?? [],
      internalNote: internalNote.trim(),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Requester"
          htmlFor="supportRequester"
          error={submitted && !employeeId ? "Select an employee" : undefined}
        >
          <Select
            id="supportRequester"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          >
            <option value="">Select employee</option>
            {availableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} — {employee.employeeCode}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Support category"
          htmlFor="supportCategory"
          error={submitted && !categoryId ? "Select a category" : undefined}
        >
          <Select
            id="supportCategory"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Select category</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Priority" htmlFor="supportPriority">
          <Select
            id="supportPriority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as SupportTicketPriority)
            }
          >
            {Object.entries(SUPPORT_PRIORITY_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Request channel" htmlFor="supportChannel">
          <Select
            id="supportChannel"
            value={channel}
            onChange={(event) =>
              setChannel(event.target.value as SupportTicketChannel)
            }
          >
            {Object.entries(SUPPORT_CHANNEL_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Assigned team or person"
          htmlFor="supportAssignee"
          optional
        >
          <Input
            id="supportAssignee"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            placeholder="Example: People Operations"
          />
        </FormField>
      </div>

      <FormField
        label="Ticket title"
        htmlFor="supportTitle"
        error={submitted && !title.trim() ? "Enter a ticket title" : undefined}
      >
        <Input
          id="supportTitle"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Summarize the employee request"
        />
      </FormField>

      <FormField
        label="Request details"
        htmlFor="supportDescription"
        error={
          submitted && !description.trim() ? "Enter request details" : undefined
        }
      >
        <Textarea
          id="supportDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the issue, impact and expected outcome..."
        />
      </FormField>

      <FormField label="Internal note" htmlFor="supportNote" optional>
        <Textarea
          id="supportNote"
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          placeholder="Add private routing or resolution context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SUPPORT_ACTION_LABELS.cancel}
        </Button>
        <Button type="submit">
          {ticket ? "Save ticket" : "Create ticket"}
        </Button>
      </div>
    </form>
  );
}

function TicketDetails({ ticket }: { ticket: SupportTicket }) {
  const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);
  const category = SUPPORT_CATEGORIES.find(
    (item) => item.id === ticket.categoryId,
  );
  const slaState = getSupportSlaState(ticket);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold text-primary">
              {ticket.ticketNumber}
            </p>
            <h3 className="mt-2 font-bold">{ticket.title}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Created {formatSupportDateTime(ticket.createdAt)}
            </p>
          </div>
          <Badge
            variant={SUPPORT_TICKET_STATUS_CONFIG[ticket.status].badgeVariant}
          >
            {SUPPORT_TICKET_STATUS_CONFIG[ticket.status].label}
          </Badge>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-muted">Requester</dt>
            <dd className="mt-1 text-sm font-semibold">
              {employee?.name ?? "Unknown employee"}
            </dd>
            <dd className="mt-1 text-xs text-text-muted">
              {employee?.employeeCode ?? "Not assigned"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Branch</dt>
            <dd className="mt-1 text-sm font-semibold">
              {employee?.branchName ?? ticket.branchId}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Category</dt>
            <dd className="mt-1 text-sm font-semibold">
              {category?.name ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Assigned to</dt>
            <dd className="mt-1 text-sm font-semibold">
              {ticket.assignedTo ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Priority</dt>
            <dd className="mt-1">
              <Badge
                variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}
              >
                {SUPPORT_PRIORITY_CONFIG[ticket.priority].label}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">SLA state</dt>
            <dd className="mt-1">
              <Badge variant={SUPPORT_SLA_CONFIG[slaState].badgeVariant}>
                {SUPPORT_SLA_CONFIG[slaState].label}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Channel</dt>
            <dd className="mt-1 text-sm font-semibold">
              {SUPPORT_CHANNEL_CONFIG[ticket.channel].label}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Resolution due</dt>
            <dd className="mt-1 text-sm font-semibold">
              {formatSupportDateTime(ticket.dueAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-bold">Employee request</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {ticket.description}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-bold">Internal note</h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {ticket.internalNote || "No internal support note has been added."}
        </p>
      </section>

      {ticket.tags.length > 0 && (
        <section>
          <h3 className="text-sm font-bold">Tags</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ticket.tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

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
  const [scope, setScope] = useState<SupportScope>(
    category?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    category?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SupportCategoryStatus>(
    category?.status ?? "active",
  );
  const [defaultPriority, setDefaultPriority] = useState<SupportTicketPriority>(
    category?.defaultPriority ?? "medium",
  );
  const [defaultAssignee, setDefaultAssignee] = useState(
    category?.defaultAssignee ?? "",
  );
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
          error={
            submitted && !name.trim() ? "Enter a category name" : undefined
          }
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
          error={
            submitted && !code.trim() ? "Enter a category code" : undefined
          }
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
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map(
                (branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ),
              )}
            </Select>
          </FormField>
        )}

        <FormField label="Status" htmlFor="supportCategoryStatus">
          <Select
            id="supportCategoryStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SupportCategoryStatus)
            }
          >
            {Object.entries(SUPPORT_CATEGORY_STATUS_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
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

        <FormField
          label="Default assignee"
          htmlFor="supportDefaultAssignee"
          optional
        >
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
          submitted && !description.trim()
            ? "Enter a category description"
            : undefined
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
        <Button type="submit">
          {category ? "Save category" : "Create category"}
        </Button>
      </div>
    </form>
  );
}

function ArticleForm({
  article,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  article?: SupportArticle;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (article: SupportArticle) => void;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    article?.categoryId ?? SUPPORT_CATEGORIES[0]?.id ?? "",
  );
  const [scope, setScope] = useState<SupportScope>(
    article?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    article?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SupportArticleStatus>(
    article?.status ?? "draft",
  );
  const [visibility, setVisibility] = useState<SupportArticleVisibility>(
    article?.visibility ?? "employees",
  );
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [tags, setTags] = useState(article?.tags.join(", ") ?? "");
  const [submitted, setSubmitted] = useState(false);

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !title.trim() ||
      !categoryId ||
      !summary.trim() ||
      !content.trim() ||
      (scope === "branch" && !branchId)
    ) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);
    const actionDate = new Date().toISOString().slice(0, 10);

    onSave({
      id: article?.id ?? crypto.randomUUID(),
      title: title.trim(),
      slug: article?.slug ?? slugify(title),
      categoryId,
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      visibility,
      summary: summary.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      helpfulCount: article?.helpfulCount ?? 0,
      notHelpfulCount: article?.notHelpfulCount ?? 0,
      publishedAt:
        status === "published"
          ? (article?.publishedAt ?? actionDate)
          : undefined,
      updatedAt: actionDate,
      updatedBy: CURRENT_ADMIN.name,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Article title"
          htmlFor="supportArticleTitle"
          error={
            submitted && !title.trim() ? "Enter an article title" : undefined
          }
        >
          <Input
            id="supportArticleTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: How to request an attendance correction"
          />
        </FormField>

        <FormField
          label="Category"
          htmlFor="supportArticleCategory"
          error={submitted && !categoryId ? "Select a category" : undefined}
        >
          <Select
            id="supportArticleCategory"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {SUPPORT_CATEGORIES.filter(
              (category) => category.status === "active",
            ).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="supportArticleScope">
          <Select
            id="supportArticleScope"
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
            htmlFor="supportArticleBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="supportArticleBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map(
                (branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ),
              )}
            </Select>
          </FormField>
        )}

        <FormField label="Status" htmlFor="supportArticleStatus">
          <Select
            id="supportArticleStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SupportArticleStatus)
            }
          >
            {Object.entries(SUPPORT_ARTICLE_STATUS_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Visibility" htmlFor="supportArticleVisibility">
          <Select
            id="supportArticleVisibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as SupportArticleVisibility)
            }
          >
            {Object.entries(SUPPORT_ARTICLE_VISIBILITY_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Tags" htmlFor="supportArticleTags" optional>
          <Input
            id="supportArticleTags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="attendance, correction, timesheet"
          />
        </FormField>
      </div>

      <FormField
        label="Article summary"
        htmlFor="supportArticleSummary"
        error={
          submitted && !summary.trim() ? "Enter an article summary" : undefined
        }
      >
        <Textarea
          id="supportArticleSummary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Describe what this article helps employees complete..."
        />
      </FormField>

      <FormField
        label="Article content"
        htmlFor="supportArticleContent"
        error={
          submitted && !content.trim() ? "Enter article content" : undefined
        }
      >
        <Textarea
          id="supportArticleContent"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-48"
          placeholder="Write the complete employee guidance..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SUPPORT_ACTION_LABELS.cancel}
        </Button>
        <Button type="submit">
          {article ? "Save article" : "Create article"}
        </Button>
      </div>
    </form>
  );
}

function SettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: {
  settings?: SupportSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (settings: SupportSettings) => void;
}) {
  const [name, setName] = useState(settings?.name ?? "");
  const [scope, setScope] = useState<SupportScope>(
    settings?.scope ?? "organization",
  );
  const [branchId, setBranchId] = useState(
    settings?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );
  const [status, setStatus] = useState<SupportSettingsStatus>(
    settings?.status ?? "draft",
  );
  const [defaultPriority, setDefaultPriority] = useState<SupportTicketPriority>(
    settings?.defaultPriority ?? "medium",
  );
  const [defaultAssignee, setDefaultAssignee] = useState(
    settings?.defaultAssignee ?? "",
  );
  const [firstResponseHours, setFirstResponseHours] = useState(
    String(settings?.firstResponseHours ?? 4),
  );
  const [resolutionHours, setResolutionHours] = useState(
    String(settings?.resolutionHours ?? 24),
  );
  const [escalationEnabled, setEscalationEnabled] = useState(
    settings?.escalationEnabled ?? true,
  );
  const [escalationAfterHours, setEscalationAfterHours] = useState(
    String(settings?.escalationAfterHours ?? 8),
  );
  const [employeePortalEnabled, setEmployeePortalEnabled] = useState(
    settings?.employeePortalEnabled ?? true,
  );
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(
    settings?.knowledgeBaseEnabled ?? true,
  );
  const [satisfactionSurveyEnabled, setSatisfactionSurveyEnabled] = useState(
    settings?.satisfactionSurveyEnabled ?? true,
  );
  const [allowTicketReopen, setAllowTicketReopen] = useState(
    settings?.allowTicketReopen ?? true,
  );
  const [autoCloseResolvedDays, setAutoCloseResolvedDays] = useState(
    String(settings?.autoCloseResolvedDays ?? 3),
  );
  const [attachmentsEnabled, setAttachmentsEnabled] = useState(
    settings?.attachmentsEnabled ?? true,
  );
  const [maximumAttachmentMb, setMaximumAttachmentMb] = useState(
    String(settings?.maximumAttachmentMb ?? 10),
  );
  const [note, setNote] = useState(settings?.note ?? "");
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !name.trim() ||
      (scope === "branch" && !branchId) ||
      Number(firstResponseHours) <= 0 ||
      Number(resolutionHours) <= 0 ||
      Number(autoCloseResolvedDays) <= 0 ||
      Number(maximumAttachmentMb) <= 0 ||
      (escalationEnabled && Number(escalationAfterHours) <= 0)
    ) {
      return;
    }

    const branch = BRANCH_OPTIONS.find((item) => item.id === branchId);

    onSave({
      id: settings?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      defaultPriority,
      defaultAssignee: defaultAssignee.trim() || undefined,
      firstResponseHours: Number(firstResponseHours),
      resolutionHours: Number(resolutionHours),
      escalationEnabled,
      escalationAfterHours: escalationEnabled
        ? Number(escalationAfterHours)
        : 0,
      employeePortalEnabled,
      knowledgeBaseEnabled,
      satisfactionSurveyEnabled,
      allowTicketReopen,
      autoCloseResolvedDays: Number(autoCloseResolvedDays),
      attachmentsEnabled,
      maximumAttachmentMb: Number(maximumAttachmentMb),
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  const controls = [
    {
      label: "Employee support portal",
      description: "Allow employees to create and track support tickets.",
      checked: employeePortalEnabled,
      setChecked: setEmployeePortalEnabled,
    },
    {
      label: "Knowledge base",
      description:
        "Show published guidance in the employee support experience.",
      checked: knowledgeBaseEnabled,
      setChecked: setKnowledgeBaseEnabled,
    },
    {
      label: "Satisfaction surveys",
      description: "Request a rating after a ticket is resolved.",
      checked: satisfactionSurveyEnabled,
      setChecked: setSatisfactionSurveyEnabled,
    },
    {
      label: "Allow ticket reopening",
      description: "Permit resolved tickets to be reopened.",
      checked: allowTicketReopen,
      setChecked: setAllowTicketReopen,
    },
    {
      label: "Ticket attachments",
      description: "Allow supporting files on employee requests.",
      checked: attachmentsEnabled,
      setChecked: setAttachmentsEnabled,
    },
    {
      label: "SLA escalation",
      description: "Escalate unresolved tickets before targets are missed.",
      checked: escalationEnabled,
      setChecked: setEscalationEnabled,
    },
  ];

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Settings name"
          htmlFor="supportSettingsName"
          error={
            submitted && !name.trim() ? "Enter a settings name" : undefined
          }
        >
          <Input
            id="supportSettingsName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Organization Support Policy"
          />
        </FormField>

        <FormField label="Status" htmlFor="supportSettingsStatus">
          <Select
            id="supportSettingsStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SupportSettingsStatus)
            }
          >
            {Object.entries(SUPPORT_SETTINGS_STATUS_CONFIG).map(
              ([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ),
            )}
          </Select>
        </FormField>

        <FormField label="Scope" htmlFor="supportSettingsScope">
          <Select
            id="supportSettingsScope"
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
            htmlFor="supportSettingsBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="supportSettingsBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.filter((branch) => !branch.isAggregate).map(
                (branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ),
              )}
            </Select>
          </FormField>
        )}

        <FormField label="Default priority" htmlFor="supportSettingsPriority">
          <Select
            id="supportSettingsPriority"
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

        <FormField
          label="Default assignee"
          htmlFor="supportSettingsAssignee"
          optional
        >
          <Input
            id="supportSettingsAssignee"
            value={defaultAssignee}
            onChange={(event) => setDefaultAssignee(event.target.value)}
            placeholder="Example: People Operations"
          />
        </FormField>

        <FormField
          label="First response target"
          htmlFor="supportSettingsResponse"
          description="Target time in hours."
        >
          <Input
            id="supportSettingsResponse"
            type="number"
            min="1"
            value={firstResponseHours}
            onChange={(event) => setFirstResponseHours(event.target.value)}
          />
        </FormField>

        <FormField
          label="Resolution target"
          htmlFor="supportSettingsResolution"
          description="Target time in hours."
        >
          <Input
            id="supportSettingsResolution"
            type="number"
            min="1"
            value={resolutionHours}
            onChange={(event) => setResolutionHours(event.target.value)}
          />
        </FormField>

        {escalationEnabled && (
          <FormField
            label="Escalate after"
            htmlFor="supportSettingsEscalation"
            description="Hours before escalation."
          >
            <Input
              id="supportSettingsEscalation"
              type="number"
              min="1"
              value={escalationAfterHours}
              onChange={(event) => setEscalationAfterHours(event.target.value)}
            />
          </FormField>
        )}

        <FormField
          label="Auto-close resolved tickets"
          htmlFor="supportSettingsAutoClose"
          description="Days after resolution."
        >
          <Input
            id="supportSettingsAutoClose"
            type="number"
            min="1"
            value={autoCloseResolvedDays}
            onChange={(event) => setAutoCloseResolvedDays(event.target.value)}
          />
        </FormField>

        {attachmentsEnabled && (
          <FormField
            label="Maximum attachment size"
            htmlFor="supportSettingsAttachment"
            description="Maximum file size in MB."
          >
            <Input
              id="supportSettingsAttachment"
              type="number"
              min="1"
              value={maximumAttachmentMb}
              onChange={(event) => setMaximumAttachmentMb(event.target.value)}
            />
          </FormField>
        )}
      </div>

      <div className="space-y-3">
        {controls.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
          >
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-text-muted">{item.description}</p>
            </div>
            <Switch
              checked={item.checked}
              onCheckedChange={item.setChecked}
              ariaLabel={item.label}
            />
          </div>
        ))}
      </div>

      <FormField label="Internal note" htmlFor="supportSettingsNote" optional>
        <Textarea
          id="supportSettingsNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add service-level or branch workflow context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {SUPPORT_ACTION_LABELS.cancel}
        </Button>
        <Button type="submit">
          {settings ? "Save settings" : "Create settings"}
        </Button>
      </div>
    </form>
  );
}

function updateTicketRecord(
  tickets: SupportTicket[],
  ticketId: string,
  status: SupportTicketStatus,
) {
  const actionTime = new Date().toISOString();

  return tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
          ...ticket,
          status,
          assignedTo: ticket.assignedTo ?? CURRENT_ADMIN.name,
          firstRespondedAt:
            ticket.firstRespondedAt ??
            (status !== "open" ? actionTime : undefined),
          resolvedAt:
            status === "resolved"
              ? actionTime
              : status === "open" || status === "in_progress"
                ? undefined
                : ticket.resolvedAt,
          closedAt: status === "closed" ? actionTime : undefined,
          updatedAt: actionTime,
        }
      : ticket,
  );
}

function TicketDrawerFooter({
  ticket,
  onEdit,
  onAssign,
  onStatus,
}: {
  ticket: SupportTicket;
  onEdit?: () => void;
  onAssign: () => void;
  onStatus: (status: SupportTicketStatus) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      {onEdit && (
        <Button variant="outline" onClick={onEdit}>
          <FilePenLine />
          {SUPPORT_ACTION_LABELS.edit}
        </Button>
      )}

      {!ticket.assignedTo && (
        <Button variant="outline" onClick={onAssign}>
          <UserCheck />
          {SUPPORT_ACTION_LABELS.assignToMe}
        </Button>
      )}

      {ticket.status === "open" && (
        <Button onClick={() => onStatus("in_progress")}>
          {SUPPORT_ACTION_LABELS.startProgress}
        </Button>
      )}

      {ticket.status === "in_progress" && (
        <>
          <Button
            variant="outline"
            onClick={() => onStatus("waiting_requester")}
          >
            {SUPPORT_ACTION_LABELS.waitForRequester}
          </Button>
          <Button onClick={() => onStatus("resolved")}>
            <CheckCircle2 />
            {SUPPORT_ACTION_LABELS.resolve}
          </Button>
        </>
      )}

      {ticket.status === "waiting_requester" && (
        <>
          <Button variant="outline" onClick={() => onStatus("in_progress")}>
            {SUPPORT_ACTION_LABELS.resume}
          </Button>
          <Button onClick={() => onStatus("resolved")}>
            <CheckCircle2 />
            {SUPPORT_ACTION_LABELS.resolve}
          </Button>
        </>
      )}

      {ticket.status === "resolved" && (
        <>
          <Button variant="outline" onClick={() => onStatus("in_progress")}>
            {SUPPORT_ACTION_LABELS.reopen}
          </Button>
          <Button onClick={() => onStatus("closed")}>
            {SUPPORT_ACTION_LABELS.close}
          </Button>
        </>
      )}

      {ticket.status === "closed" && (
        <Button variant="outline" onClick={() => onStatus("in_progress")}>
          {SUPPORT_ACTION_LABELS.reopen}
        </Button>
      )}
    </div>
  );
}

export function SupportOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const scopedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          selectedBranch.isAggregate || ticket.branchId === selectedBranch.id,
      ),
    [selectedBranch, tickets],
  );

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const activeTickets = scopedTickets.filter(
    (ticket) => !["resolved", "closed"].includes(ticket.status),
  );
  const urgentTickets = activeTickets.filter(
    (ticket) => ticket.priority === "urgent",
  );
  const slaAttention = activeTickets.filter((ticket) =>
    ["at_risk", "overdue"].includes(getSupportSlaState(ticket)),
  );
  const completedTickets = scopedTickets.filter((ticket) =>
    ["resolved", "closed"].includes(ticket.status),
  );
  const onTimeCount = completedTickets.filter(
    (ticket) => getSupportSlaState(ticket) === "met",
  ).length;
  const slaRate = completedTickets.length
    ? Math.round((onTimeCount / completedTickets.length) * 100)
    : 0;

  const attentionQueue = activeTickets
    .filter(
      (ticket) =>
        ticket.priority === "urgent" ||
        ["at_risk", "overdue"].includes(getSupportSlaState(ticket)),
    )
    .sort((first, second) => first.dueAt.localeCompare(second.dueAt));

  const recentTickets = [...scopedTickets]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 6);

  const metrics = [
    {
      label: "Open tickets",
      value: String(activeTickets.length),
      detail: selectedBranch.name,
      icon: Ticket,
      tone: "info" as const,
    },
    {
      label: "Urgent requests",
      value: String(urgentTickets.length),
      detail: "Requires priority action",
      icon: AlertTriangle,
      tone: "danger" as const,
    },
    {
      label: "SLA attention",
      value: String(slaAttention.length),
      detail: "At risk or overdue",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
    {
      label: "SLA success",
      value: `${slaRate}%`,
      detail: "Resolved within target",
      icon: CheckCircle2,
      tone: "success" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<SupportTicket>[]>(
    () => [
      {
        id: "ticket",
        header: "Ticket",
        cell: (ticket) => (
          <div>
            <p className="font-semibold">{ticket.ticketNumber}</p>
            <p className="mt-1 max-w-64 truncate text-xs text-text-muted">
              {ticket.title}
            </p>
          </div>
        ),
      },
      {
        id: "employee",
        header: "Employee",
        cell: (ticket) => {
          const employee = EMPLOYEES.find(
            (item) => item.id === ticket.employeeId,
          );

          return employee ? (
            <div className="flex items-center gap-3">
              <Avatar name={employee.name} initials={employee.initials} />
              <div>
                <p className="font-semibold">{employee.name}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {employee.employeeCode}
                </p>
              </div>
            </div>
          ) : (
            "Unknown employee"
          );
        },
      },
      {
        id: "priority",
        header: "Priority",
        cell: (ticket) => (
          <Badge
            variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}
          >
            {SUPPORT_PRIORITY_CONFIG[ticket.priority].label}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (ticket) => (
          <Badge
            variant={SUPPORT_TICKET_STATUS_CONFIG[ticket.status].badgeVariant}
          >
            {SUPPORT_TICKET_STATUS_CONFIG[ticket.status].label}
          </Badge>
        ),
      },
      {
        id: "sla",
        header: "SLA",
        cell: (ticket) => {
          const state = getSupportSlaState(ticket);
          return (
            <Badge variant={SUPPORT_SLA_CONFIG[state].badgeVariant}>
              {SUPPORT_SLA_CONFIG[state].label}
            </Badge>
          );
        },
      },
      {
        id: "created",
        header: "Created",
        cell: (ticket) => formatSupportDateTime(ticket.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        headClassName: "w-16",
        cell: (ticket) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${ticket.ticketNumber}`}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedTicketId(ticket.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveTicket(ticket: SupportTicket) {
    setTickets((current) => {
      const exists = current.some((item) => item.id === ticket.id);
      return exists
        ? current.map((item) => (item.id === ticket.id ? ticket : item))
        : [ticket, ...current];
    });
    setCreateOpen(false);
    setSelectedTicketId(ticket.id);
  }

  function assignSelected() {
    if (!selectedTicket) return;
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              assignedTo: CURRENT_ADMIN.name,
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    );
  }

  const employeeNames = Object.fromEntries(
    EMPLOYEES.map((employee) => [employee.id, employee.name]),
  );
  const categoryNames = Object.fromEntries(
    SUPPORT_CATEGORIES.map((category) => [category.id, category.name]),
  );

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.overview.eyebrow}
        title={SUPPORT_COPY.overview.title}
        description={SUPPORT_COPY.overview.description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                exportSupportTickets(
                  scopedTickets,
                  employeeNames,
                  categoryNames,
                )
              }
            >
              <Download />
              {SUPPORT_COPY.overview.exportAction}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              {SUPPORT_COPY.overview.createAction}
            </Button>
          </>
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard
          title={SUPPORT_COPY.overview.chartTitle}
          description={SUPPORT_COPY.overview.chartDescription}
        >
          <SupportVolumeChart
            data={
              SUPPORT_VOLUME_TRENDS[selectedBranchId] ??
              SUPPORT_VOLUME_TRENDS.all
            }
          />
        </ChartCard>

        <Card className="h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <Headphones size={19} />
            </span>
            <div>
              <h2 className="text-lg font-bold">
                {SUPPORT_COPY.overview.queueTitle}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {SUPPORT_COPY.overview.queueDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {attentionQueue.length > 0 ? (
              attentionQueue.map((ticket) => {
                const employee = EMPLOYEES.find(
                  (item) => item.id === ticket.employeeId,
                );
                const slaState = getSupportSlaState(ticket);

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{ticket.title}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {employee?.name ?? "Unknown employee"}
                        </p>
                      </div>
                      <Badge
                        variant={SUPPORT_SLA_CONFIG[slaState].badgeVariant}
                      >
                        {SUPPORT_SLA_CONFIG[slaState].label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Badge
                        variant={
                          SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant
                        }
                      >
                        {SUPPORT_PRIORITY_CONFIG[ticket.priority].label}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {formatSupportDateTime(ticket.dueAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-control bg-success-muted p-4 text-sm font-medium text-success">
                No support tickets currently require escalation.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {SUPPORT_COPY.overview.tableTitle}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {SUPPORT_COPY.overview.tableDescription}
          </p>
        </div>
        <DataTable
          rows={recentTickets}
          columns={columns}
          getRowKey={(ticket) => ticket.id}
          onRowClick={(ticket) => setSelectedTicketId(ticket.id)}
          emptyState={
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <Ticket className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">No support tickets available</h3>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicketId(null)}
        title="Support ticket"
        description={selectedTicket?.ticketNumber}
        footer={
          selectedTicket ? (
            <TicketDrawerFooter
              ticket={selectedTicket}
              onAssign={assignSelected}
              onStatus={(status) =>
                setTickets((current) =>
                  updateTicketRecord(current, selectedTicket.id, status),
                )
              }
            />
          ) : undefined
        }
      >
        {selectedTicket && <TicketDetails ticket={selectedTicket} />}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New support ticket"
        description="Record an employee request and assign its service-level target."
      >
        <TicketForm
          selectedBranchId={selectedBranchId}
          onCancel={() => setCreateOpen(false)}
          onSave={saveTicket}
        />
      </Drawer>
    </div>
  );
}

export function SupportTicketsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          selectedBranch.isAggregate || ticket.branchId === selectedBranch.id,
      ),
    [selectedBranch, tickets],
  );

  const visibleTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedTickets.filter((ticket) => {
      const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);
      const category = SUPPORT_CATEGORIES.find(
        (item) => item.id === ticket.categoryId,
      );
      const searchable = [
        ticket.ticketNumber,
        ticket.title,
        ticket.description,
        ticket.assignedTo,
        employee?.name,
        employee?.employeeCode,
        employee?.department,
        category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "all" || ticket.status === statusFilter) &&
        (priorityFilter === "all" || ticket.priority === priorityFilter) &&
        (categoryFilter === "all" || ticket.categoryId === categoryFilter) &&
        (slaFilter === "all" || getSupportSlaState(ticket) === slaFilter)
      );
    });
  }, [
    categoryFilter,
    priorityFilter,
    scopedTickets,
    searchQuery,
    slaFilter,
    statusFilter,
  ]);

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const categories = SUPPORT_CATEGORIES.filter(
    (category) =>
      category.status === "active" &&
      (selectedBranch.isAggregate ||
        category.scope === "organization" ||
        category.branchId === selectedBranch.id),
  );

  const columns = useMemo<DataTableColumn<SupportTicket>[]>(
    () => [
      {
        id: "ticket",
        header: "Ticket",
        cell: (ticket) => (
          <div>
            <p className="font-semibold">{ticket.ticketNumber}</p>
            <p className="mt-1 max-w-72 truncate text-xs text-text-muted">
              {ticket.title}
            </p>
          </div>
        ),
      },
      {
        id: "requester",
        header: "Requester",
        cell: (ticket) => {
          const employee = EMPLOYEES.find(
            (item) => item.id === ticket.employeeId,
          );
          return employee ? (
            <div className="flex items-center gap-3">
              <Avatar name={employee.name} initials={employee.initials} />
              <div>
                <p className="font-semibold">{employee.name}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {employee.employeeCode} · {employee.department}
                </p>
              </div>
            </div>
          ) : (
            "Unknown employee"
          );
        },
      },
      {
        id: "category",
        header: "Category",
        cell: (ticket) =>
          SUPPORT_CATEGORIES.find(
            (category) => category.id === ticket.categoryId,
          )?.name ?? "Unassigned",
      },
      {
        id: "priority",
        header: "Priority",
        cell: (ticket) => (
          <Badge
            variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}
          >
            {SUPPORT_PRIORITY_CONFIG[ticket.priority].label}
          </Badge>
        ),
      },
      {
        id: "assignee",
        header: "Assigned to",
        cell: (ticket) => ticket.assignedTo ?? "Unassigned",
      },
      {
        id: "sla",
        header: "SLA",
        cell: (ticket) => {
          const state = getSupportSlaState(ticket);
          return (
            <Badge variant={SUPPORT_SLA_CONFIG[state].badgeVariant}>
              {SUPPORT_SLA_CONFIG[state].label}
            </Badge>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: (ticket) => (
          <Badge
            variant={SUPPORT_TICKET_STATUS_CONFIG[ticket.status].badgeVariant}
          >
            {SUPPORT_TICKET_STATUS_CONFIG[ticket.status].label}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headClassName: "w-16",
        cell: (ticket) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${ticket.ticketNumber}`}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedTicketId(ticket.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [],
  );

  function saveTicket(ticket: SupportTicket) {
    setTickets((current) => {
      const exists = current.some((item) => item.id === ticket.id);
      return exists
        ? current.map((item) => (item.id === ticket.id ? ticket : item))
        : [ticket, ...current];
    });
    setEditorMode(null);
    setSelectedTicketId(ticket.id);
  }

  function assignSelected() {
    if (!selectedTicket) return;
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              assignedTo: CURRENT_ADMIN.name,
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    );
  }

  const employeeNames = Object.fromEntries(
    EMPLOYEES.map((employee) => [employee.id, employee.name]),
  );
  const categoryNames = Object.fromEntries(
    SUPPORT_CATEGORIES.map((category) => [category.id, category.name]),
  );

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.tickets.eyebrow}
        title={SUPPORT_COPY.tickets.title}
        description={SUPPORT_COPY.tickets.description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                exportSupportTickets(
                  visibleTickets,
                  employeeNames,
                  categoryNames,
                )
              }
            >
              <Download />
              {SUPPORT_COPY.tickets.exportAction}
            </Button>
            <Button
              onClick={() => {
                setSelectedTicketId(null);
                setEditorMode("create");
              }}
            >
              <Plus />
              {SUPPORT_COPY.tickets.createAction}
            </Button>
          </>
        }
      />

      <div className="mt-7">
        <SupportTabs />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">
            {SUPPORT_COPY.tickets.registerTitle}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {SUPPORT_COPY.tickets.registerDescription}
          </p>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_12rem_12rem_14rem_12rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={SUPPORT_COPY.tickets.searchPlaceholder}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.tickets.allStatuses}</option>
              {Object.entries(SUPPORT_TICKET_STATUS_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.tickets.allPriorities}</option>
              {Object.entries(SUPPORT_PRIORITY_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>

            <Select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.tickets.allCategories}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              value={slaFilter}
              onChange={(event) => setSlaFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.tickets.allSlaStates}</option>
              {Object.entries(SUPPORT_SLA_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleTickets}
          columns={columns}
          getRowKey={(ticket) => ticket.id}
          onRowClick={(ticket) => setSelectedTicketId(ticket.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">
                {SUPPORT_COPY.tickets.emptyTitle}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {SUPPORT_COPY.tickets.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicketId(null)}
        title="Support ticket"
        description={selectedTicket?.ticketNumber}
        footer={
          selectedTicket ? (
            <TicketDrawerFooter
              ticket={selectedTicket}
              onEdit={() => setEditorMode("edit")}
              onAssign={assignSelected}
              onStatus={(status) =>
                setTickets((current) =>
                  updateTicketRecord(current, selectedTicket.id, status),
                )
              }
            />
          ) : undefined
        }
      >
        {selectedTicket && <TicketDetails ticket={selectedTicket} />}
      </Drawer>

      <Drawer
        open={editorMode !== null}
        onClose={() => setEditorMode(null)}
        title={
          editorMode === "create" ? "New support ticket" : "Edit support ticket"
        }
        description="Record the employee request, routing, priority and service-level target."
      >
        {editorMode && (
          <TicketForm
            key={
              editorMode === "create"
                ? "new-support-ticket"
                : selectedTicket?.id
            }
            ticket={
              editorMode === "edit" ? (selectedTicket ?? undefined) : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveTicket}
          />
        )}
      </Drawer>
    </div>
  );
}

export function SupportCategoriesWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [categories, setCategories] =
    useState<SupportCategory[]>(SUPPORT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
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

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;

  const activeCategories = scopedCategories.filter(
    (category) => category.status === "active",
  );
  const branchOverrides = scopedCategories.filter(
    (category) => category.scope === "branch",
  );
  const employeeVisible = activeCategories.filter(
    (category) => category.employeeVisible,
  );
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
          <Badge
            variant={
              SUPPORT_PRIORITY_CONFIG[category.defaultPriority].badgeVariant
            }
          >
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
          <Badge
            variant={
              SUPPORT_CATEGORY_STATUS_CONFIG[category.status].badgeVariant
            }
          >
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
    setSelectedCategoryId(category.id);
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
    setSelectedCategoryId(duplicate.id);
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
              setSelectedCategoryId(null);
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
          <h2 className="text-lg font-bold">
            {SUPPORT_COPY.categories.registerTitle}
          </h2>
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
              {Object.entries(SUPPORT_CATEGORY_STATUS_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleCategories}
          columns={columns}
          getRowKey={(category) => category.id}
          onRowClick={(category) => setSelectedCategoryId(category.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <Tags className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">
                {SUPPORT_COPY.categories.emptyTitle}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {SUPPORT_COPY.categories.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedCategory)}
        onClose={() => setSelectedCategoryId(null)}
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
                <Button
                  variant="outline"
                  onClick={() => updateStatus("inactive")}
                >
                  {SUPPORT_ACTION_LABELS.deactivate}
                </Button>
              )}
              {selectedCategory.status !== "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("active")}
                >
                  <CheckCircle2 />
                  {SUPPORT_ACTION_LABELS.activate}
                </Button>
              )}
              {selectedCategory.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("archived")}
                >
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
                    SUPPORT_CATEGORY_STATUS_CONFIG[selectedCategory.status]
                      .badgeVariant
                  }
                >
                  {
                    SUPPORT_CATEGORY_STATUS_CONFIG[selectedCategory.status]
                      .label
                  }
                </Badge>
              </div>
              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Code</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCategory.code}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Scope</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {SUPPORT_SCOPE_CONFIG[selectedCategory.scope].label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Default assignee</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCategory.defaultAssignee ?? "Unassigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Resolution</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedCategory.resolutionHours} hours
                  </dd>
                </div>
              </dl>
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
        title={
          editorMode === "create"
            ? "Add support category"
            : "Edit support category"
        }
        description="Configure routing, service levels and employee visibility."
      >
        {editorMode && (
          <CategoryForm
            key={
              editorMode === "create"
                ? "new-support-category"
                : selectedCategory?.id
            }
            category={
              editorMode === "edit"
                ? (selectedCategory ?? undefined)
                : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveCategory}
          />
        )}
      </Drawer>
    </div>
  );
}

export function SupportKnowledgeBaseWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [articles, setArticles] = useState<SupportArticle[]>(SUPPORT_ARTICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedArticles = useMemo(
    () =>
      articles.filter(
        (article) =>
          selectedBranch.isAggregate ||
          article.scope === "organization" ||
          article.branchId === selectedBranch.id,
      ),
    [articles, selectedBranch],
  );

  const visibleArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scopedArticles.filter((article) => {
      const category = SUPPORT_CATEGORIES.find(
        (item) => item.id === article.categoryId,
      );
      const searchable = [
        article.title,
        article.summary,
        article.updatedBy,
        article.tags.join(" "),
        category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "all" || article.status === statusFilter) &&
        (visibilityFilter === "all" || article.visibility === visibilityFilter)
      );
    });
  }, [scopedArticles, searchQuery, statusFilter, visibilityFilter]);

  const selectedArticle =
    articles.find((article) => article.id === selectedArticleId) ?? null;
  const publishedArticles = scopedArticles.filter(
    (article) => article.status === "published",
  );
  const draftArticles = scopedArticles.filter(
    (article) => article.status === "draft",
  );
  const totalHelpful = publishedArticles.reduce(
    (total, article) => total + article.helpfulCount,
    0,
  );
  const totalFeedback = publishedArticles.reduce(
    (total, article) => total + article.helpfulCount + article.notHelpfulCount,
    0,
  );
  const helpfulRate = totalFeedback
    ? Math.round((totalHelpful / totalFeedback) * 100)
    : 0;
  const employeeArticles = publishedArticles.filter(
    (article) => article.visibility === "employees",
  );

  const metrics = [
    {
      label: "Published articles",
      value: String(publishedArticles.length),
      detail: selectedBranch.name,
      icon: BookOpen,
      tone: "success" as const,
    },
    {
      label: "Draft articles",
      value: String(draftArticles.length),
      detail: "Waiting for publication",
      icon: FilePenLine,
      tone: "warning" as const,
    },
    {
      label: "Employee guidance",
      value: String(employeeArticles.length),
      detail: "Visible to all employees",
      icon: Eye,
      tone: "info" as const,
    },
    {
      label: "Helpful feedback",
      value: `${helpfulRate}%`,
      detail: "Across published articles",
      icon: ThumbsUp,
      tone: "success" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<SupportArticle>[]>(
    () => [
      {
        id: "article",
        header: "Article",
        cell: (article) => (
          <div>
            <p className="font-semibold">{article.title}</p>
            <p className="mt-1 max-w-80 truncate text-xs text-text-muted">
              {article.summary}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: (article) =>
          SUPPORT_CATEGORIES.find(
            (category) => category.id === article.categoryId,
          )?.name ?? "Unassigned",
      },
      {
        id: "scope",
        header: "Scope",
        cell: (article) => (
          <Badge variant={SUPPORT_SCOPE_CONFIG[article.scope].badgeVariant}>
            {SUPPORT_SCOPE_CONFIG[article.scope].label}
          </Badge>
        ),
      },
      {
        id: "visibility",
        header: "Visibility",
        cell: (article) => (
          <Badge
            variant={
              SUPPORT_ARTICLE_VISIBILITY_CONFIG[article.visibility].badgeVariant
            }
          >
            {SUPPORT_ARTICLE_VISIBILITY_CONFIG[article.visibility].label}
          </Badge>
        ),
      },
      {
        id: "helpful",
        header: "Helpful",
        cell: (article) =>
          article.status === "published"
            ? `${article.helpfulCount} / ${
                article.helpfulCount + article.notHelpfulCount
              }`
            : "Not published",
      },
      {
        id: "updated",
        header: "Updated",
        cell: (article) => formatDate(article.updatedAt),
      },
      {
        id: "status",
        header: "Status",
        cell: (article) => (
          <Badge
            variant={SUPPORT_ARTICLE_STATUS_CONFIG[article.status].badgeVariant}
          >
            {SUPPORT_ARTICLE_STATUS_CONFIG[article.status].label}
          </Badge>
        ),
      },
    ],
    [],
  );

  function saveArticle(article: SupportArticle) {
    setArticles((current) => {
      const exists = current.some((item) => item.id === article.id);
      return exists
        ? current.map((item) => (item.id === article.id ? article : item))
        : [article, ...current];
    });
    setEditorMode(null);
    setSelectedArticleId(article.id);
  }

  function updateStatus(status: SupportArticle["status"]) {
    if (!selectedArticle) return;
    const actionDate = new Date().toISOString().slice(0, 10);
    setArticles((current) =>
      current.map((article) =>
        article.id === selectedArticle.id
          ? {
              ...article,
              status,
              publishedAt:
                status === "published"
                  ? (article.publishedAt ?? actionDate)
                  : undefined,
              updatedAt: actionDate,
              updatedBy: CURRENT_ADMIN.name,
            }
          : article,
      ),
    );
  }

  function duplicateArticle() {
    if (!selectedArticle) return;
    const duplicate: SupportArticle = {
      ...selectedArticle,
      id: crypto.randomUUID(),
      title: `${selectedArticle.title} Copy`,
      slug: `${selectedArticle.slug}-copy`,
      status: "draft",
      publishedAt: undefined,
      helpfulCount: 0,
      notHelpfulCount: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };
    setArticles((current) => [duplicate, ...current]);
    setSelectedArticleId(duplicate.id);
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.knowledge.eyebrow}
        title={SUPPORT_COPY.knowledge.title}
        description={SUPPORT_COPY.knowledge.description}
        actions={
          <Button
            onClick={() => {
              setSelectedArticleId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {SUPPORT_COPY.knowledge.createAction}
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
          <h2 className="text-lg font-bold">
            {SUPPORT_COPY.knowledge.registerTitle}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {SUPPORT_COPY.knowledge.registerDescription}
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={SUPPORT_COPY.knowledge.searchPlaceholder}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.knowledge.allStatuses}</option>
              {Object.entries(SUPPORT_ARTICLE_STATUS_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>
            <Select
              value={visibilityFilter}
              onChange={(event) => setVisibilityFilter(event.target.value)}
            >
              <option value="all">
                {SUPPORT_COPY.knowledge.allVisibility}
              </option>
              {Object.entries(SUPPORT_ARTICLE_VISIBILITY_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        <DataTable
          rows={visibleArticles}
          columns={columns}
          getRowKey={(article) => article.id}
          onRowClick={(article) => setSelectedArticleId(article.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <BookOpen className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">
                {SUPPORT_COPY.knowledge.emptyTitle}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {SUPPORT_COPY.knowledge.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedArticle)}
        onClose={() => setSelectedArticleId(null)}
        title="Knowledge article"
        description={selectedArticle?.title}
        footer={
          selectedArticle ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateArticle}>
                <Copy />
                {SUPPORT_ACTION_LABELS.duplicate}
              </Button>
              {selectedArticle.status === "draft" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("published")}
                >
                  <CheckCircle2 />
                  {SUPPORT_ACTION_LABELS.publish}
                </Button>
              )}
              {selectedArticle.status === "published" && (
                <Button variant="outline" onClick={() => updateStatus("draft")}>
                  {SUPPORT_ACTION_LABELS.unpublish}
                </Button>
              )}
              {selectedArticle.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("archived")}
                >
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
        {selectedArticle && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedArticle.title}</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    /support/{selectedArticle.slug}
                  </p>
                </div>
                <Badge
                  variant={
                    SUPPORT_ARTICLE_STATUS_CONFIG[selectedArticle.status]
                      .badgeVariant
                  }
                >
                  {SUPPORT_ARTICLE_STATUS_CONFIG[selectedArticle.status].label}
                </Badge>
              </div>
              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Category</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {SUPPORT_CATEGORIES.find(
                      (category) => category.id === selectedArticle.categoryId,
                    )?.name ?? "Unassigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Visibility</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {
                      SUPPORT_ARTICLE_VISIBILITY_CONFIG[
                        selectedArticle.visibility
                      ].label
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Updated</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatDate(selectedArticle.updatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Updated by</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedArticle.updatedBy}
                  </dd>
                </div>
              </dl>
            </section>
            <section>
              <h3 className="text-sm font-bold">Summary</h3>
              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedArticle.summary}
              </p>
            </section>
            <section>
              <h3 className="text-sm font-bold">Article content</h3>
              <p className="mt-2 whitespace-pre-wrap rounded-control bg-canvas p-4 text-sm leading-7 text-text-muted">
                {selectedArticle.content}
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
            ? "Add knowledge article"
            : "Edit knowledge article"
        }
        description="Create reusable employee guidance with controlled scope and visibility."
      >
        {editorMode && (
          <ArticleForm
            key={
              editorMode === "create"
                ? "new-support-article"
                : selectedArticle?.id
            }
            article={
              editorMode === "edit" ? (selectedArticle ?? undefined) : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveArticle}
          />
        )}
      </Drawer>
    </div>
  );
}

export function SupportSettingsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [settings, setSettings] = useState<SupportSettings[]>(SUPPORT_SETTINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedSettingsId, setSelectedSettingsId] = useState<string | null>(
    null,
  );
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedSettings = useMemo(
    () =>
      settings.filter(
        (item) =>
          selectedBranch.isAggregate ||
          item.scope === "organization" ||
          item.branchId === selectedBranch.id,
      ),
    [selectedBranch, settings],
  );

  const visibleSettings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scopedSettings.filter((item) => {
      const searchable = [item.name, item.branchName, item.defaultAssignee]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (scopeFilter === "all" || item.scope === scopeFilter)
      );
    });
  }, [scopedSettings, scopeFilter, searchQuery, statusFilter]);

  const selectedSettings =
    settings.find((item) => item.id === selectedSettingsId) ?? null;

  const organizationDefault =
    settings.find(
      (item) => item.scope === "organization" && item.status === "active",
    ) ?? null;
  const branchOverride = selectedBranch.isAggregate
    ? null
    : (settings.find(
        (item) =>
          item.scope === "branch" &&
          item.branchId === selectedBranch.id &&
          item.status === "active",
      ) ?? null);
  const effectiveSettings = branchOverride ?? organizationDefault;

  const activeSettings = scopedSettings.filter(
    (item) => item.status === "active",
  );
  const branchOverrides = scopedSettings.filter(
    (item) => item.scope === "branch",
  );
  const portalEnabled = scopedSettings.filter(
    (item) => item.employeePortalEnabled,
  );
  const averageResolution = activeSettings.length
    ? Math.round(
        activeSettings.reduce(
          (total, item) => total + item.resolutionHours,
          0,
        ) / activeSettings.length,
      )
    : 0;

  const metrics = [
    {
      label: "Active settings",
      value: String(activeSettings.length),
      detail: selectedBranch.name,
      icon: Settings2,
      tone: "success" as const,
    },
    {
      label: "Branch overrides",
      value: String(branchOverrides.length),
      detail: "Custom branch workflows",
      icon: Building2,
      tone: "info" as const,
    },
    {
      label: "Portal enabled",
      value: String(portalEnabled.length),
      detail: "Settings with employee access",
      icon: Globe2,
      tone: "info" as const,
    },
    {
      label: "Average resolution",
      value: `${averageResolution}h`,
      detail: "Across active settings",
      icon: ShieldCheck,
      tone: "warning" as const,
    },
  ];

  const columns = useMemo<DataTableColumn<SupportSettings>[]>(
    () => [
      {
        id: "settings",
        header: "Settings",
        cell: (item) => (
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              {item.scope === "organization" ? (
                <Globe2 size={18} />
              ) : (
                <Building2 size={18} />
              )}
            </span>
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-text-muted">
                {item.branchName ?? "All organization branches"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "scope",
        header: "Scope",
        cell: (item) => (
          <Badge variant={SUPPORT_SCOPE_CONFIG[item.scope].badgeVariant}>
            {SUPPORT_SCOPE_CONFIG[item.scope].label}
          </Badge>
        ),
      },
      {
        id: "priority",
        header: "Default priority",
        cell: (item) => (
          <Badge
            variant={SUPPORT_PRIORITY_CONFIG[item.defaultPriority].badgeVariant}
          >
            {SUPPORT_PRIORITY_CONFIG[item.defaultPriority].label}
          </Badge>
        ),
      },
      {
        id: "assignee",
        header: "Default assignee",
        cell: (item) => item.defaultAssignee ?? "Unassigned",
      },
      {
        id: "response",
        header: "First response",
        cell: (item) => `${item.firstResponseHours} hours`,
      },
      {
        id: "resolution",
        header: "Resolution",
        cell: (item) => `${item.resolutionHours} hours`,
      },
      {
        id: "status",
        header: "Status",
        cell: (item) => (
          <Badge
            variant={SUPPORT_SETTINGS_STATUS_CONFIG[item.status].badgeVariant}
          >
            {SUPPORT_SETTINGS_STATUS_CONFIG[item.status].label}
          </Badge>
        ),
      },
    ],
    [],
  );

  function saveSettings(nextSettings: SupportSettings) {
    setSettings((current) => {
      const exists = current.some((item) => item.id === nextSettings.id);
      return exists
        ? current.map((item) =>
            item.id === nextSettings.id ? nextSettings : item,
          )
        : [nextSettings, ...current];
    });
    setEditorMode(null);
    setSelectedSettingsId(nextSettings.id);
  }

  function updateStatus(status: SupportSettings["status"]) {
    if (!selectedSettings) return;
    setSettings((current) =>
      current.map((item) =>
        item.id === selectedSettings.id
          ? {
              ...item,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: CURRENT_ADMIN.name,
            }
          : item,
      ),
    );
  }

  function duplicateSettings() {
    if (!selectedSettings) return;
    const duplicate: SupportSettings = {
      ...selectedSettings,
      id: crypto.randomUUID(),
      name: `${selectedSettings.name} Copy`,
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
    };
    setSettings((current) => [duplicate, ...current]);
    setSelectedSettingsId(duplicate.id);
  }

  const effectiveControls = effectiveSettings
    ? SUPPORT_SETTINGS_CONTROLS.map((control) => ({
        label: control.label,
        enabled: Boolean(effectiveSettings[control.key]),
      }))
    : [];

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow={SUPPORT_COPY.settings.eyebrow}
        title={SUPPORT_COPY.settings.title}
        description={SUPPORT_COPY.settings.description}
        actions={
          <Button
            onClick={() => {
              setSelectedSettingsId(null);
              setEditorMode("create");
            }}
          >
            <Plus />
            {SUPPORT_COPY.settings.createAction}
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="order-1 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">
              {SUPPORT_COPY.settings.registerTitle}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {SUPPORT_COPY.settings.registerDescription}
            </p>
            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={SUPPORT_COPY.settings.searchPlaceholder}
                  className="pl-9"
                />
              </div>
              <Select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="all">{SUPPORT_COPY.settings.allScopes}</option>
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
                <option value="all">{SUPPORT_COPY.settings.allStatuses}</option>
                {Object.entries(SUPPORT_SETTINGS_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </div>

          <DataTable
            rows={visibleSettings}
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => setSelectedSettingsId(item.id)}
            emptyState={
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <Settings2 className="size-8 text-text-muted" />
                <h3 className="mt-4 font-bold">
                  {SUPPORT_COPY.settings.emptyTitle}
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  {SUPPORT_COPY.settings.emptyDescription}
                </p>
              </div>
            }
          />
        </Card>

        <Card className="order-2 h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
              <CheckCircle2 size={19} />
            </span>
            <div>
              <h2 className="text-lg font-bold">
                {SUPPORT_COPY.settings.effectiveTitle}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {SUPPORT_COPY.settings.effectiveDescription}
              </p>
            </div>
          </div>

          {effectiveSettings ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-control border border-border p-4">
                <p className="text-sm font-bold">{effectiveSettings.name}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {branchOverride
                    ? "Active branch override"
                    : "Organization default"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">First response</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.firstResponseHours} hours
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Resolution</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.resolutionHours} hours
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Auto-close</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.autoCloseResolvedDays} days
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-4">
                  <p className="text-xs text-text-muted">Attachment limit</p>
                  <p className="mt-1 text-sm font-bold">
                    {effectiveSettings.maximumAttachmentMb} MB
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                {effectiveControls.map((control) => (
                  <div
                    key={control.label}
                    className="flex items-center justify-between rounded-control border border-border px-4 py-3"
                  >
                    <span className="text-sm font-medium">{control.label}</span>
                    <Badge variant={control.enabled ? "success" : "neutral"}>
                      {control.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-control bg-warning-muted p-4 text-sm font-medium text-warning">
              No active organization support settings are available.
            </p>
          )}
        </Card>
      </section>

      <Drawer
        open={Boolean(selectedSettings)}
        onClose={() => setSelectedSettingsId(null)}
        title="Support settings"
        description={selectedSettings?.name}
        footer={
          selectedSettings ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={duplicateSettings}>
                <Copy />
                {SUPPORT_ACTION_LABELS.duplicate}
              </Button>
              {selectedSettings.status === "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("archived")}
                >
                  <Archive />
                  {SUPPORT_ACTION_LABELS.archive}
                </Button>
              )}
              {selectedSettings.status !== "active" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("active")}
                >
                  <CheckCircle2 />
                  {SUPPORT_ACTION_LABELS.activate}
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
        {selectedSettings && (
          <div className="space-y-6">
            <section className="rounded-card border border-border">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <h3 className="font-bold">{selectedSettings.name}</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Updated by {selectedSettings.updatedBy} on{" "}
                    {formatDate(selectedSettings.updatedAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    SUPPORT_SETTINGS_STATUS_CONFIG[selectedSettings.status]
                      .badgeVariant
                  }
                >
                  {
                    SUPPORT_SETTINGS_STATUS_CONFIG[selectedSettings.status]
                      .label
                  }
                </Badge>
              </div>
              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Scope</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {SUPPORT_SCOPE_CONFIG[selectedSettings.scope].label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Branch</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.branchName ?? "All organization branches"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Default assignee</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.defaultAssignee ?? "Unassigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Resolution</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {selectedSettings.resolutionHours} hours
                  </dd>
                </div>
              </dl>
            </section>
            <section>
              <h3 className="text-sm font-bold">Support controls</h3>
              <div className="mt-3 space-y-3">
                {SUPPORT_SETTINGS_CONTROLS.map((control) => {
                  const enabled = Boolean(selectedSettings[control.key]);
                  return (
                    <div
                      key={control.key}
                      className="flex items-center justify-between rounded-control border border-border p-4"
                    >
                      <span className="text-sm font-semibold">
                        {control.label}
                      </span>
                      <Badge variant={enabled ? "success" : "neutral"}>
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </section>
            <section>
              <h3 className="text-sm font-bold">Internal note</h3>
              <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
                {selectedSettings.note ||
                  "No support settings note has been added."}
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
            ? "Add support settings"
            : "Edit support settings"
        }
        description="Configure service levels, employee access and branch support workflows."
      >
        {editorMode && (
          <SettingsForm
            key={
              editorMode === "create"
                ? "new-support-settings"
                : selectedSettings?.id
            }
            settings={
              editorMode === "edit"
                ? (selectedSettings ?? undefined)
                : undefined
            }
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveSettings}
          />
        )}
      </Drawer>
    </div>
  );
}
