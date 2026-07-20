"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/config/charts";
import { formatPKR } from "@/lib/currency";
import type { PayrollCostPoint } from "@/types/payroll";

type PayrollCostBreakdownChartProps = {
  data: PayrollCostPoint[];
};

export function PayrollCostBreakdownChart({ data }: PayrollCostBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="relative h-56 [&_*:focus]:outline-none [&_svg]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value) => formatPKR(Number(value))}
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={3}
              cornerRadius={6}
              stroke="transparent"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-xl font-bold">{formatPKR(total, true)}</strong>

          <span className="mt-1 text-xs text-text-muted">Gross cost</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-control bg-canvas px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="truncate text-xs text-text-muted">{item.name}</span>
            </div>

            <strong className="text-xs">{formatPKR(item.value, true)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
