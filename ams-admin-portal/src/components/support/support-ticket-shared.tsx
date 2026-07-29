"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, FilePenLine, UserCheck } from "lucide-react";

import { FormField } from "@/components/forms/form-field";
import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_ACTION_LABELS,
  SUPPORT_CHANNEL_CONFIG,
  SUPPORT_PRIORITY_CONFIG,
  SUPPORT_SLA_CONFIG,
  SUPPORT_TICKET_STATUS_CONFIG,
} from "@/config/support";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { SUPPORT_CATEGORIES } from "@/data/support";
import { formatSupportDateTime, getSupportSlaState } from "@/lib/support";
import type {
  SupportTicket,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support";

export function TicketForm({
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
    (employee) => selectedBranchId === "all" || employee.branchId === selectedBranchId,
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
      ticketNumber: ticket?.ticketNumber ?? `AMS-SUP-${Date.now().toString().slice(-6)}`,
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
            onChange={(event) => setPriority(event.target.value as SupportTicketPriority)}
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
            onChange={(event) => setChannel(event.target.value as SupportTicketChannel)}
          >
            {Object.entries(SUPPORT_CHANNEL_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Assigned team or person" htmlFor="supportAssignee" optional>
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
        error={submitted && !description.trim() ? "Enter request details" : undefined}
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
        <Button type="submit">{ticket ? "Save ticket" : "Create ticket"}</Button>
      </div>
    </form>
  );
}

export function TicketDetails({ ticket }: { ticket: SupportTicket }) {
  const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);
  const category = SUPPORT_CATEGORIES.find((item) => item.id === ticket.categoryId);
  const slaState = getSupportSlaState(ticket);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold text-primary">{ticket.ticketNumber}</p>
            <h3 className="mt-2 font-bold">{ticket.title}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Created {formatSupportDateTime(ticket.createdAt)}
            </p>
          </div>
          <Badge variant={SUPPORT_TICKET_STATUS_CONFIG[ticket.status].badgeVariant}>
            {SUPPORT_TICKET_STATUS_CONFIG[ticket.status].label}
          </Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Requester",
              value: (
                <>
                  <p>{employee?.name ?? "Unknown employee"}</p>
                  <p className="mt-1 text-xs font-normal text-text-muted">
                    {employee?.employeeCode ?? "Not assigned"}
                  </p>
                </>
              ),
            },
            {
              label: "Branch",
              value: employee?.branchName ?? ticket.branchId,
            },
            {
              label: "Category",
              value: category?.name ?? "Unassigned",
            },
            {
              label: "Assigned to",
              value: ticket.assignedTo ?? "Unassigned",
            },
            {
              label: "Priority",
              value: (
                <Badge variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}>
                  {SUPPORT_PRIORITY_CONFIG[ticket.priority].label}
                </Badge>
              ),
            },
            {
              label: "SLA state",
              value: (
                <Badge variant={SUPPORT_SLA_CONFIG[slaState].badgeVariant}>
                  {SUPPORT_SLA_CONFIG[slaState].label}
                </Badge>
              ),
            },
            {
              label: "Channel",
              value: SUPPORT_CHANNEL_CONFIG[ticket.channel].label,
            },
            {
              label: "Resolution due",
              value: formatSupportDateTime(ticket.dueAt),
            },
          ]}
        />
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

export function updateTicketRecord(
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
            ticket.firstRespondedAt ?? (status !== "open" ? actionTime : undefined),
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

export function TicketDrawerFooter({
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
          <Button variant="outline" onClick={() => onStatus("waiting_requester")}>
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
