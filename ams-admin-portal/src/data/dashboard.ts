import {
  CalendarCheck2,
  Clock3,
  UserCheck,
  UserX,
} from "lucide-react";

import { CHART_COLORS } from "@/config/charts";
import type { DashboardDataset } from "@/types/dashboard";

export const DASHBOARD_DATA: Record<
  string,
  DashboardDataset
> = {
  all: {
    metrics: [
      {
        label: "Present today",
        value: "214",
        detail: "Across 3 branches",
        icon: UserCheck,
        tone: "success",
      },
      {
        label: "Late arrivals",
        value: "12",
        detail: "5 require review",
        icon: Clock3,
        tone: "warning",
      },
      {
        label: "On leave",
        value: "19",
        detail: "6 returning tomorrow",
        icon: CalendarCheck2,
        tone: "info",
      },
      {
        label: "Absent",
        value: "7",
        detail: "2 unreported absences",
        icon: UserX,
        tone: "danger",
      },
    ],
    attendanceTrend: [
      {
        day: "Mon",
        present: 205,
        late: 14,
        absent: 8,
      },
      {
        day: "Tue",
        present: 211,
        late: 10,
        absent: 7,
      },
      {
        day: "Wed",
        present: 208,
        late: 13,
        absent: 9,
      },
      {
        day: "Thu",
        present: 217,
        late: 8,
        absent: 5,
      },
      {
        day: "Fri",
        present: 214,
        late: 12,
        absent: 7,
      },
      {
        day: "Sat",
        present: 178,
        late: 6,
        absent: 4,
      },
      {
        day: "Sun",
        present: 82,
        late: 3,
        absent: 2,
      },
    ],
    distribution: [
      {
        name: "Present",
        value: 214,
        color: CHART_COLORS.present,
      },
      {
        name: "Late",
        value: 12,
        color: CHART_COLORS.late,
      },
      {
        name: "On leave",
        value: 19,
        color: CHART_COLORS.leave,
      },
      {
        name: "Absent",
        value: 7,
        color: CHART_COLORS.absent,
      },
    ],
    comparisonTitle: "Branch attendance",
    comparisonDescription:
      "Attendance rate by organization branch",
    comparisonData: [
      {
        name: "Islamabad",
        value: 94,
      },
      {
        name: "Lahore",
        value: 91,
      },
      {
        name: "Karachi",
        value: 88,
      },
    ],
    attentionItems: [
      {
        label: "Leave requests",
        count: 11,
      },
      {
        label: "Missing checkouts",
        count: 8,
      },
      {
        label: "Attendance corrections",
        count: 5,
      },
      {
        label: "Payroll warnings",
        count: 9,
      },
    ],
  },

  islamabad: {
    metrics: [
      {
        label: "Present today",
        value: "84",
        detail: "92% of scheduled staff",
        icon: UserCheck,
        tone: "success",
      },
      {
        label: "Late arrivals",
        value: "7",
        detail: "3 require review",
        icon: Clock3,
        tone: "warning",
      },
      {
        label: "On leave",
        value: "12",
        detail: "2 returning tomorrow",
        icon: CalendarCheck2,
        tone: "info",
      },
      {
        label: "Absent",
        value: "4",
        detail: "1 unreported absence",
        icon: UserX,
        tone: "danger",
      },
    ],
    attendanceTrend: [
      {
        day: "Mon",
        present: 79,
        late: 8,
        absent: 5,
      },
      {
        day: "Tue",
        present: 82,
        late: 6,
        absent: 4,
      },
      {
        day: "Wed",
        present: 80,
        late: 9,
        absent: 5,
      },
      {
        day: "Thu",
        present: 86,
        late: 5,
        absent: 3,
      },
      {
        day: "Fri",
        present: 84,
        late: 7,
        absent: 4,
      },
      {
        day: "Sat",
        present: 61,
        late: 4,
        absent: 2,
      },
      {
        day: "Sun",
        present: 30,
        late: 2,
        absent: 1,
      },
    ],
    distribution: [
      {
        name: "Present",
        value: 84,
        color: CHART_COLORS.present,
      },
      {
        name: "Late",
        value: 7,
        color: CHART_COLORS.late,
      },
      {
        name: "On leave",
        value: 12,
        color: CHART_COLORS.leave,
      },
      {
        name: "Absent",
        value: 4,
        color: CHART_COLORS.absent,
      },
    ],
    comparisonTitle: "Department attendance",
    comparisonDescription:
      "Attendance rate across Islamabad departments",
    comparisonData: [
      {
        name: "HR",
        value: 100,
      },
      {
        name: "Finance",
        value: 93,
      },
      {
        name: "Sales",
        value: 95,
      },
      {
        name: "Operations",
        value: 89,
      },
      {
        name: "Marketing",
        value: 91,
      },
    ],
    attentionItems: [
      {
        label: "Leave requests",
        count: 4,
      },
      {
        label: "Missing checkouts",
        count: 3,
      },
      {
        label: "Attendance corrections",
        count: 2,
      },
      {
        label: "Payroll warnings",
        count: 6,
      },
    ],
  },

  lahore: {
    metrics: [
      {
        label: "Present today",
        value: "73",
        detail: "90% of scheduled staff",
        icon: UserCheck,
        tone: "success",
      },
      {
        label: "Late arrivals",
        value: "3",
        detail: "1 requires review",
        icon: Clock3,
        tone: "warning",
      },
      {
        label: "On leave",
        value: "4",
        detail: "1 returning tomorrow",
        icon: CalendarCheck2,
        tone: "info",
      },
      {
        label: "Absent",
        value: "2",
        detail: "All absences reported",
        icon: UserX,
        tone: "danger",
      },
    ],
    attendanceTrend: [
      {
        day: "Mon",
        present: 69,
        late: 4,
        absent: 3,
      },
      {
        day: "Tue",
        present: 71,
        late: 3,
        absent: 2,
      },
      {
        day: "Wed",
        present: 70,
        late: 5,
        absent: 3,
      },
      {
        day: "Thu",
        present: 74,
        late: 2,
        absent: 2,
      },
      {
        day: "Fri",
        present: 73,
        late: 3,
        absent: 2,
      },
      {
        day: "Sat",
        present: 59,
        late: 2,
        absent: 1,
      },
      {
        day: "Sun",
        present: 27,
        late: 1,
        absent: 1,
      },
    ],
    distribution: [
      {
        name: "Present",
        value: 73,
        color: CHART_COLORS.present,
      },
      {
        name: "Late",
        value: 3,
        color: CHART_COLORS.late,
      },
      {
        name: "On leave",
        value: 4,
        color: CHART_COLORS.leave,
      },
      {
        name: "Absent",
        value: 2,
        color: CHART_COLORS.absent,
      },
    ],
    comparisonTitle: "Department attendance",
    comparisonDescription:
      "Attendance rate across Lahore departments",
    comparisonData: [
      {
        name: "Sales",
        value: 96,
      },
      {
        name: "Operations",
        value: 92,
      },
      {
        name: "Finance",
        value: 89,
      },
      {
        name: "Marketing",
        value: 87,
      },
    ],
    attentionItems: [
      {
        label: "Leave requests",
        count: 3,
      },
      {
        label: "Missing checkouts",
        count: 2,
      },
      {
        label: "Attendance corrections",
        count: 1,
      },
      {
        label: "Payroll warnings",
        count: 2,
      },
    ],
  },

  karachi: {
    metrics: [
      {
        label: "Present today",
        value: "57",
        detail: "88% of scheduled staff",
        icon: UserCheck,
        tone: "success",
      },
      {
        label: "Late arrivals",
        value: "2",
        detail: "No reviews pending",
        icon: Clock3,
        tone: "warning",
      },
      {
        label: "On leave",
        value: "3",
        detail: "3 returning this week",
        icon: CalendarCheck2,
        tone: "info",
      },
      {
        label: "Absent",
        value: "1",
        detail: "Absence reported",
        icon: UserX,
        tone: "danger",
      },
    ],
    attendanceTrend: [
      {
        day: "Mon",
        present: 54,
        late: 2,
        absent: 2,
      },
      {
        day: "Tue",
        present: 58,
        late: 1,
        absent: 1,
      },
      {
        day: "Wed",
        present: 57,
        late: 2,
        absent: 2,
      },
      {
        day: "Thu",
        present: 59,
        late: 1,
        absent: 1,
      },
      {
        day: "Fri",
        present: 57,
        late: 2,
        absent: 1,
      },
      {
        day: "Sat",
        present: 48,
        late: 1,
        absent: 1,
      },
      {
        day: "Sun",
        present: 25,
        late: 0,
        absent: 0,
      },
    ],
    distribution: [
      {
        name: "Present",
        value: 57,
        color: CHART_COLORS.present,
      },
      {
        name: "Late",
        value: 2,
        color: CHART_COLORS.late,
      },
      {
        name: "On leave",
        value: 3,
        color: CHART_COLORS.leave,
      },
      {
        name: "Absent",
        value: 1,
        color: CHART_COLORS.absent,
      },
    ],
    comparisonTitle: "Department attendance",
    comparisonDescription:
      "Attendance rate across Karachi departments",
    comparisonData: [
      {
        name: "Operations",
        value: 92,
      },
      {
        name: "Sales",
        value: 88,
      },
      {
        name: "Support",
        value: 86,
      },
      {
        name: "Finance",
        value: 90,
      },
    ],
    attentionItems: [
      {
        label: "Leave requests",
        count: 4,
      },
      {
        label: "Missing checkouts",
        count: 3,
      },
      {
        label: "Attendance corrections",
        count: 2,
      },
      {
        label: "Payroll warnings",
        count: 1,
      },
    ],
  },
};
