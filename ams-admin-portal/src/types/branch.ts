export type BranchOption = {
  id: string;
  name: string;
  isAggregate?: boolean;
};

export type BranchStatus = "active" | "inactive" | "planned";

export type BranchWorkingDay =
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type BranchRecord = {
  id: string;
  code: string;
  name: string;
  status: BranchStatus;
  city: string;
  province: string;
  country: string;
  addressLine: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  phone: string;
  email: string;
  managerName: string;
  employeeCount: number;
  capacity: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: BranchWorkingDay[];
  attendanceEnabled: boolean;
  payrollEnabled: boolean;
  remoteWorkEnabled: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};
