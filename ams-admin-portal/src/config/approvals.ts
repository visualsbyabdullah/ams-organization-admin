import {
  CalendarCheck2,
  CircleAlert,
  Clock3,
  WalletCards,
} from "lucide-react";

export const APPROVAL_INBOX_ITEMS = [
  {
    id: "leave-requests",
    title: "Leave requests",
    description:
      "Review employee leave requests awaiting approval.",
    count: 11,
    href: "/leave",
    icon: CalendarCheck2,
    iconTone:
      "bg-warning-muted text-warning",
    badgeVariant: "warning",
  },
  {
    id: "missing-checkouts",
    title: "Missing checkouts",
    description:
      "Resolve attendance records without a completed checkout.",
    count: 8,
    href: "/attendance",
    icon: Clock3,
    iconTone:
      "bg-danger-muted text-danger",
    badgeVariant: "danger",
  },
  {
    id: "attendance-corrections",
    title: "Attendance corrections",
    description:
      "Review employee attendance correction requests.",
    count: 5,
    href: "/attendance",
    icon: CircleAlert,
    iconTone:
      "bg-info-muted text-info",
    badgeVariant: "info",
  },
  {
    id: "payroll-warnings",
    title: "Payroll warnings",
    description:
      "Review payroll issues that require administrator action.",
    count: 9,
    href: "/payroll",
    icon: WalletCards,
    iconTone:
      "bg-danger-muted text-danger",
    badgeVariant: "danger",
  },
] as const;