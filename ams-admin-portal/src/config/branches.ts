import type { BranchStatus, BranchWorkingDay } from "@/types/branch";

export const BRANCH_STATUS_CONFIG: Record<
  BranchStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "neutral";
  }
> = {
  active: {
    label: "Active",
    badgeVariant: "success",
  },
  inactive: {
    label: "Inactive",
    badgeVariant: "neutral",
  },
  planned: {
    label: "Planned",
    badgeVariant: "warning",
  },
};

export const BRANCH_WORKING_DAY_CONFIG: Record<
  BranchWorkingDay,
  {
    label: string;
    shortLabel: string;
  }
> = {
  monday: {
    label: "Monday",
    shortLabel: "Mon",
  },
  tuesday: {
    label: "Tuesday",
    shortLabel: "Tue",
  },
  wednesday: {
    label: "Wednesday",
    shortLabel: "Wed",
  },
  thursday: {
    label: "Thursday",
    shortLabel: "Thu",
  },
  friday: {
    label: "Friday",
    shortLabel: "Fri",
  },
  saturday: {
    label: "Saturday",
    shortLabel: "Sat",
  },
  sunday: {
    label: "Sunday",
    shortLabel: "Sun",
  },
};

export const BRANCH_WORKING_DAYS = Object.keys(
  BRANCH_WORKING_DAY_CONFIG,
) as BranchWorkingDay[];

export const BRANCH_TIMEZONE_OPTIONS = [
  {
    value: "Asia/Karachi",
    label: "Pakistan Standard Time",
  },
] as const;

export const BRANCH_MAP_CONFIG = {
  latitudeDelta: 0.018,
  longitudeDelta: 0.024,
  openStreetMapLayer: "mapnik",
} as const;

export const BRANCH_COPY = {
  eyebrow: "Organization Structure",
  title: "Branches",
  description:
    "Manage organization locations, branch capacity, operational controls and map coordinates.",
  addAction: "Add branch",
  metrics: {
    total: "Total branches",
    active: "Active branches",
    employees: "Branch employees",
    utilization: "Capacity utilization",
  },
  mapsTitle: "Branch locations",
  mapsDescription: "Live map position generated from each branch latitude and longitude.",
  registerTitle: "Branch register",
  registerDescription:
    "Review every organization branch and open its details from the actions column.",
  searchPlaceholder: "Search branch, code, city, manager or address",
  allStatuses: "All branch statuses",
  allCities: "All cities",
  emptyTitle: "No branches found",
  emptyDescription: "Change the filters or add a new organization branch.",
  actions: {
    edit: "Edit branch",
    activate: "Activate branch",
    deactivate: "Deactivate branch",
    cancel: "Cancel",
    create: "Create branch",
    save: "Save branch",
    openMap: "Open larger map",
  },
} as const;
