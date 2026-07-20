"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  TRAINING_CATEGORY_CONFIG,
  TRAINING_COURSE_SCOPE_CONFIG,
  TRAINING_COURSE_STATUS_CONFIG,
  TRAINING_DELIVERY_MODE_CONFIG,
} from "@/config/training";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  TrainingCategory,
  TrainingCourse,
  TrainingCourseScope,
  TrainingCourseStatus,
  TrainingDeliveryMode,
} from "@/types/training";

type TrainingCourseFormProps = {
  course?: TrainingCourse;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (course: TrainingCourse) => void;
};

export function TrainingCourseForm({
  course,
  selectedBranchId,
  onCancel,
  onSave,
}: TrainingCourseFormProps) {
  const [title, setTitle] = useState(
    course?.title ?? "",
  );

  const [code, setCode] = useState(
    course?.code ?? "",
  );

  const [category, setCategory] =
    useState<TrainingCategory>(
      course?.category ?? "professional_development",
    );

  const [scope, setScope] =
    useState<TrainingCourseScope>(
      course?.scope ?? "organization",
    );

  const [branchId, setBranchId] = useState(
    course?.branchId ??
      (selectedBranchId === "all"
        ? ""
        : selectedBranchId),
  );

  const [status, setStatus] =
    useState<TrainingCourseStatus>(
      course?.status ?? "draft",
    );

  const [deliveryMode, setDeliveryMode] =
    useState<TrainingDeliveryMode>(
      course?.deliveryMode ?? "virtual",
    );

  const [durationHours, setDurationHours] =
    useState(String(course?.durationHours ?? 2));

  const [passingScore, setPassingScore] =
    useState(String(course?.passingScore ?? 70));

  const [mandatory, setMandatory] = useState(
    course?.mandatory ?? false,
  );

  const [certificationValidityMonths, setCertificationValidityMonths] =
    useState(
      String(course?.certificationValidityMonths ?? 0),
    );

  const [capacity, setCapacity] = useState(
    String(course?.capacity ?? 30),
  );

  const [provider, setProvider] = useState(
    course?.provider ?? "",
  );

  const [ownerName, setOwnerName] = useState(
    course?.ownerName ?? CURRENT_ADMIN.name,
  );

  const [description, setDescription] =
    useState(course?.description ?? "");

  const [note, setNote] = useState(
    course?.note ?? "",
  );

  const [submitted, setSubmitted] =
    useState(false);

  const branchOptions = BRANCH_OPTIONS.filter(
    (branch) => !branch.isAggregate,
  );

  const durationValue = Math.max(
    Number(durationHours) || 0,
    0,
  );

  const passingScoreValue = Math.min(
    Math.max(Number(passingScore) || 0, 0),
    100,
  );

  const capacityValue = Math.max(
    Number(capacity) || 0,
    0,
  );

  const validityValue = Math.max(
    Number(certificationValidityMonths) || 0,
    0,
  );

  const isValid = Boolean(
    title.trim() &&
      code.trim() &&
      provider.trim() &&
      ownerName.trim() &&
      description.trim() &&
      durationValue > 0 &&
      capacityValue > 0 &&
      (scope === "organization" || branchId),
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const selectedBranch = branchOptions.find(
      (branch) => branch.id === branchId,
    );

    onSave({
      id: course?.id ?? crypto.randomUUID(),
      title: title.trim(),
      code: code.trim().toUpperCase(),
      category,
      scope,
      branchId:
        scope === "branch"
          ? branchId
          : undefined,
      branchName:
        scope === "branch"
          ? selectedBranch?.name
          : undefined,
      status,
      deliveryMode,
      durationHours: durationValue,
      passingScore: passingScoreValue,
      mandatory,
      certificationValidityMonths:
        validityValue,
      capacity: capacityValue,
      provider: provider.trim(),
      ownerName: ownerName.trim(),
      description: description.trim(),
      updatedAt: new Date()
        .toISOString()
        .slice(0, 10),
      note: note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Course title"
          htmlFor="trainingCourseTitle"
          error={
            submitted && !title.trim()
              ? "Enter a course title"
              : undefined
          }
        >
          <Input
            id="trainingCourseTitle"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Example: Information Security Awareness"
          />
        </FormField>

        <FormField
          label="Course code"
          htmlFor="trainingCourseCode"
          error={
            submitted && !code.trim()
              ? "Enter a course code"
              : undefined
          }
        >
          <Input
            id="trainingCourseCode"
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            placeholder="TRN-SEC-001"
          />
        </FormField>

        <FormField
          label="Category"
          htmlFor="trainingCourseCategory"
        >
          <Select
            id="trainingCourseCategory"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as TrainingCategory,
              )
            }
          >
            {Object.entries(
              TRAINING_CATEGORY_CONFIG,
            ).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Course status"
          htmlFor="trainingCourseStatus"
        >
          <Select
            id="trainingCourseStatus"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as TrainingCourseStatus,
              )
            }
          >
            {Object.entries(
              TRAINING_COURSE_STATUS_CONFIG,
            ).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Course scope"
          htmlFor="trainingCourseScope"
        >
          <Select
            id="trainingCourseScope"
            value={scope}
            onChange={(event) =>
              setScope(
                event.target.value as TrainingCourseScope,
              )
            }
          >
            {Object.entries(
              TRAINING_COURSE_SCOPE_CONFIG,
            ).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="trainingCourseBranch"
            error={
              submitted && !branchId
                ? "Select a branch"
                : undefined
            }
          >
            <Select
              id="trainingCourseBranch"
              value={branchId}
              onChange={(event) =>
                setBranchId(event.target.value)
              }
            >
              <option value="">Select branch</option>

              {branchOptions.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField
          label="Delivery mode"
          htmlFor="trainingDeliveryMode"
        >
          <Select
            id="trainingDeliveryMode"
            value={deliveryMode}
            onChange={(event) =>
              setDeliveryMode(
                event.target.value as TrainingDeliveryMode,
              )
            }
          >
            {Object.entries(
              TRAINING_DELIVERY_MODE_CONFIG,
            ).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Duration in hours"
          htmlFor="trainingDurationHours"
          error={
            submitted && durationValue <= 0
              ? "Enter a valid duration"
              : undefined
          }
        >
          <Input
            id="trainingDurationHours"
            type="number"
            min="0.25"
            step="0.25"
            value={durationHours}
            onChange={(event) =>
              setDurationHours(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Passing score"
          htmlFor="trainingPassingScore"
          description="Use zero when the course has no assessment."
        >
          <Input
            id="trainingPassingScore"
            type="number"
            min="0"
            max="100"
            value={passingScore}
            onChange={(event) =>
              setPassingScore(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Course capacity"
          htmlFor="trainingCourseCapacity"
          error={
            submitted && capacityValue <= 0
              ? "Enter a valid capacity"
              : undefined
          }
        >
          <Input
            id="trainingCourseCapacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(event) =>
              setCapacity(event.target.value)
            }
          />
        </FormField>

        <FormField
          label="Certificate validity"
          htmlFor="trainingCertificateValidity"
          description="Months before expiry; use zero for no expiry."
        >
          <Input
            id="trainingCertificateValidity"
            type="number"
            min="0"
            value={certificationValidityMonths}
            onChange={(event) =>
              setCertificationValidityMonths(
                event.target.value,
              )
            }
          />
        </FormField>

        <FormField
          label="Training provider"
          htmlFor="trainingProvider"
          error={
            submitted && !provider.trim()
              ? "Enter a provider"
              : undefined
          }
        >
          <Input
            id="trainingProvider"
            value={provider}
            onChange={(event) =>
              setProvider(event.target.value)
            }
            placeholder="Internal L&D or external provider"
          />
        </FormField>

        <FormField
          label="Course owner"
          htmlFor="trainingOwner"
          error={
            submitted && !ownerName.trim()
              ? "Enter a course owner"
              : undefined
          }
        >
          <Input
            id="trainingOwner"
            value={ownerName}
            onChange={(event) =>
              setOwnerName(event.target.value)
            }
          />
        </FormField>
      </section>

      <div className="flex items-center justify-between gap-5 rounded-control border border-border p-4">
        <div>
          <p className="text-sm font-semibold">
            Mandatory training
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Mark this course as required for assigned employees.
          </p>
        </div>

        <Switch
          checked={mandatory}
          onCheckedChange={setMandatory}
          ariaLabel="Mandatory training course"
        />
      </div>

      <FormField
        label="Course description"
        htmlFor="trainingCourseDescription"
        error={
          submitted && !description.trim()
            ? "Enter a course description"
            : undefined
        }
      >
        <Textarea
          id="trainingCourseDescription"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Explain the learning outcomes and intended audience..."
        />
      </FormField>

      <FormField
        label="Internal note"
        htmlFor="trainingCourseNote"
        optional
      >
        <Textarea
          id="trainingCourseNote"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Add rollout, facilitator or compliance context..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          {course ? "Save course" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
