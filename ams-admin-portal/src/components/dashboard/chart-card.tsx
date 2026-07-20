import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type ChartCardProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-4 p-6 pb-0">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>

          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>

        {action}
      </div>

      <div className="p-6">{children}</div>
    </Card>
  );
}
