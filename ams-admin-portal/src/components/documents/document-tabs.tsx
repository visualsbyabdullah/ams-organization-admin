"use client";

import { ModuleTabs } from "@/components/shared/module-tabs";
import { DOCUMENT_TABS } from "@/config/documents";

export function DocumentTabs() {
  return <ModuleTabs tabs={DOCUMENT_TABS} rootHref="/documents" />;
}
