"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Headphones,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SupportTabs } from "@/components/support/support-tabs";
import { SupportVolumeChart } from "@/components/support/support-volume-chart";
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
import {
  SUPPORT_COPY,
  SUPPORT_PRIORITY_CONFIG,
  SUPPORT_SLA_CONFIG,
  SUPPORT_TICKET_STATUS_CONFIG,
} from "@/config/support";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_TICKETS,
  SUPPORT_VOLUME_TRENDS,
} from "@/data/support";
import {
  exportSupportTickets,
  formatSupportDateTime,
  getSupportSlaState,
} from "@/lib/support";
import type { SupportTicket } from "@/types/support";

export function SupportOverview() {
  const { selectedBranch, selectedBranchId } = useBranchScope();
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const ticketSelection = useEntitySelection(tickets, (ticket) => ticket.id);
  const [createOpen, setCreateOpen] = useState(false);

  const scopedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) => selectedBranch.isAggregate || ticket.branchId === selectedBranch.id,
      ),
    [selectedBranch, tickets],
  );

  const selectedTicket = ticketSelection.selected;

  const activeTickets = scopedTickets.filter(
    (ticket) => !["resolved", "closed"].includes(ticket.status),
  );
  const urgentTickets = activeTickets.filter((ticket) => ticket.priority === "urgent");
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
          const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);

          return employee ? (
            <div className="flex items-center gap-3">
              <Avatar name={employee.name} initials={employee.initials} />
              <div>
                <p className="font-semibold">{employee.name}</p>
                <p className="mt-1 text-xs text-text-muted">{employee.employeeCode}</p>
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
          <Badge variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}>
            {SUPPORT_PRIORITY_CONFIG[ticket.priority].label}
          </Badge>
        ),
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
    setCreateOpen(false);
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
        eyebrow={SUPPORT_COPY.overview.eyebrow}
        title={SUPPORT_COPY.overview.title}
        description={SUPPORT_COPY.overview.description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                exportSupportTickets(scopedTickets, employeeNames, categoryNames)
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
            data={SUPPORT_VOLUME_TRENDS[selectedBranchId] ?? SUPPORT_VOLUME_TRENDS.all}
          />
        </ChartCard>

        <Card className="h-fit p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-warning-muted text-warning">
              <Headphones size={19} />
            </span>
            <div>
              <h2 className="text-lg font-bold">{SUPPORT_COPY.overview.queueTitle}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {SUPPORT_COPY.overview.queueDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {attentionQueue.length > 0 ? (
              attentionQueue.map((ticket) => {
                const employee = EMPLOYEES.find((item) => item.id === ticket.employeeId);
                const slaState = getSupportSlaState(ticket);

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => ticketSelection.select(ticket.id)}
                    className="w-full rounded-control border border-border p-4 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{ticket.title}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {employee?.name ?? "Unknown employee"}
                        </p>
                      </div>
                      <Badge variant={SUPPORT_SLA_CONFIG[slaState].badgeVariant}>
                        {SUPPORT_SLA_CONFIG[slaState].label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Badge
                        variant={SUPPORT_PRIORITY_CONFIG[ticket.priority].badgeVariant}
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
          <h2 className="text-lg font-bold">{SUPPORT_COPY.overview.tableTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {SUPPORT_COPY.overview.tableDescription}
          </p>
        </div>
        <DataTable
          rows={recentTickets}
          columns={columns}
          getRowKey={(ticket) => ticket.id}
          onRowClick={(ticket) => ticketSelection.select(ticket.id)}
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
        onClose={() => ticketSelection.clear()}
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
