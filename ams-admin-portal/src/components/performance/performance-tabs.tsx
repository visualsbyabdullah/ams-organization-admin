"use client";

import { ModuleTabs } from "@/components/shared/module-tabs";
import { PERFORMANCE_TABS } from "@/config/performance";

export function PerformanceTabs() {
  return <ModuleTabs tabs={PERFORMANCE_TABS} rootHref="/performance" />;
}
