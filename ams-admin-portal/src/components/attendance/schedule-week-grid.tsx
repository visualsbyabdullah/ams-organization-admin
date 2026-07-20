import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SCHEDULE_STATUS_CONFIG, SHIFT_CATEGORY_CONFIG } from "@/config/schedules";
import type { Employee } from "@/types/employee";
import type {
  ScheduleAssignment,
  ScheduleWeekDay,
  ShiftTemplate,
} from "@/types/schedule";

type ScheduleWeekGridProps = {
  employees: Employee[];
  assignments: ScheduleAssignment[];
  shifts: ShiftTemplate[];
  days: readonly ScheduleWeekDay[];
  onSelect: (assignmentId: string) => void;
};

export function ScheduleWeekGrid({
  employees,
  assignments,
  shifts,
  days,
  onSelect,
}: ScheduleWeekGridProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-canvas">
          <TableHead className="min-w-58">Employee</TableHead>

          {days.map((day) => (
            <TableHead key={day.date} className="min-w-30 text-center">
              {day.shortLabel}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <div>
                <p className="font-semibold">{employee.name}</p>

                <p className="mt-1 text-xs text-text-muted">
                  {employee.employeeCode} · {employee.department}
                </p>
              </div>
            </TableCell>

            {days.map((day) => {
              const assignment = assignments.find(
                (item) => item.employeeId === employee.id && item.date === day.date,
              );

              if (!assignment) {
                return (
                  <TableCell key={day.date} className="text-center text-text-muted">
                    —
                  </TableCell>
                );
              }

              const shift = shifts.find((item) => item.id === assignment.shiftId);

              if (!shift) {
                return (
                  <TableCell key={day.date} className="text-center text-text-muted">
                    —
                  </TableCell>
                );
              }

              const categoryConfig = SHIFT_CATEGORY_CONFIG[shift.category];

              const statusConfig = SCHEDULE_STATUS_CONFIG[assignment.status];

              return (
                <TableCell key={day.date} className="text-center">
                  <button
                    type="button"
                    onClick={() => onSelect(assignment.id)}
                    className="w-full rounded-control border border-border p-2 text-left transition hover:border-primary/40 hover:bg-canvas"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={categoryConfig.badgeVariant}>{shift.code}</Badge>

                      {assignment.status === "conflict" && (
                        <span className="size-2 rounded-full bg-danger" />
                      )}
                    </div>

                    <p className="mt-2 whitespace-nowrap text-[11px] font-medium text-text-muted">
                      {shift.startTime} – {shift.endTime}
                    </p>

                    <span className="sr-only">{statusConfig.label}</span>
                  </button>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
