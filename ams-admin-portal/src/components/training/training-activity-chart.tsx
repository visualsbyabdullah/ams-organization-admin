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
import type { TrainingTrendPoint } from "@/types/training";

type TrainingActivityChartProps = {
  data: TrainingTrendPoint[];
};

export function TrainingActivityChart({ data }: TrainingActivityChartProps) {
  return (
    <div className="h-72 w-full [&_*:focus]:outline-none [&_svg]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
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

          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "18px",
            }}
          />

          <Bar
            dataKey="assigned"
            name="Assigned"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="completed"
            name="Completed"
            fill={CHART_COLORS.present}
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="overdue"
            name="Overdue"
            fill={CHART_COLORS.absent}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
