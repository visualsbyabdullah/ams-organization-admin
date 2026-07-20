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

import { CHART_AXIS_STYLE, CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/config/charts";
import type { AttendanceTrendPoint } from "@/types/dashboard";

type AttendanceTrendChartProps = {
  data: AttendanceTrendPoint[];
};

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 8,
            left: -18,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.present} stopOpacity={0.22} />
              <stop offset="95%" stopColor={CHART_COLORS.present} stopOpacity={0} />
            </linearGradient>

            <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.late} stopOpacity={0.15} />
              <stop offset="95%" stopColor={CHART_COLORS.late} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            dy={8}
          />

          <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_STYLE} />

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{
              stroke: CHART_COLORS.border,
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

          <Area
            type="monotone"
            dataKey="present"
            name="Present"
            stroke={CHART_COLORS.present}
            strokeWidth={2.5}
            fill="url(#presentGradient)"
            activeDot={{
              r: 5,
            }}
          />

          <Area
            type="monotone"
            dataKey="late"
            name="Late"
            stroke={CHART_COLORS.late}
            strokeWidth={2}
            fill="url(#lateGradient)"
          />

          <Area
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke={CHART_COLORS.absent}
            strokeWidth={2}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
