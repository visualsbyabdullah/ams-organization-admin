"use client";

import { ModuleTabs } from "@/components/shared/module-tabs";
import { SUPPORT_TABS } from "@/config/support";

export function SupportTabs() {
  return <ModuleTabs tabs={SUPPORT_TABS} rootHref="/support" />;
}
