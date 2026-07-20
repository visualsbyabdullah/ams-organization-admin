import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  description,
  error,
  optional = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-text">
          {label}
        </label>

        {optional && <span className="text-xs text-text-muted">Optional</span>}
      </div>

      {children}

      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : (
        description && <p className="text-xs leading-5 text-text-muted">{description}</p>
      )}
    </div>
  );
}
