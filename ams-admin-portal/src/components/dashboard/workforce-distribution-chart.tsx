"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/config/charts";
import type { DistributionPoint } from "@/types/dashboard";

type WorkforceDistributionChartProps = {
  data: DistributionPoint[];
};

export function WorkforceDistributionChart({ data }: WorkforceDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={88}
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
          <strong className="text-3xl font-bold">{total}</strong>

          <span className="mt-1 text-xs text-text-muted">Employees</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

              <span className="truncate text-xs font-medium text-text-muted">
                {item.name}
              </span>
            </div>

            <span className="text-sm font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
