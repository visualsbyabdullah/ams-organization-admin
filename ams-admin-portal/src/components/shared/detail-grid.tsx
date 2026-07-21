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
  /**
   * "card" (default) wraps each item in a bg-canvas card.
   * "outline" wraps each item in a bordered box with no fill.
   * "none" renders no wrapper/padding at all.
   */
  variant?: "card" | "outline" | "none";
};

const WRAPPER_CLASSES: Record<NonNullable<DetailGridProps["variant"]>, string> = {
  card: "rounded-control bg-canvas p-4",
  outline: "rounded-control border border-border p-4",
  none: "",
};

/**
 * Replaces the `<dl><div><dt>…</dt><dd>…</dd></div></dl>` block that was
 * hand-written in ~40 workspace/detail files. Usage:
 *
 *   <DetailGrid items={[{ label: "Leave type", value: "Annual" }, ...]} />
 */
export function DetailGrid({ items, columns = 2, variant = "card" }: DetailGridProps) {
  return (
    <dl
      className={cn(
        variant === "none" ? "grid gap-5 p-5" : "mt-3 grid gap-3",
        columns === 2 && "sm:grid-cols-2",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className={WRAPPER_CLASSES[variant] || undefined}>
          <dt className="text-xs text-text-muted">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type LineItem = {
  label: string;
  value: ReactNode;
  /** Used for total/summary rows that need visual emphasis. */
  tone?: "default" | "danger" | "warning" | "success";
};

const LINE_ITEM_ROW_CLASSES: Record<NonNullable<LineItem["tone"]>, string> = {
  default: "bg-canvas",
  danger: "bg-danger-muted",
  warning: "bg-warning-muted",
  success: "bg-success-muted",
};

const LINE_ITEM_LABEL_CLASSES: Record<NonNullable<LineItem["tone"]>, string> = {
  default: "text-text-muted",
  danger: "font-semibold text-danger",
  warning: "font-semibold text-warning",
  success: "font-semibold text-success",
};

const LINE_ITEM_VALUE_CLASSES: Record<NonNullable<LineItem["tone"]>, string> = {
  default: "font-semibold",
  danger: "font-bold text-danger",
  warning: "font-bold text-warning",
  success: "font-bold text-success",
};

/**
 * Replaces the horizontal "label left, value right" financial breakdown row
 * list (e.g. earnings/deductions lines, totals rows) hand-written across
 * payroll files as `<dl className="mt-3 space-y-3">...</dl>`.
 */
export function LineItemList({ items }: { items: readonly LineItem[] }) {
  return (
    <dl className="mt-3 space-y-3">
      {items.map((item) => {
        const tone = item.tone ?? "default";

        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between rounded-control px-4 py-3",
              LINE_ITEM_ROW_CLASSES[tone],
            )}
          >
            <dt className={cn("text-sm", LINE_ITEM_LABEL_CLASSES[tone])}>{item.label}</dt>
            <dd className={cn("text-sm", LINE_ITEM_VALUE_CLASSES[tone])}>{item.value}</dd>
          </div>
        );
      })}
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
