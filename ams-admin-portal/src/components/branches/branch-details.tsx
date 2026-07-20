import {
  Building2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";

import {
  BranchMap,
} from "@/components/branches/branch-map";
import {
  Badge,
} from "@/components/ui/badge";
import {
  BRANCH_STATUS_CONFIG,
} from "@/config/branches";
import {
  formatBranchWorkingDays,
  getBranchCapacityUtilization,
  getBranchCoordinates,
} from "@/lib/branches";
import type {
  BranchRecord,
} from "@/types/branch";

type BranchDetailsProps = {
  branch: BranchRecord;
};

export function BranchDetails({
  branch,
}: BranchDetailsProps) {
  const capacityUtilization =
    getBranchCapacityUtilization(
      branch,
    );

  return (
    <div className="space-y-6">
      <BranchMap branch={branch} />

      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
              <Building2 size={19} />
            </span>

            <div>
              <p className="text-xs font-semibold text-primary">
                {branch.code}
              </p>
              <h3 className="mt-1 font-bold">
                {branch.name}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {branch.city},{" "}
                {branch.province}
              </p>
            </div>
          </div>

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
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <MapPin size={14} />
              Address
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {branch.addressLine},{" "}
              {branch.city},{" "}
              {branch.country}{" "}
              {branch.postalCode}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <UserRound size={14} />
              Branch manager
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {branch.managerName}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <Phone size={14} />
              Phone
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {branch.phone}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <Mail size={14} />
              Email
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {branch.email}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <Users size={14} />
              Employees
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {branch.employeeCount} of{" "}
              {branch.capacity} capacity
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-xs text-text-muted">
              <Clock3 size={14} />
              Working schedule
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {branch.workingHoursStart}–
              {branch.workingHoursEnd}
            </dd>
            <dd className="mt-1 text-xs text-text-muted">
              {formatBranchWorkingDays(
                branch,
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-text-muted">
              Latitude / longitude
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {getBranchCoordinates(
                branch,
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-text-muted">
              Capacity utilization
            </dt>
            <dd className="mt-2 text-sm font-semibold">
              {capacityUtilization}%
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-bold">
          Enabled branch modules
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-control border border-border p-4">
            <span className="text-sm font-semibold">
              Attendance
            </span>
            <Badge
              variant={
                branch.attendanceEnabled
                  ? "success"
                  : "neutral"
              }
            >
              {branch.attendanceEnabled
                ? "Enabled"
                : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-control border border-border p-4">
            <span className="text-sm font-semibold">
              Payroll
            </span>
            <Badge
              variant={
                branch.payrollEnabled
                  ? "success"
                  : "neutral"
              }
            >
              {branch.payrollEnabled
                ? "Enabled"
                : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-control border border-border p-4">
            <span className="text-sm font-semibold">
              Remote work
            </span>
            <Badge
              variant={
                branch.remoteWorkEnabled
                  ? "success"
                  : "neutral"
              }
            >
              {branch.remoteWorkEnabled
                ? "Enabled"
                : "Disabled"}
            </Badge>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">
          Internal note
        </h3>
        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {branch.note ||
            "No branch note has been added."}
        </p>
      </section>
    </div>
  );
}
