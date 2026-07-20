import type {
  AttendanceRecord,
} from "@/types/attendance";

export type AttendanceRecordSource =
  | "device"
  | "mobile"
  | "manual"
  | "import";

export type AttendanceRegisterRecord =
  AttendanceRecord & {
    source: AttendanceRecordSource;
    hasException: boolean;
  };

export type AttendanceCalendarDay = {
  date: string;
  scheduled: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
};
