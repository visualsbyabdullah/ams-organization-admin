"use client";

import { ModuleTabs } from "@/components/shared/module-tabs";
import { REPORT_TABS } from "@/config/reports";

export function ReportTabs() {
  return <ModuleTabs tabs={REPORT_TABS} rootHref="/reports" />;
}
