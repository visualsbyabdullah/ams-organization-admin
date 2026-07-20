"use client";

import {
  Area,
  AreaChart,
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
  LeaveTrendPoint,
} from "@/types/leave";

type LeaveTrendChartProps = {
  data: LeaveTrendPoint[];
};

export function LeaveTrendChart({
  data,
}: LeaveTrendChartProps) {
  return (
    <div className="h-72 w-full [&_*:focus]:outline-none [&_svg]:outline-none">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          accessibilityLayer={false}
          data={data}
          margin={{
            top: 10,
            right: 8,
            left: -18,
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

          <Area
            type="monotone"
            dataKey="approved"
            name="Approved"
            stroke={
              CHART_COLORS.present
            }
            fill={
              CHART_COLORS.present
            }
            fillOpacity={0.12}
            strokeWidth={2.5}
          />

          <Area
            type="monotone"
            dataKey="pending"
            name="Pending"
            stroke={CHART_COLORS.late}
            fill={CHART_COLORS.late}
            fillOpacity={0.08}
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="rejected"
            name="Rejected"
            stroke={
              CHART_COLORS.absent
            }
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

