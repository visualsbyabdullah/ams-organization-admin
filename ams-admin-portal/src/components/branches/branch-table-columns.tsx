import {
  Building2,
  MoreHorizontal,
} from "lucide-react";

import type {
  DataTableColumn,
} from "@/components/shared/data-table";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Button,
} from "@/components/ui/button";
import {
  BRANCH_STATUS_CONFIG,
} from "@/config/branches";
import {
  getBranchCapacityUtilization,
  getBranchCoordinates,
} from "@/lib/branches";
import type {
  BranchRecord,
} from "@/types/branch";

type BranchColumnOptions = {
  onOpen: (
    branch: BranchRecord,
  ) => void;
};

export function createBranchColumns({
  onOpen,
}: BranchColumnOptions): DataTableColumn<BranchRecord>[] {
  return [
    {
      id: "branch",
      header: "Branch",
      cell: (branch) => (
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
            <Building2 size={18} />
          </span>

          <div>
            <p className="font-semibold">
              {branch.name}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {branch.code} ·{" "}
              {branch.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "manager",
      header: "Manager",
      cell: (branch) =>
        branch.managerName,
    },
    {
      id: "employees",
      header: "Employees",
      cell: (branch) =>
        `${branch.employeeCount} / ${branch.capacity}`,
    },
    {
      id: "utilization",
      header: "Capacity",
      cell: (branch) =>
        `${getBranchCapacityUtilization(
          branch,
        )}%`,
    },
    {
      id: "coordinates",
      header: "Coordinates",
      cell: (branch) => (
        <span className="font-medium">
          {getBranchCoordinates(branch)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (branch) => (
        <Badge
          variant={
            BRANCH_STATUS_CONFIG[
              branch.status
            ].badgeVariant
          }
        >
          {
            BRANCH_STATUS_CONFIG[
              branch.status
            ].label
          }
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headClassName: "w-16",
      cell: (branch) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${branch.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(branch);
          }}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
}
