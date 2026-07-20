"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { formatPKR } from "@/lib/currency";
import type {
  DepartmentCompensationPoint,
} from "@/types/compensation";

type DepartmentCompensationChartProps = {
  data: DepartmentCompensationPoint[];
};

export function DepartmentCompensationChart({
  data,
}: DepartmentCompensationChartProps) {
  return (
    <div className="h-72 w-full [&_*:focus]:outline-none [&_svg]:outline-none">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          accessibilityLayer={false}
          data={data}
          margin={{
            top: 10,
            right: 8,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="department"
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            width={72}
            tickFormatter={(value) =>
              formatPKR(
                Number(value),
                true,
              )
            }
          />

          <Tooltip
            contentStyle={
              CHART_TOOLTIP_STYLE
            }
            formatter={(value) =>
              formatPKR(Number(value))
            }
            cursor={{
              fill: "var(--ams-surface-muted)",
            }}
          />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "18px",
            }}
          />

          <Bar
            dataKey="averageBaseSalary"
            name="Average base salary"
            fill={
              CHART_COLORS.primary
            }
            radius={[5, 5, 0, 0]}
            maxBarSize={48}
          />

          <Bar
            dataKey="averageTotalCompensation"
            name="Average fixed compensation"
            fill={
              CHART_COLORS.present
            }
            radius={[5, 5, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
