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
import { formatPKR } from "@/lib/currency";
import type { PayrollTrendPoint } from "@/types/payroll";

type PayrollTrendChartProps = {
  data: PayrollTrendPoint[];
};

export function PayrollTrendChart({ data }: PayrollTrendChartProps) {
  return (
    <div className="h-72 w-full [&_*:focus]:outline-none [&_svg]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
            tickFormatter={(value) => formatPKR(Number(value), true)}
            width={74}
          />

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value) => formatPKR(Number(value))}
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
            dataKey="gross"
            name="Gross payroll"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.1}
            strokeWidth={2.5}
          />

          <Area
            type="monotone"
            dataKey="net"
            name="Net payroll"
            stroke={CHART_COLORS.present}
            fill={CHART_COLORS.present}
            fillOpacity={0.08}
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="deductions"
            name="Deductions"
            stroke={CHART_COLORS.absent}
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
