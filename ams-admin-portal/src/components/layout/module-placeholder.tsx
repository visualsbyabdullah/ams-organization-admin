"use client";

import { usePathname } from "next/navigation";

import { Card } from "@/components/ui/card";
import { NAVIGATION_GROUPS } from "@/config/navigation";

export function ModulePlaceholder() {
  const pathname = usePathname();

  const item = NAVIGATION_GROUPS
    .flatMap((group) => group.items)
    .find(
      (navigationItem) =>
        navigationItem.href !== "/" &&
        pathname.startsWith(navigationItem.href),
    );

  const title = item?.label ?? "Module";

  return (
    <div className="mx-auto max-w-360">
      <p className="text-sm font-semibold text-primary">
        AMS Organization Portal
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="mt-3 text-text-muted">
        This module will be designed and developed in the next phase.
      </p>

      <Card className="mt-7 flex min-h-100 items-center justify-center border-dashed p-8">
        <p className="text-sm text-text-muted">
          {title} workspace
        </p>
      </Card>
    </div>
  );
}
