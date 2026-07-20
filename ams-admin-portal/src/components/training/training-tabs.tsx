"use client";

import { ModuleTabs } from "@/components/shared/module-tabs";
import { TRAINING_TABS } from "@/config/training";

export function TrainingTabs() {
  return (
    <ModuleTabs
      tabs={TRAINING_TABS}
      rootHref="/training"
    />
  );
}
