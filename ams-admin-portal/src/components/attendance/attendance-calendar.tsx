"use client";

import { CalendarDays } from "lucide-react";

import { ATTENDANCE_RATE_LEVELS } from "@/config/attendance-register";
import { cn } from "@/lib/utils";
import type { AttendanceCalendarDay } from "@/types/attendance-register";

type AttendanceCalendarProps = {
  days: AttendanceCalendarDay[];
  selectedDate: string;
  onDateChange: (date: string) => void;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function getRateClass(rate: number) {
  return (
    ATTENDANCE_RATE_LEVELS.find((level) => rate >= level.minimum)?.className ??
    "bg-surface-muted text-text-muted"
  );
}

function getDayNumber(date: string) {
  return Number(date.slice(-2));
}

export function AttendanceCalendar({
  days,
  selectedDate,
  onDateChange,
}: AttendanceCalendarProps) {
  const firstDate = days[0]?.date;

  const firstWeekday = firstDate ? new Date(`${firstDate}T00:00:00`).getDay() : 1;

  const leadingEmptyCells = firstWeekday === 0 ? 6 : firstWeekday - 1;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-control bg-primary/10 text-primary">
            <CalendarDays size={19} />
          </span>

          <div>
            <p className="font-bold">July 2026</p>

            <p className="mt-1 text-xs text-text-muted">Attendance rate by day</p>
          </div>
        </div>

        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted">
          16 days recorded
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((weekday) => (
          <div
            key={weekday}
            className="py-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted"
          >
            {weekday}
          </div>
        ))}

        {Array.from({
          length: leadingEmptyCells,
        }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const selected = day.date === selectedDate;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onDateChange(day.date)}
              className={cn(
                "relative aspect-square rounded-control border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                getRateClass(day.attendanceRate),
                selected ? "border-primary ring-2 ring-primary/15" : "border-transparent",
              )}
            >
              <span className="block text-xs font-bold">{getDayNumber(day.date)}</span>

              <span className="absolute bottom-2 left-2 text-[11px] font-bold">
                {day.attendanceRate}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        {ATTENDANCE_RATE_LEVELS.map((level) => (
          <div key={level.minimum} className="flex items-center gap-2">
            <span className={cn("size-3 rounded-sm", level.className)} />

            <span className="text-xs text-text-muted">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
