import { cn } from "@/lib/utils";

type ProgressTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

type ProgressBarProps = {
  value: number;
  label?: string;
  tone?: ProgressTone;
  showValue?: boolean;
  className?: string;
};

const TONE_STYLES: Record<
  ProgressTone,
  string
> = {
  neutral: "bg-border-strong",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  label,
  tone = "info",
  showValue = true,
  className,
}: ProgressBarProps) {
  const normalizedValue = Math.min(
    Math.max(value, 0),
    100,
  );

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-text-muted">
            {label}
          </span>

          {showValue && (
            <span className="font-bold text-text">
              {normalizedValue}%
            </span>
          )}
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            TONE_STYLES[tone],
          )}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
