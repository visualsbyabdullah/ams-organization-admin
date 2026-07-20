import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  compact?: boolean;
};

export function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary text-base font-bold text-primary-foreground">
        A
      </div>

      {!compact && (
        <div className="min-w-0">
          <p className="text-sm font-bold leading-none">{APP_CONFIG.name}</p>

          <p className={cn("mt-1 truncate text-xs text-text-muted")}>
            {APP_CONFIG.portalName}
          </p>
        </div>
      )}
    </div>
  );
}
