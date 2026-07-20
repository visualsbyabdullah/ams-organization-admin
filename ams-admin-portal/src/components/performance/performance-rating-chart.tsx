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

type RatingPoint = {
  rating: string;
  employees: number;
};

type PerformanceRatingChartProps = {
  data: RatingPoint[];
};

export function PerformanceRatingChart({
  data,
}: PerformanceRatingChartProps) {
  return (
    <div className="h-72 w-full [&_*:focus]:outline-none [&_svg]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer={false}
          data={data}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="rating"
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={CHART_AXIS_STYLE}
            width={32}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar
            dataKey="employees"
            name="Employees"
            fill={CHART_COLORS.primary}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
