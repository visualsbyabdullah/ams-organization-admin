import {
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { LEAVE_TYPE_CONFIG } from "@/config/leave";
import type {
  LeaveBalance,
  LeaveType,
} from "@/types/leave";

type LeaveBalanceSummaryProps = {
  balance?: LeaveBalance;
  type: LeaveType;
};

export function LeaveBalanceSummary({
  balance,
  type,
}: LeaveBalanceSummaryProps) {
  const allowance =
    balance?.allowance[type] ?? 0;

  const used =
    balance?.used[type] ?? 0;

  const remaining = Math.max(
    allowance - used,
    0,
  );

  const typeConfig =
    LEAVE_TYPE_CONFIG[type];

  const items = [
    {
      label: "Annual allowance",
      value: allowance,
      icon: CalendarCheck2,
      tone:
        "bg-info-muted text-info",
    },
    {
      label: "Already used",
      value: used,
      icon: CalendarX2,
      tone:
        "bg-warning-muted text-warning",
    },
    {
      label: "Remaining balance",
      value: remaining,
      icon: CalendarClock,
      tone:
        remaining > 0
          ? "bg-success-muted text-success"
          : "bg-danger-muted text-danger",
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold">
            Leave balance
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            {typeConfig.label}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="p-4"
            >
              <span
                className={`flex size-9 items-center justify-center rounded-control ${item.tone}`}
              >
                <Icon size={17} />
              </span>

              <p className="mt-4 text-xs text-text-muted">
                {item.label}
              </p>

              <p className="mt-1 text-xl font-bold">
                {item.value} days
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
