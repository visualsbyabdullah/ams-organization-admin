import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
