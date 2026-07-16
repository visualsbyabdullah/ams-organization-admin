import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse text-left",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader(
  props: ComponentProps<"thead">,
) {
  return <thead {...props} />;
}

export function TableBody(
  props: ComponentProps<"tbody">,
) {
  return <tbody {...props} />;
}

export function TableRow({
  className,
  ...props
}: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-11 whitespace-nowrap px-4 text-xs font-bold uppercase tracking-[0.08em] text-text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-4 py-4 text-sm",
        className,
      )}
      {...props}
    />
  );
}
