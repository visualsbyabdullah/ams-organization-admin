import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  initials: string;
  className?: string;
};

export function Avatar({
  name,
  initials,
  className,
}: AvatarProps) {
  return (
    <div
      title={name}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-text",
        className,
      )}
    >
      {initials}
    </div>
  );
}
