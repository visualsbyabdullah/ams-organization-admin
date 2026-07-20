import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DetailGridItem = {
  label: string;
  value: ReactNode;
};

type DetailGridProps = {
  items: readonly DetailGridItem[];
  columns?: 1 | 2;
  /** Wrap each item in a bg-canvas card. Defaults to true (most common variant). */
  bordered?: boolean;
};

/**
 * Replaces the `<dl><div><dt>…</dt><dd>…</dd></div></dl>` block that was
 * hand-written in ~40 workspace/detail files. Usage:
 *
 *   <DetailGrid items={[{ label: "Leave type", value: "Annual" }, ...]} />
 */
export function DetailGrid({ items, columns = 2, bordered = true }: DetailGridProps) {
  return (
    <dl
      className={cn(
        bordered ? "mt-3 grid gap-3" : "grid gap-5 p-5",
        columns === 2 && "sm:grid-cols-2",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={bordered ? "rounded-control bg-canvas p-4" : undefined}
        >
          <dt className="text-xs text-text-muted">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type ToggleDetailItem = {
  label: string;
  enabled: boolean;
  detail?: string;
};

/**
 * Replaces the enabled/disabled "toggle summary" list pattern (e.g. carry
 * forward, negative balance, attachment required) that appeared alongside
 * DetailGrid in the same files.
 */
export function ToggleDetailList({ items }: { items: readonly ToggleDetailItem[] }) {
  return (
    <div className="mt-3 space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-4 rounded-control border border-border p-4"
        >
          <div>
            <p className="text-sm font-semibold">{item.label}</p>
            {item.detail && <p className="mt-1 text-xs text-text-muted">{item.detail}</p>}
          </div>

          <Badge variant={item.enabled ? "success" : "neutral"}>
            {item.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
