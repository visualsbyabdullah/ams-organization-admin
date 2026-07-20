"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { UI_COPY } from "@/config/ui";
import { cn } from "@/lib/utils";

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label={UI_COPY.navigation.close}
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-70 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-18 items-center justify-between border-b border-border px-5">
          <AppLogo />

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={UI_COPY.navigation.close}
            onClick={onMobileClose}
          >
            <X size={19} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {NAVIGATION_GROUPS.map((group) => (
              <section key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActiveRoute(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-text-muted hover:bg-surface-muted hover:text-text",
                        )}
                      >
                        <Icon size={18} strokeWidth={2} />

                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-control bg-surface-muted p-3">
            <p className="text-sm font-semibold">Need help?</p>

            <p className="mt-1 text-xs leading-5 text-text-muted">
              Contact AMS support for assistance.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
