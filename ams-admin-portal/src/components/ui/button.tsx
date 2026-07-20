import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex min-w-max items-center justify-center",
    "gap-[var(--ams-control-gap)] whitespace-nowrap",
    "rounded-control font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-primary/20",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-surface-muted text-text hover:bg-border",
        outline: "border border-border bg-surface text-text hover:bg-surface-muted",
        ghost: "text-text-muted hover:bg-surface-muted hover:text-text",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: [
          "h-[var(--ams-control-height-sm)]",
          "px-[var(--ams-button-padding-sm)]",
          "text-sm [&_svg]:size-4",
        ],
        md: [
          "h-[var(--ams-control-height-md)]",
          "px-[var(--ams-button-padding-md)]",
          "text-sm [&_svg]:size-4",
        ],
        lg: [
          "h-[var(--ams-control-height-lg)]",
          "px-[var(--ams-button-padding-lg)]",
          "text-base [&_svg]:size-[1.125rem]",
        ],
        icon: ["size-[var(--ams-control-height-md)]", "p-0 [&_svg]:size-[1.125rem]"],
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { buttonVariants };
