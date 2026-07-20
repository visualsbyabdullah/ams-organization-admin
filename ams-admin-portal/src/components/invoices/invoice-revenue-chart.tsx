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
import type { InvoiceTrendPoint } from "@/types/invoice";

type InvoiceRevenueChartProps = {
  data: readonly InvoiceTrendPoint[];
};

export function InvoiceRevenueChart({ data }: InvoiceRevenueChartProps) {
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
            width={72}
            tickFormatter={(value: number | string) => formatPKR(Number(value), true)}
          />

          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number | string) => formatPKR(Number(value))}
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
            dataKey="billed"
            name="Billed"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.08}
            strokeWidth={2.5}
          />

          <Area
            type="monotone"
            dataKey="collected"
            name="Collected"
            stroke={CHART_COLORS.present}
            fill={CHART_COLORS.present}
            fillOpacity={0.08}
            strokeWidth={2.5}
          />

          <Area
            type="monotone"
            dataKey="outstanding"
            name="Outstanding"
            stroke={CHART_COLORS.absent}
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
