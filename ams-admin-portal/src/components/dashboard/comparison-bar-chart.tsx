"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CHART_AXIS_STYLE,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/config/charts";
import type { ComparisonPoint } from "@/types/dashboard";

type ComparisonBarChartProps = {
  data: ComparisonPoint[];
};

export function ComparisonBarChart({
  data,
}: ComparisonBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 8,
            right: 8,
            left: -16,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            dy={8}
          />

          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{
              fill: "var(--ams-surface-muted)",
            }}
            formatter={(value) => [
              `${value}%`,
              "Attendance",
            ]}
          />

          <Bar
            dataKey="value"
            name="Attendance"
            fill={CHART_COLORS.primary}
            radius={[7, 7, 2, 2]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
