import { SUPPORT_REFERENCE_DATETIME } from "@/config/support";
import type { SupportSlaState, SupportTicket } from "@/types/support";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatSupportDateTime(value: string) {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function getSupportSlaState(ticket: SupportTicket): SupportSlaState {
  const dueTime = new Date(ticket.dueAt).getTime();

  if (ticket.status === "resolved" || ticket.status === "closed") {
    const completedAt =
      ticket.resolvedAt ?? ticket.closedAt ?? ticket.updatedAt;

    return new Date(completedAt).getTime() <= dueTime ? "met" : "missed";
  }

  const referenceTime = new Date(SUPPORT_REFERENCE_DATETIME).getTime();

  if (referenceTime > dueTime) {
    return "overdue";
  }

  const hoursRemaining = (dueTime - referenceTime) / (1000 * 60 * 60);

  return hoursRemaining <= 4 ? "at_risk" : "on_track";
}

function escapeCsvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function exportSupportTickets(
  tickets: SupportTicket[],
  employeeNames: Record<string, string>,
  categoryNames: Record<string, string>,
) {
  const headers = [
    "Ticket",
    "Employee",
    "Branch",
    "Category",
    "Title",
    "Priority",
    "Status",
    "SLA",
    "Assignee",
    "Created",
    "Due",
  ];

  const rows = tickets.map((ticket) => [
    ticket.ticketNumber,
    employeeNames[ticket.employeeId] ?? ticket.employeeId,
    ticket.branchId,
    categoryNames[ticket.categoryId] ?? ticket.categoryId,
    ticket.title,
    ticket.priority,
    ticket.status,
    getSupportSlaState(ticket),
    ticket.assignedTo ?? "Unassigned",
    ticket.createdAt,
    ticket.dueAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ams-support-tickets.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
