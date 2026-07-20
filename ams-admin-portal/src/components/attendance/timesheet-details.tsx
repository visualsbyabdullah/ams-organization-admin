import { DetailGrid } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  TIMESHEET_DAY_STATUS_CONFIG,
  TIMESHEET_STATUS_CONFIG,
} from "@/config/timesheets";
import { formatDate } from "@/lib/date";
import { formatMinutesAsHours, getTimesheetTotals } from "@/lib/time";
import type { Employee } from "@/types/employee";
import type { Timesheet } from "@/types/timesheet";

type TimesheetDetailsProps = {
  timesheet: Timesheet;
  employee: Employee;
};

export function TimesheetDetails({ timesheet, employee }: TimesheetDetailsProps) {
  const totals = getTimesheetTotals(timesheet.days);

  const statusConfig = TIMESHEET_STATUS_CONFIG[timesheet.status];

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{employee.name}</h3>

            <p className="mt-1 text-xs text-text-muted">
              {employee.employeeCode} · {employee.department}
            </p>
          </div>

          <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Period",
              value: `${formatDate(timesheet.periodStart)} – ${formatDate(timesheet.periodEnd)}`,
            },
            {
              label: "Regular hours",
              value: formatMinutesAsHours(totals.regularMinutes),
            },
            {
              label: "Overtime",
              value: formatMinutesAsHours(totals.overtimeMinutes),
            },
            {
              label: "Missing entries",
              value: totals.missingEntries,
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Daily breakdown</h3>

        <div className="mt-3 overflow-hidden rounded-card border border-border">
          {timesheet.days.map((day) => {
            const dayConfig = TIMESHEET_DAY_STATUS_CONFIG[day.status];

            return (
              <div
                key={day.date}
                className="grid grid-cols-[1fr_auto] gap-4 border-b border-border p-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold">{formatDate(day.date)}</p>

                  <p className="mt-1 text-xs text-text-muted">
                    Regular {formatMinutesAsHours(day.regularMinutes)} · Overtime{" "}
                    {formatMinutesAsHours(day.overtimeMinutes)} · Break{" "}
                    {formatMinutesAsHours(day.breakMinutes)}
                  </p>
                </div>

                <Badge variant={dayConfig.badgeVariant}>{dayConfig.label}</Badge>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Employee note</h3>

        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {timesheet.note || "No note was added to this timesheet."}
        </p>
      </section>

      {timesheet.approvedBy && (
        <section className="rounded-control bg-success-muted p-4">
          <p className="text-sm font-semibold text-success">
            Approved by {timesheet.approvedBy}
          </p>
        </section>
      )}
    </div>
  );
}
