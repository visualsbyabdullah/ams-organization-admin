"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TRAINING_DELIVERY_MODE_CONFIG } from "@/config/training";
import { BRANCH_OPTIONS } from "@/data/branches";
import type {
  TrainingCourse,
  TrainingDeliveryMode,
  TrainingSession,
} from "@/types/training";

type TrainingSessionFormProps = {
  session?: TrainingSession;
  courses: TrainingCourse[];
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (session: TrainingSession) => void;
};

export function TrainingSessionForm({
  session,
  courses,
  selectedBranchId,
  onCancel,
  onSave,
}: TrainingSessionFormProps) {
  const [courseId, setCourseId] = useState(session?.courseId ?? "");

  const [branchId, setBranchId] = useState(
    session?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );

  const [facilitator, setFacilitator] = useState(session?.facilitator ?? "");

  const [venue, setVenue] = useState(session?.venue ?? "");

  const [deliveryMode, setDeliveryMode] = useState<TrainingDeliveryMode>(
    session?.deliveryMode ?? "onsite",
  );

  const [sessionDate, setSessionDate] = useState(session?.sessionDate ?? "2026-08-01");

  const [startTime, setStartTime] = useState(session?.startTime ?? "10:00");

  const [endTime, setEndTime] = useState(session?.endTime ?? "12:00");

  const [capacity, setCapacity] = useState(String(session?.capacity ?? 30));

  const [enrolledCount, setEnrolledCount] = useState(String(session?.enrolledCount ?? 0));

  const [note, setNote] = useState(session?.note ?? "");

  const [submitted, setSubmitted] = useState(false);

  const branchOptions = BRANCH_OPTIONS.filter((branch) => !branch.isAggregate);

  const publishedCourses = courses.filter(
    (course) =>
      course.status === "published" &&
      (course.scope === "organization" || !branchId || course.branchId === branchId),
  );

  const capacityValue = Math.max(Number(capacity) || 0, 0);

  const enrolledValue = Math.min(Math.max(Number(enrolledCount) || 0, 0), capacityValue);

  const isValid = Boolean(
    courseId &&
    branchId &&
    facilitator.trim() &&
    venue.trim() &&
    sessionDate &&
    startTime &&
    endTime &&
    capacityValue > 0,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    onSave({
      id: session?.id ?? crypto.randomUUID(),
      courseId,
      branchId,
      facilitator: facilitator.trim(),
      venue: venue.trim(),
      deliveryMode,
      sessionDate,
      startTime,
      endTime,
      capacity: capacityValue,
      enrolledCount: enrolledValue,
      attendanceCount: session?.attendanceCount ?? 0,
      status: session?.status ?? "scheduled",
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Course"
          htmlFor="trainingSessionCourse"
          error={submitted && !courseId ? "Select a published course" : undefined}
        >
          <Select
            id="trainingSessionCourse"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          >
            <option value="">Select course</option>

            {publishedCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Branch"
          htmlFor="trainingSessionBranch"
          error={submitted && !branchId ? "Select a branch" : undefined}
        >
          <Select
            id="trainingSessionBranch"
            value={branchId}
            onChange={(event) => {
              setBranchId(event.target.value);
              setCourseId("");
            }}
          >
            <option value="">Select branch</option>

            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Facilitator"
          htmlFor="trainingSessionFacilitator"
          error={submitted && !facilitator.trim() ? "Enter a facilitator" : undefined}
        >
          <Input
            id="trainingSessionFacilitator"
            value={facilitator}
            onChange={(event) => setFacilitator(event.target.value)}
            placeholder="Facilitator or training team"
          />
        </FormField>

        <FormField
          label="Venue or meeting link"
          htmlFor="trainingSessionVenue"
          error={
            submitted && !venue.trim() ? "Enter a venue or meeting platform" : undefined
          }
        >
          <Input
            id="trainingSessionVenue"
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
            placeholder="Training room, Teams or Zoom"
          />
        </FormField>

        <FormField label="Delivery mode" htmlFor="trainingSessionMode">
          <Select
            id="trainingSessionMode"
            value={deliveryMode}
            onChange={(event) =>
              setDeliveryMode(event.target.value as TrainingDeliveryMode)
            }
          >
            {Object.entries(TRAINING_DELIVERY_MODE_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Session date" htmlFor="trainingSessionDate">
          <Input
            id="trainingSessionDate"
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
        </FormField>

        <FormField label="Start time" htmlFor="trainingSessionStart">
          <Input
            id="trainingSessionStart"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </FormField>

        <FormField label="End time" htmlFor="trainingSessionEnd">
          <Input
            id="trainingSessionEnd"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </FormField>

        <FormField
          label="Capacity"
          htmlFor="trainingSessionCapacity"
          error={submitted && capacityValue <= 0 ? "Enter a valid capacity" : undefined}
        >
          <Input
            id="trainingSessionCapacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
          />
        </FormField>

        <FormField label="Current enrollments" htmlFor="trainingSessionEnrollments">
          <Input
            id="trainingSessionEnrollments"
            type="number"
            min="0"
            max={capacityValue}
            value={enrolledCount}
            onChange={(event) => setEnrolledCount(event.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Session note" htmlFor="trainingSessionNote" optional>
        <Textarea
          id="trainingSessionNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add equipment, attendance or facilitator instructions..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{session ? "Save session" : "Schedule session"}</Button>
      </div>
    </form>
  );
}
