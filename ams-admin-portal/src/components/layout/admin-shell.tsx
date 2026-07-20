"use client";

import { type ReactNode, useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BranchScopeProvider } from "@/context/branch-scope-context";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BranchScopeProvider>
      <div className="min-h-screen bg-canvas lg:pl-70">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <Topbar onMenuOpen={() => setMobileOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </BranchScopeProvider>
  );
}
