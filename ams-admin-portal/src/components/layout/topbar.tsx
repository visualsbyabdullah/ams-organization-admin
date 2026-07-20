"use client";

import { Bell, ChevronDown, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/config/ui";
import { useBranchScope } from "@/context/branch-scope-context";
import { CURRENT_ADMIN } from "@/data/current-admin";

type TopbarProps = {
  onMenuOpen: () => void;
};

export function Topbar({ onMenuOpen }: TopbarProps) {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranchScope();

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={UI_COPY.navigation.open}
        onClick={onMenuOpen}
      >
        <Menu size={20} />
      </Button>

      <div className="relative hidden min-w-0 flex-1 md:block">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />

        <input
          type="search"
          placeholder={UI_COPY.topbar.searchPlaceholder}
          className="h-10 w-full max-w-xl rounded-control border border-border bg-canvas pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <select
            aria-label={UI_COPY.topbar.branchLabel}
            value={selectedBranchId}
            onChange={(event) => setSelectedBranchId(event.target.value)}
            className="h-10 min-w-44 appearance-none rounded-control border border-border bg-surface pl-3 pr-9 text-sm font-semibold outline-none transition hover:bg-surface-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label={UI_COPY.topbar.notifications}
          className="relative"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </Button>

        <button
          type="button"
          className="flex h-10 items-center gap-3 rounded-control px-1.5 transition hover:bg-surface-muted"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-text text-xs font-bold text-white">
            {CURRENT_ADMIN.initials}
          </span>

          <span className="hidden text-left xl:block">
            <span className="block text-sm font-semibold leading-none">
              {CURRENT_ADMIN.name}
            </span>

            <span className="mt-1 block text-xs text-text-muted">
              {CURRENT_ADMIN.role}
            </span>
          </span>

          <ChevronDown size={15} className="hidden text-text-muted xl:block" />
        </button>
      </div>
    </header>
  );
}
