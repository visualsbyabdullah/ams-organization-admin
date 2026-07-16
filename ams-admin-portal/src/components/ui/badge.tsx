import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral:
          "bg-surface-muted text-text-muted",
        success:
          "bg-success-muted text-success",
        warning:
          "bg-warning-muted text-warning",
        danger:
          "bg-danger-muted text-danger",
        info:
          "bg-info-muted text-info",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeProps =
  HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
}
