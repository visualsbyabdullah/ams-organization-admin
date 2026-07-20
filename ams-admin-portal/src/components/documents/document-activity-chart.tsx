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
import type {
  DocumentTrendPoint,
} from "@/types/document";

type DocumentActivityChartProps = {
  data: DocumentTrendPoint[];
};

export function DocumentActivityChart({
  data,
}: DocumentActivityChartProps) {
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
            width={36}
            allowDecimals={false}
          />

          <Tooltip
            contentStyle={
              CHART_TOOLTIP_STYLE
            }
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
            dataKey="uploaded"
            name="Uploaded"
            fill={
              CHART_COLORS.primary
            }
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="verified"
            name="Verified"
            fill={
              CHART_COLORS.present
            }
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="expired"
            name="Expired"
            fill={
              CHART_COLORS.absent
            }
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
