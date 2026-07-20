export const PAYROLL_RUN_PERIOD_OPTIONS = [
  {
    value: "all",
    label: "All payroll periods",
  },
  {
    value: "2026-07",
    label: "July 2026",
  },
  {
    value: "2026-06",
    label: "June 2026",
  },
] as const;

export const PAYROLL_RUNS_COPY = {
  eyebrow: "Payroll",
  title: "Payroll runs",
  description:
    "Manage payroll processing, approvals and payment completion across organization branches.",
  createAction: "Start payroll run",
  exportAction: "Export history",
  chartTitle: "Branch payroll comparison",
  chartDescription:
    "Gross payroll, deductions and net payment amounts for the selected period.",
  tableTitle: "Payroll run history",
  tableDescription:
    "Review payroll runs and continue each run through its processing workflow.",
  searchPlaceholder: "Search payroll period, branch, creator or note",
  allStatuses: "All run statuses",
  emptyTitle: "No payroll runs found",
  emptyDescription: "Change the selected filters or create a new payroll run.",
} as const;
