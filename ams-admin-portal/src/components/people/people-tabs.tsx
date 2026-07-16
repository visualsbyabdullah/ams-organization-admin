"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PEOPLE_TABS } from "@/config/employees";
import { cn } from "@/lib/utils";

export function PeopleTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {PEOPLE_TABS.map((tab) => {
        const isActive =
          tab.href === "/people"
            ? pathname === "/people"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
              isActive
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
