import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "success" | "warning" | "info" | "danger" | "neutral";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: MetricTone;
};

const TONE_STYLES: Record<MetricTone, string> = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  info: "bg-info-muted text-info",
  danger: "bg-danger-muted text-danger",
  neutral: "bg-surface-muted text-text-muted",
};

export function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">{label}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>

          <p className="mt-2 text-xs text-text-muted">{detail}</p>
        </div>

        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-control",
            TONE_STYLES[tone],
          )}
        >
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
}
