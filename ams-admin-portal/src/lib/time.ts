import type { TimesheetDay } from "@/types/timesheet";

export function formatMinutesAsHours(minutes: number) {
  if (minutes <= 0) {
    return "0h";
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getTimesheetTotals(days: TimesheetDay[]) {
  return days.reduce(
    (totals, day) => ({
      regularMinutes: totals.regularMinutes + day.regularMinutes,

      overtimeMinutes: totals.overtimeMinutes + day.overtimeMinutes,

      breakMinutes: totals.breakMinutes + day.breakMinutes,

      leaveMinutes: totals.leaveMinutes + day.leaveMinutes,

      missingEntries: totals.missingEntries + (day.status === "missing" ? 1 : 0),
    }),
    {
      regularMinutes: 0,
      overtimeMinutes: 0,
      breakMinutes: 0,
      leaveMinutes: 0,
      missingEntries: 0,
    },
  );
}

export function minutesToDecimalHours(minutes: number) {
  return Number((minutes / 60).toFixed(1));
}
