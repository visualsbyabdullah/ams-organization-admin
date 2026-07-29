"use client";

import { useMemo, useState } from "react";
import { Download, FileSearch, MoreHorizontal, Plus, Search } from "lucide-react";

import { SupportTabs } from "@/components/support/support-tabs";
import {
  TicketDetails,
  TicketDrawerFooter,
  TicketForm,
  updateTicketRecord,
} from "@/components/support/support-ticket-shared";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useEntitySelection } from "@/components/shared/use-entity-selection";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SUPPORT_COPY,
  SUPPORT_PRIORITY_CONFIG,
  SUPPORT_SLA_CONFIG,
  SUPPORT_TICKET_STATUS_CONFIG,
} from "@/config/support";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import { SUPPORT_CATEGORIES, SUPPORT_TICKETS } from "@/data/support";
import { exportSupportTickets, getSupportSlaState } from "@/lib/support";
import type { SupportTicket } from "@/types/support";

export function SupportTicketsWorkspace() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const ticketSelection = useEntitySelection(tickets, (ticket) => ticket.id);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  const scopedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) => selectedBranch.isAggregate || ticket.branchId === selectedBranch.id,
      ),
    [selectedBranch, tickets],
  );

  const visibleTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedTickets.filter((ticket) => {
      const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);
      const category = SUPPORT_CATEGORIES.find((item) => item.id === ticket.categoryId);
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

  const selectedTicket = ticketSelection.selected;

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
          const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);
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
          SUPPORT_CATEGORIES.find((category) => category.id === ticket.categoryId)
            ?.name ?? "Unassigned",
      },
      {
        id: "priority",
        header: "Priority",
        cell: (ticket) => (
          <Badge variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}>
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
          <Badge variant={SUPPORT_TICKET_STATUS_CONFIG[ticket.status].badgeVariant}>
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
              ticketSelection.select(ticket.id);
            }}
          >
            <MoreHorizontal />
          </Button>
        ),
      },
    ],
    [ticketSelection],
  );

  function saveTicket(ticket: SupportTicket) {
    setTickets((current) => {
      const exists = current.some((item) => item.id === ticket.id);
      return exists
        ? current.map((item) => (item.id === ticket.id ? ticket : item))
        : [ticket, ...current];
    });
    setEditorMode(null);
    ticketSelection.select(ticket.id);
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
                exportSupportTickets(visibleTickets, employeeNames, categoryNames)
              }
            >
              <Download />
              {SUPPORT_COPY.tickets.exportAction}
            </Button>
            <Button
              onClick={() => {
                ticketSelection.clear();
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
          <h2 className="text-lg font-bold">{SUPPORT_COPY.tickets.registerTitle}</h2>
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
              {Object.entries(SUPPORT_TICKET_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>

            <Select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="all">{SUPPORT_COPY.tickets.allPriorities}</option>
              {Object.entries(SUPPORT_PRIORITY_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
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
          onRowClick={(ticket) => ticketSelection.select(ticket.id)}
          emptyState={
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch className="size-8 text-text-muted" />
              <h3 className="mt-4 font-bold">{SUPPORT_COPY.tickets.emptyTitle}</h3>
              <p className="mt-2 text-sm text-text-muted">
                {SUPPORT_COPY.tickets.emptyDescription}
              </p>
            </div>
          }
        />
      </Card>

      <Drawer
        open={Boolean(selectedTicket)}
        onClose={() => ticketSelection.clear()}
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
        title={editorMode === "create" ? "New support ticket" : "Edit support ticket"}
        description="Record the employee request, routing, priority and service-level target."
      >
        {editorMode && (
          <TicketForm
            key={editorMode === "create" ? "new-support-ticket" : selectedTicket?.id}
            ticket={editorMode === "edit" ? (selectedTicket ?? undefined) : undefined}
            selectedBranchId={selectedBranchId}
            onCancel={() => setEditorMode(null)}
            onSave={saveTicket}
          />
        )}
      </Drawer>
    </div>
  );
}
