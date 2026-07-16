import type { LucideIcon } from "lucide-react";

export type MetricTone =
  | "success"
  | "warning"
  | "info"
  | "danger";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: MetricTone;
};

export type AttendanceTrendPoint = {
  day: string;
  present: number;
  late: number;
  absent: number;
};

export type DistributionPoint = {
  name: string;
  value: number;
  color: string;
};

export type ComparisonPoint = {
  name: string;
  value: number;
};

export type AttentionItem = {
  label: string;
  count: number;
};

export type DashboardDataset = {
  metrics: DashboardMetric[];
  attendanceTrend: AttendanceTrendPoint[];
  distribution: DistributionPoint[];
  comparisonTitle: string;
  comparisonDescription: string;
  comparisonData: ComparisonPoint[];
  attentionItems: AttentionItem[];
};
