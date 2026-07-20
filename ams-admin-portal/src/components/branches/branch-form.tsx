"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  BranchMap,
} from "@/components/branches/branch-map";
import {
  FormField,
} from "@/components/forms/form-field";
import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  Select,
} from "@/components/ui/select";
import {
  Switch,
} from "@/components/ui/switch";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  BRANCH_COPY,
  BRANCH_STATUS_CONFIG,
  BRANCH_TIMEZONE_OPTIONS,
  BRANCH_WORKING_DAY_CONFIG,
  BRANCH_WORKING_DAYS,
} from "@/config/branches";
import {
  CURRENT_ADMIN,
} from "@/data/current-admin";
import {
  createBranchId,
} from "@/lib/branches";
import type {
  BranchRecord,
  BranchStatus,
  BranchWorkingDay,
} from "@/types/branch";

type BranchFormProps = {
  branch?: BranchRecord;
  onCancel: () => void;
  onSave: (
    branch: BranchRecord,
  ) => void;
};

export function BranchForm({
  branch,
  onCancel,
  onSave,
}: BranchFormProps) {
  const [code, setCode] =
    useState(branch?.code ?? "");
  const [name, setName] =
    useState(branch?.name ?? "");
  const [status, setStatus] =
    useState<BranchStatus>(
      branch?.status ?? "planned",
    );
  const [city, setCity] =
    useState(branch?.city ?? "");
  const [province, setProvince] =
    useState(branch?.province ?? "");
  const [country, setCountry] =
    useState(
      branch?.country ?? "Pakistan",
    );
  const [addressLine, setAddressLine] =
    useState(
      branch?.addressLine ?? "",
    );
  const [postalCode, setPostalCode] =
    useState(
      branch?.postalCode ?? "",
    );
  const [latitude, setLatitude] =
    useState(
      String(branch?.latitude ?? 0),
    );
  const [longitude, setLongitude] =
    useState(
      String(branch?.longitude ?? 0),
    );
  const [timezone, setTimezone] =
    useState(
      branch?.timezone ??
        BRANCH_TIMEZONE_OPTIONS[0]
          .value,
    );
  const [phone, setPhone] =
    useState(branch?.phone ?? "");
  const [email, setEmail] =
    useState(branch?.email ?? "");
  const [managerName, setManagerName] =
    useState(
      branch?.managerName ?? "",
    );
  const [employeeCount, setEmployeeCount] =
    useState(
      String(
        branch?.employeeCount ?? 0,
      ),
    );
  const [capacity, setCapacity] =
    useState(
      String(branch?.capacity ?? 50),
    );
  const [workingHoursStart, setWorkingHoursStart] =
    useState(
      branch?.workingHoursStart ??
        "09:00",
    );
  const [workingHoursEnd, setWorkingHoursEnd] =
    useState(
      branch?.workingHoursEnd ??
        "18:00",
    );
  const [workingDays, setWorkingDays] =
    useState<BranchWorkingDay[]>(
      branch?.workingDays ?? [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
    );
  const [attendanceEnabled, setAttendanceEnabled] =
    useState(
      branch?.attendanceEnabled ??
        true,
    );
  const [payrollEnabled, setPayrollEnabled] =
    useState(
      branch?.payrollEnabled ?? true,
    );
  const [remoteWorkEnabled, setRemoteWorkEnabled] =
    useState(
      branch?.remoteWorkEnabled ??
        false,
    );
  const [note, setNote] =
    useState(branch?.note ?? "");
  const [submitted, setSubmitted] =
    useState(false);

  const latitudeValue =
    Number(latitude);
  const longitudeValue =
    Number(longitude);
  const employeeCountValue =
    Math.max(
      Number(employeeCount) || 0,
      0,
    );
  const capacityValue = Math.max(
    Number(capacity) || 0,
    0,
  );

  const coordinatesValid =
    Number.isFinite(latitudeValue) &&
    latitudeValue >= -90 &&
    latitudeValue <= 90 &&
    Number.isFinite(longitudeValue) &&
    longitudeValue >= -180 &&
    longitudeValue <= 180;

  const isValid = Boolean(
    code.trim() &&
      name.trim() &&
      city.trim() &&
      province.trim() &&
      country.trim() &&
      addressLine.trim() &&
      coordinatesValid &&
      managerName.trim() &&
      capacityValue > 0 &&
      employeeCountValue <=
        capacityValue &&
      workingDays.length > 0,
  );

  const mapPreview: BranchRecord = {
    id:
      branch?.id ??
      createBranchId(code),
    code: code.trim().toUpperCase(),
    name:
      name.trim() ||
      "Branch map preview",
    status,
    city: city.trim(),
    province: province.trim(),
    country: country.trim(),
    addressLine: addressLine.trim(),
    postalCode: postalCode.trim(),
    latitude:
      Number.isFinite(latitudeValue)
        ? latitudeValue
        : 0,
    longitude:
      Number.isFinite(longitudeValue)
        ? longitudeValue
        : 0,
    timezone,
    phone: phone.trim(),
    email: email.trim(),
    managerName:
      managerName.trim(),
    employeeCount:
      employeeCountValue,
    capacity: capacityValue,
    workingHoursStart,
    workingHoursEnd,
    workingDays,
    attendanceEnabled,
    payrollEnabled,
    remoteWorkEnabled,
    note: note.trim(),
    createdAt:
      branch?.createdAt ??
      new Date()
        .toISOString()
        .slice(0, 10),
    updatedAt: new Date()
      .toISOString()
      .slice(0, 10),
    updatedBy:
      CURRENT_ADMIN.name,
  };

  function toggleWorkingDay(
    day: BranchWorkingDay,
    checked: boolean,
  ) {
    setWorkingDays(
      (currentDays) =>
        checked
          ? Array.from(
              new Set([
                ...currentDays,
                day,
              ]),
            )
          : currentDays.filter(
              (item) => item !== day,
            ),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    onSave(mapPreview);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section>
        <h3 className="font-bold">
          Branch identity
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Branch code"
            htmlFor="branchCode"
            error={
              submitted && !code.trim()
                ? "Enter a branch code"
                : undefined
            }
          >
            <Input
              id="branchCode"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
              placeholder="Example: ISB"
            />
          </FormField>

          <FormField
            label="Branch name"
            htmlFor="branchName"
            error={
              submitted && !name.trim()
                ? "Enter a branch name"
                : undefined
            }
          >
            <Input
              id="branchName"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Example: Islamabad Branch"
            />
          </FormField>

          <FormField
            label="Branch status"
            htmlFor="branchStatus"
          >
            <Select
              id="branchStatus"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as BranchStatus,
                )
              }
            >
              {Object.entries(
                BRANCH_STATUS_CONFIG,
              ).map(
                ([value, config]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </option>
                ),
              )}
            </Select>
          </FormField>

          <FormField
            label="Branch manager"
            htmlFor="branchManager"
            error={
              submitted &&
              !managerName.trim()
                ? "Enter the branch manager"
                : undefined
            }
          >
            <Input
              id="branchManager"
              value={managerName}
              onChange={(event) =>
                setManagerName(
                  event.target.value,
                )
              }
              placeholder="Manager name"
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Address and coordinates
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Latitude and longitude control the branch marker shown on every map.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="City"
            htmlFor="branchCity"
            error={
              submitted && !city.trim()
                ? "Enter the city"
                : undefined
            }
          >
            <Input
              id="branchCity"
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Province / region"
            htmlFor="branchProvince"
            error={
              submitted &&
              !province.trim()
                ? "Enter the province or region"
                : undefined
            }
          >
            <Input
              id="branchProvince"
              value={province}
              onChange={(event) =>
                setProvince(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Country"
            htmlFor="branchCountry"
            error={
              submitted &&
              !country.trim()
                ? "Enter the country"
                : undefined
            }
          >
            <Input
              id="branchCountry"
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Postal code"
            htmlFor="branchPostalCode"
            optional
          >
            <Input
              id="branchPostalCode"
              value={postalCode}
              onChange={(event) =>
                setPostalCode(
                  event.target.value,
                )
              }
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField
              label="Street address"
              htmlFor="branchAddress"
              error={
                submitted &&
                !addressLine.trim()
                  ? "Enter the branch address"
                  : undefined
              }
            >
              <Input
                id="branchAddress"
                value={addressLine}
                onChange={(event) =>
                  setAddressLine(
                    event.target.value,
                  )
                }
                placeholder="Office building, street or area"
              />
            </FormField>
          </div>

          <FormField
            label="Latitude"
            htmlFor="branchLatitude"
            error={
              submitted &&
              (!Number.isFinite(
                latitudeValue,
              ) ||
                latitudeValue < -90 ||
                latitudeValue > 90)
                ? "Latitude must be between -90 and 90"
                : undefined
            }
          >
            <Input
              id="branchLatitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              value={latitude}
              onChange={(event) =>
                setLatitude(
                  event.target.value,
                )
              }
              placeholder="33.6844"
            />
          </FormField>

          <FormField
            label="Longitude"
            htmlFor="branchLongitude"
            error={
              submitted &&
              (!Number.isFinite(
                longitudeValue,
              ) ||
                longitudeValue < -180 ||
                longitudeValue > 180)
                ? "Longitude must be between -180 and 180"
                : undefined
            }
          >
            <Input
              id="branchLongitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              value={longitude}
              onChange={(event) =>
                setLongitude(
                  event.target.value,
                )
              }
              placeholder="73.0479"
            />
          </FormField>

          <FormField
            label="Timezone"
            htmlFor="branchTimezone"
          >
            <Select
              id="branchTimezone"
              value={timezone}
              onChange={(event) =>
                setTimezone(
                  event.target.value,
                )
              }
            >
              {BRANCH_TIMEZONE_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </Select>
          </FormField>
        </div>

        {coordinatesValid && (
          <div className="mt-5">
            <BranchMap
              branch={mapPreview}
              compact
            />
          </div>
        )}
      </section>

      <section>
        <h3 className="font-bold">
          Contact and capacity
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Phone"
            htmlFor="branchPhone"
            optional
          >
            <Input
              id="branchPhone"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="branchEmail"
            optional
          >
            <Input
              id="branchEmail"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Current employees"
            htmlFor="branchEmployeeCount"
            error={
              submitted &&
              employeeCountValue >
                capacityValue
                ? "Employees cannot exceed branch capacity"
                : undefined
            }
          >
            <Input
              id="branchEmployeeCount"
              type="number"
              min="0"
              value={employeeCount}
              onChange={(event) =>
                setEmployeeCount(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Branch capacity"
            htmlFor="branchCapacity"
            error={
              submitted &&
              capacityValue <= 0
                ? "Enter a valid branch capacity"
                : undefined
            }
          >
            <Input
              id="branchCapacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(event) =>
                setCapacity(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Working hours start"
            htmlFor="branchWorkingStart"
          >
            <Input
              id="branchWorkingStart"
              type="time"
              value={workingHoursStart}
              onChange={(event) =>
                setWorkingHoursStart(
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Working hours end"
            htmlFor="branchWorkingEnd"
          >
            <Input
              id="branchWorkingEnd"
              type="time"
              value={workingHoursEnd}
              onChange={(event) =>
                setWorkingHoursEnd(
                  event.target.value,
                )
              }
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">
          Working days
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {BRANCH_WORKING_DAYS.map(
            (day) => (
              <div
                key={day}
                className="flex items-center justify-between gap-4 rounded-control border border-border p-4"
              >
                <span className="text-sm font-semibold">
                  {
                    BRANCH_WORKING_DAY_CONFIG[
                      day
                    ].label
                  }
                </span>

                <Switch
                  checked={workingDays.includes(
                    day,
                  )}
                  onCheckedChange={(
                    checked,
                  ) =>
                    toggleWorkingDay(
                      day,
                      checked,
                    )
                  }
                  ariaLabel={`Enable ${BRANCH_WORKING_DAY_CONFIG[day].label}`}
                />
              </div>
            ),
          )}
        </div>

        {submitted &&
          workingDays.length === 0 && (
            <p className="mt-3 text-sm font-medium text-danger">
              Enable at least one working day.
            </p>
          )}
      </section>

      <section>
        <h3 className="font-bold">
          Branch modules
        </h3>

        <div className="mt-4 space-y-3">
          {[
            {
              label: "Attendance",
              description:
                "Allow attendance registers, schedules and timesheets for this branch.",
              checked:
                attendanceEnabled,
              onChange:
                setAttendanceEnabled,
            },
            {
              label: "Payroll",
              description:
                "Include this branch in payroll runs and payroll reporting.",
              checked: payrollEnabled,
              onChange:
                setPayrollEnabled,
            },
            {
              label: "Remote work",
              description:
                "Allow branch employees to use remote-work workflows.",
              checked:
                remoteWorkEnabled,
              onChange:
                setRemoteWorkEnabled,
            },
          ].map((control) => (
            <div
              key={control.label}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">
                  {control.label}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {control.description}
                </p>
              </div>

              <Switch
                checked={control.checked}
                onCheckedChange={
                  control.onChange
                }
                ariaLabel={control.label}
              />
            </div>
          ))}
        </div>
      </section>

      <FormField
        label="Internal note"
        htmlFor="branchNote"
        optional
      >
        <Textarea
          id="branchNote"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
          placeholder="Add operational or location context for this branch..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          {BRANCH_COPY.actions.cancel}
        </Button>

        <Button type="submit">
          {branch
            ? BRANCH_COPY.actions.save
            : BRANCH_COPY.actions.create}
        </Button>
      </div>
    </form>
  );
}
