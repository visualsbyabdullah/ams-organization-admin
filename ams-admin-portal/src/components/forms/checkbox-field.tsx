import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: ReactNode;
};

export function CheckboxField({ label, description, ...props }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-control border border-border p-4 transition hover:bg-canvas">
      <input
        type="checkbox"
        className="mt-0.5 size-4 accent-[var(--ams-primary)]"
        {...props}
      />

      <span>
        <span className="block text-sm font-semibold">{label}</span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-text-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
