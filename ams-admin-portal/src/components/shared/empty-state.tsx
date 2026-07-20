import type {
  LucideIcon,
} from "lucide-react";
import type {
  ReactNode,
} from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <Icon className="size-8 text-text-muted" />

      <h3 className="mt-4 font-bold">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
