"use client";

import { ModuleTabs } from "@/components/shared/module-tabs";
import { INVOICE_TABS } from "@/config/invoices";

export function InvoiceTabs() {
  return <ModuleTabs tabs={INVOICE_TABS} rootHref="/invoices" />;
}
