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

import { CHART_AXIS_STYLE, CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/config/charts";
import type { TimesheetChartPoint } from "@/types/timesheet";

type TimesheetHoursChartProps = {
  data: TimesheetChartPoint[];
};

export function TimesheetHoursChart({ data }: TimesheetHoursChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
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
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            tickFormatter={(value) => `${value}h`}
          />

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value) => [`${value}h`]}
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
            dataKey="regularHours"
            name="Regular hours"
            stackId="hours"
            fill={CHART_COLORS.primary}
            radius={[0, 0, 5, 5]}
            maxBarSize={52}
          />

          <Bar
            dataKey="overtimeHours"
            name="Overtime"
            stackId="hours"
            fill={CHART_COLORS.late}
            radius={[5, 5, 0, 0]}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
