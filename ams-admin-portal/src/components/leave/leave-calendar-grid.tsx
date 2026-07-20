"use client";

import {
  LEAVE_CALENDAR_TYPE_TONES,
  LEAVE_CALENDAR_WEEKDAYS,
} from "@/config/leave-calendar";
import { EMPLOYEES } from "@/data/employees";
import { cn } from "@/lib/utils";
import type {
  LeaveRequest,
} from "@/types/leave";

type LeaveCalendarGridProps = {
  month: Date;
  selectedDate: string;
  requests: LeaveRequest[];
  onDateSelect: (
    date: string,
  ) => void;
  onRequestSelect: (
    requestId: string,
  ) => void;
};

function toDateString(
  date: Date,
) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildCalendarCells(
  month: Date,
) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstWeekday =
    new Date(
      year,
      monthIndex,
      1,
    ).getDay();

  const leadingCells =
    firstWeekday === 0
      ? 6
      : firstWeekday - 1;

  const daysInMonth =
    new Date(
      year,
      monthIndex + 1,
      0,
    ).getDate();

  const cells: Array<
    string | null
  > = [];

  for (
    let index = 0;
    index < leadingCells;
    index += 1
  ) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    cells.push(
      toDateString(
        new Date(
          year,
          monthIndex,
          day,
        ),
      ),
    );
  }

  while (cells.length < 42) {
    cells.push(null);
  }

  return cells;
}

function requestIncludesDate(
  request: LeaveRequest,
  date: string,
) {
  return (
    request.startDate <= date &&
    request.endDate >= date
  );
}

export function LeaveCalendarGrid({
  month,
  selectedDate,
  requests,
  onDateSelect,
  onRequestSelect,
}: LeaveCalendarGridProps) {
  const cells =
    buildCalendarCells(month);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-210">
        <div className="grid grid-cols-7 border-b border-border bg-canvas">
          {LEAVE_CALENDAR_WEEKDAYS.map(
            (weekday) => (
              <div
                key={weekday}
                className="px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-text-muted"
              >
                {weekday}
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-7">
          {cells.map(
            (date, cellIndex) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${cellIndex}`}
                    className="min-h-38 border-b border-r border-border bg-canvas/40"
                  />
                );
              }

              const dayRequests =
                requests.filter(
                  (request) =>
                    requestIncludesDate(
                      request,
                      date,
                    ),
                );

              const visibleRequests =
                dayRequests.slice(0, 3);

              const remainingCount =
                dayRequests.length -
                visibleRequests.length;

              const isSelected =
                selectedDate === date;

              const dayNumber =
                Number(date.slice(-2));

              return (
                <div
                  key={date}
                  className={cn(
                    "min-h-38 border-b border-r border-border p-2 transition",
                    isSelected
                      ? "bg-primary/5 ring-2 ring-inset ring-primary/20"
                      : "bg-surface",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={
                      isSelected
                    }
                    onClick={() =>
                      onDateSelect(date)
                    }
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-xs font-bold transition",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "text-text hover:bg-surface-muted",
                    )}
                  >
                    {dayNumber}
                  </button>

                  <div className="mt-2 space-y-1.5">
                    {visibleRequests.map(
                      (request) => {
                        const employee =
                          EMPLOYEES.find(
                            (item) =>
                              item.id ===
                              request.employeeId,
                          );

                        const tone =
                          LEAVE_CALENDAR_TYPE_TONES[
                            request.type
                          ];

                        return (
                          <button
                            key={request.id}
                            type="button"
                            title={
                              employee?.name
                            }
                            onClick={() => {
                              onDateSelect(
                                date,
                              );

                              onRequestSelect(
                                request.id,
                              );
                            }}
                            className={cn(
                              "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition hover:opacity-80",
                              tone.containerClassName,
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                tone.dotClassName,
                              )}
                            />

                            <span className="truncate">
                              {employee?.name ??
                                "Employee"}
                            </span>
                          </button>
                        );
                      },
                    )}

                    {remainingCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          onDateSelect(
                            date,
                          )
                        }
                        className="w-full px-2 py-1 text-left text-[11px] font-semibold text-text-muted hover:text-text"
                      >
                        +{remainingCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
