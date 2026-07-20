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
  DepartmentAttendancePoint,
} from "@/types/attendance";

type DepartmentAttendanceChartProps = {
  data: DepartmentAttendancePoint[];
};

export function DepartmentAttendanceChart({
  data,
}: DepartmentAttendanceChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
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
            dataKey="name"
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
            dataKey="present"
            name="Present"
            stackId="attendance"
            fill={
              CHART_COLORS.present
            }
            radius={[0, 0, 4, 4]}
          />

          <Bar
            dataKey="late"
            name="Late"
            stackId="attendance"
            fill={CHART_COLORS.late}
          />

          <Bar
            dataKey="absent"
            name="Absent"
            stackId="attendance"
            fill={
              CHART_COLORS.absent
            }
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
