import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type IconContainerTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

type IconContainerProps = {
  icon: LucideIcon;
  tone?: IconContainerTone;
  className?: string;
};

const TONE_STYLES: Record<
  IconContainerTone,
  string
> = {
  neutral:
    "bg-surface-muted text-text-muted",
  info:
    "bg-info-muted text-info",
  success:
    "bg-success-muted text-success",
  warning:
    "bg-warning-muted text-warning",
  danger:
    "bg-danger-muted text-danger",
};

export function IconContainer({
  icon: Icon,
  tone = "neutral",
  className,
}: IconContainerProps) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-control",
        TONE_STYLES[tone],
        className,
      )}
    >
      <Icon size={19} />
    </span>
  );
}
