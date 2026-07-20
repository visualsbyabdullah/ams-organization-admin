"use client";

import { type FormEvent, useMemo, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_ADMIN } from "@/data/current-admin";
import { EMPLOYEES } from "@/data/employees";
import type { TrainingCourse, TrainingEnrollment } from "@/types/training";

type TrainingEnrollmentFormProps = {
  courses: TrainingCourse[];
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (enrollment: TrainingEnrollment) => void;
};

export function TrainingEnrollmentForm({
  courses,
  selectedBranchId,
  onCancel,
  onSave,
}: TrainingEnrollmentFormProps) {
  const [employeeId, setEmployeeId] = useState("");

  const [courseId, setCourseId] = useState("");

  const [dueDate, setDueDate] = useState("2026-08-31");

  const [note, setNote] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const availableEmployees = useMemo(
    () =>
      EMPLOYEES.filter(
        (employee) =>
          selectedBranchId === "all" || employee.branchId === selectedBranchId,
      ),
    [selectedBranchId],
  );

  const selectedEmployee = EMPLOYEES.find((employee) => employee.id === employeeId);

  const availableCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.status === "published" &&
          (course.scope === "organization" ||
            (selectedEmployee
              ? course.branchId === selectedEmployee.branchId
              : selectedBranchId === "all" || course.branchId === selectedBranchId)),
      ),
    [courses, selectedBranchId, selectedEmployee],
  );

  const isValid = Boolean(selectedEmployee && courseId && dueDate);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid || !selectedEmployee) {
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      courseId,
      employeeId: selectedEmployee.id,
      branchId: selectedEmployee.branchId,
      status: "assigned",
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate,
      progress: 0,
      attempts: 0,
      assignedBy: CURRENT_ADMIN.name,
      note: note.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Employee"
          htmlFor="trainingEnrollmentEmployee"
          error={submitted && !employeeId ? "Select an employee" : undefined}
        >
          <Select
            id="trainingEnrollmentEmployee"
            value={employeeId}
            onChange={(event) => {
              setEmployeeId(event.target.value);
              setCourseId("");
            }}
          >
            <option value="">Select employee</option>

            {availableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} â€” {employee.employeeCode}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Published course"
          htmlFor="trainingEnrollmentCourse"
          error={submitted && !courseId ? "Select a course" : undefined}
        >
          <Select
            id="trainingEnrollmentCourse"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            disabled={!employeeId}
          >
            <option value="">Select course</option>

            {availableCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} â€” {course.code}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Completion due date"
          htmlFor="trainingEnrollmentDueDate"
          error={submitted && !dueDate ? "Select a due date" : undefined}
        >
          <Input
            id="trainingEnrollmentDueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Assignment note" htmlFor="trainingEnrollmentNote" optional>
        <Textarea
          id="trainingEnrollmentNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add manager instructions or assignment context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">Assign course</Button>
      </div>
    </form>
  );
}
