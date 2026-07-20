"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type ModuleTab = {
  label: string;
  href: string;
};

type ModuleTabsProps = {
  tabs: readonly ModuleTab[];
  rootHref: string;
};

export function ModuleTabs({
  tabs,
  rootHref,
}: ModuleTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const active =
          tab.href === rootHref
            ? pathname === rootHref
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
              active
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}