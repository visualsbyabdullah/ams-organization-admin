"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ATTENDANCE_TABS } from "@/config/attendance";
import { cn } from "@/lib/utils";

export function AttendanceTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {ATTENDANCE_TABS.map((tab) => {
        const active =
          tab.href === "/attendance"
            ? pathname === "/attendance"
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
