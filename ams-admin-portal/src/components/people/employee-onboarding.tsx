"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  UserPlus,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";

import { CheckboxField } from "@/components/forms/checkbox-field";
import { FormField } from "@/components/forms/form-field";
import { OnboardingStepper } from "@/components/people/onboarding-stepper";
import { PeopleTabs } from "@/components/people/people-tabs";
import { PageHeader } from "@/components/shared/page-header";
import {
  buttonVariants,
  Button,
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DEPARTMENT_OPTIONS,
  DESIGNATION_OPTIONS,
  EMPLOYEE_DRAFT_STORAGE_KEY,
  EMPLOYMENT_TYPE_OPTIONS,
  MANAGER_OPTIONS,
  ONBOARDING_DEFAULT_VALUES,
  ONBOARDING_STEPS,
  PAYMENT_METHOD_OPTIONS,
  PAY_FREQUENCY_OPTIONS,
  SHIFT_OPTIONS,
  SYSTEM_ROLE_OPTIONS,
} from "@/config/onboarding";
import { useBranchScope } from "@/context/branch-scope-context";
import {
  employeeOnboardingSchema,
  type EmployeeOnboardingValues,
} from "@/validations/employee-onboarding";

function getError(
  errors: FieldErrors<EmployeeOnboardingValues>,
  field: keyof EmployeeOnboardingValues,
) {
  return errors[field]?.message?.toString();
}

function findOptionLabel(
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>,
  value: string,
) {
  return (
    options.find(
      (option) => option.value === value,
    )?.label ?? "Not provided"
  );
}

export function EmployeeOnboarding() {
  const {
    branches,
    selectedBranch,
  } = useBranchScope();

  const [currentStep, setCurrentStep] =
    useState(0);
  const [draftSavedAt, setDraftSavedAt] =
    useState<string | null>(null);
  const [created, setCreated] =
    useState(false);

  const defaultValues = useMemo(
    () => ({
      ...ONBOARDING_DEFAULT_VALUES,
      branchId: selectedBranch.isAggregate
        ? ""
        : selectedBranch.id,
    }),
    [selectedBranch.id, selectedBranch.isAggregate],
  );

  const {
    register,
    control,
    reset,
    trigger,
    getValues,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<EmployeeOnboardingValues>({
    resolver: zodResolver(
      employeeOnboardingSchema,
    ),
    defaultValues,
    mode: "onBlur",
  });

  const values = useWatch({
    control,
    defaultValue: defaultValues,
  });
  const currentStepConfig =
    ONBOARDING_STEPS[currentStep];

  useEffect(() => {
    const storedDraft =
      window.localStorage.getItem(
        EMPLOYEE_DRAFT_STORAGE_KEY,
      );

    if (!storedDraft) {
      return;
    }

    try {
      const parsedDraft =
        JSON.parse(storedDraft);

      reset({
        ...defaultValues,
        ...parsedDraft,
      });
    } catch {
      window.localStorage.removeItem(
        EMPLOYEE_DRAFT_STORAGE_KEY,
      );
    }
  }, [defaultValues, reset]);

  async function handleNext() {
    const isValid = await trigger(
      [...currentStepConfig.fields],
      {
        shouldFocus: true,
      },
    );

    if (!isValid) {
      return;
    }

    setCurrentStep((step) =>
      Math.min(
        step + 1,
        ONBOARDING_STEPS.length - 1,
      ),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleBack() {
    setCurrentStep((step) =>
      Math.max(step - 1, 0),
    );
  }

  function saveDraft() {
    window.localStorage.setItem(
      EMPLOYEE_DRAFT_STORAGE_KEY,
      JSON.stringify(getValues()),
    );

    setDraftSavedAt(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    );
  }

  async function createEmployee(
    data: EmployeeOnboardingValues,
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    );

    console.info(
      "Employee ready for API submission",
      data,
    );

    window.localStorage.removeItem(
      EMPLOYEE_DRAFT_STORAGE_KEY,
    );

    setCreated(true);
  }

  if (created) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-8 text-center md:p-12">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-muted text-success">
            <CheckCircle2 size={28} />
          </span>

          <h1 className="mt-5 text-2xl font-bold">
            Employee created
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-muted">
            {values.firstName}{" "}
            {values.lastName} has been added to
            the organization.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/people"
              className={buttonVariants({
                variant: "outline",
              })}
            >
              View directory
            </Link>

            <Button
              onClick={() => {
                reset(defaultValues);
                setCurrentStep(0);
                setCreated(false);
              }}
            >
              <UserPlus />
              Add another employee
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow="People"
        title="Add employee"
        description="Create a complete employee record, assign their workplace and configure portal access."
      />

      <div className="mt-7">
        <PeopleTabs />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Card className="h-fit p-3 lg:sticky lg:top-24">
          <OnboardingStepper
            currentStep={currentStep}
          />
        </Card>

        <form
          onSubmit={handleSubmit(createEmployee)}
        >
          <Card>
            <header className="border-b border-border p-6">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                Step {currentStep + 1} of{" "}
                {ONBOARDING_STEPS.length}
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {currentStepConfig.label}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {
                  currentStepConfig.description
                }
              </p>
            </header>

            <div className="p-6">
              {currentStep === 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="First name"
                    htmlFor="firstName"
                    error={getError(
                      errors,
                      "firstName",
                    )}
                  >
                    <Input
                      id="firstName"
                      autoComplete="given-name"
                      {...register("firstName")}
                    />
                  </FormField>

                  <FormField
                    label="Last name"
                    htmlFor="lastName"
                    error={getError(
                      errors,
                      "lastName",
                    )}
                  >
                    <Input
                      id="lastName"
                      autoComplete="family-name"
                      {...register("lastName")}
                    />
                  </FormField>

                  <FormField
                    label="Registered email"
                    htmlFor="email"
                    description="This may be a personal or company-provided email."
                    error={getError(
                      errors,
                      "email",
                    )}
                  >
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                    />
                  </FormField>

                  <FormField
                    label="Phone number"
                    htmlFor="phone"
                    error={getError(
                      errors,
                      "phone",
                    )}
                  >
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+92 300 1234567"
                      {...register("phone")}
                    />
                  </FormField>

                  <FormField
                    label="CNIC"
                    htmlFor="cnic"
                    optional
                    error={getError(
                      errors,
                      "cnic",
                    )}
                  >
                    <Input
                      id="cnic"
                      placeholder="12345-1234567-1"
                      {...register("cnic")}
                    />
                  </FormField>

                  <FormField
                    label="Date of birth"
                    htmlFor="dateOfBirth"
                    optional
                    error={getError(
                      errors,
                      "dateOfBirth",
                    )}
                  >
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register(
                        "dateOfBirth",
                      )}
                    />
                  </FormField>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Employee ID"
                    htmlFor="employeeCode"
                    description="A unique internal employee identifier."
                    error={getError(
                      errors,
                      "employeeCode",
                    )}
                  >
                    <Input
                      id="employeeCode"
                      placeholder="AMS-007"
                      {...register(
                        "employeeCode",
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Joining date"
                    htmlFor="joinDate"
                    error={getError(
                      errors,
                      "joinDate",
                    )}
                  >
                    <Input
                      id="joinDate"
                      type="date"
                      {...register("joinDate")}
                    />
                  </FormField>

                  <FormField
                    label="Employment type"
                    htmlFor="employmentType"
                    error={getError(
                      errors,
                      "employmentType",
                    )}
                  >
                    <Select
                      id="employmentType"
                      {...register(
                        "employmentType",
                      )}
                    >
                      {EMPLOYMENT_TYPE_OPTIONS.map(
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

                  <FormField
                    label="Probation end date"
                    htmlFor="probationEndDate"
                    optional
                    error={getError(
                      errors,
                      "probationEndDate",
                    )}
                  >
                    <Input
                      id="probationEndDate"
                      type="date"
                      {...register(
                        "probationEndDate",
                      )}
                    />
                  </FormField>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Branch"
                    htmlFor="branchId"
                    error={getError(
                      errors,
                      "branchId",
                    )}
                  >
                    <Select
                      id="branchId"
                      {...register("branchId")}
                    >
                      <option value="">
                        Select branch
                      </option>

                      {branches
                        .filter(
                          (branch) =>
                            !branch.isAggregate,
                        )
                        .map((branch) => (
                          <option
                            key={branch.id}
                            value={branch.id}
                          >
                            {branch.name}
                          </option>
                        ))}
                    </Select>
                  </FormField>

                  <FormField
                    label="Department"
                    htmlFor="department"
                    error={getError(
                      errors,
                      "department",
                    )}
                  >
                    <Select
                      id="department"
                      {...register(
                        "department",
                      )}
                    >
                      <option value="">
                        Select department
                      </option>

                      {DEPARTMENT_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormField>

                  <FormField
                    label="Designation"
                    htmlFor="designation"
                    error={getError(
                      errors,
                      "designation",
                    )}
                  >
                    <Select
                      id="designation"
                      {...register(
                        "designation",
                      )}
                    >
                      <option value="">
                        Select designation
                      </option>

                      {DESIGNATION_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormField>

                  <FormField
                    label="Reporting manager"
                    htmlFor="managerId"
                    optional
                    error={getError(
                      errors,
                      "managerId",
                    )}
                  >
                    <Select
                      id="managerId"
                      {...register(
                        "managerId",
                      )}
                    >
                      {MANAGER_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value ||
                              "none"
                            }
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormField>

                  <FormField
                    label="Work shift"
                    htmlFor="shiftId"
                    className="md:col-span-2"
                    error={getError(
                      errors,
                      "shiftId",
                    )}
                  >
                    <Select
                      id="shiftId"
                      {...register("shiftId")}
                    >
                      {SHIFT_OPTIONS.map(
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
              )}

              {currentStep === 3 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Monthly salary"
                    htmlFor="monthlySalary"
                    description="Enter the employee's gross monthly salary."
                    error={getError(
                      errors,
                      "monthlySalary",
                    )}
                  >
                    <Input
                      id="monthlySalary"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="75000"
                      {...register(
                        "monthlySalary",
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Pay frequency"
                    htmlFor="payFrequency"
                    error={getError(
                      errors,
                      "payFrequency",
                    )}
                  >
                    <Select
                      id="payFrequency"
                      {...register(
                        "payFrequency",
                      )}
                    >
                      {PAY_FREQUENCY_OPTIONS.map(
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

                  <FormField
                    label="Payment method"
                    htmlFor="paymentMethod"
                    error={getError(
                      errors,
                      "paymentMethod",
                    )}
                  >
                    <Select
                      id="paymentMethod"
                      {...register(
                        "paymentMethod",
                      )}
                    >
                      {PAYMENT_METHOD_OPTIONS.map(
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

                  <FormField
                    label="Bank name"
                    htmlFor="bankName"
                    optional
                    error={getError(
                      errors,
                      "bankName",
                    )}
                  >
                    <Input
                      id="bankName"
                      {...register("bankName")}
                    />
                  </FormField>

                  <FormField
                    label="Account title"
                    htmlFor="accountTitle"
                    optional
                    error={getError(
                      errors,
                      "accountTitle",
                    )}
                  >
                    <Input
                      id="accountTitle"
                      {...register(
                        "accountTitle",
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Account or IBAN number"
                    htmlFor="accountNumber"
                    optional
                    error={getError(
                      errors,
                      "accountNumber",
                    )}
                  >
                    <Input
                      id="accountNumber"
                      {...register(
                        "accountNumber",
                      )}
                    />
                  </FormField>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-5">
                  <FormField
                    label="System role"
                    htmlFor="systemRole"
                    description="This controls the employee's default portal permissions."
                    error={getError(
                      errors,
                      "systemRole",
                    )}
                  >
                    <Select
                      id="systemRole"
                      {...register(
                        "systemRole",
                      )}
                    >
                      {SYSTEM_ROLE_OPTIONS.map(
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <CheckboxField
                      label="Allow portal access"
                      description="The employee will be able to sign in and use assigned AMS modules."
                      {...register(
                        "canAccessPortal",
                      )}
                    />

                    <CheckboxField
                      label="Send invitation now"
                      description="Send an account setup invitation after the employee is created."
                      {...register(
                        "sendInvite",
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  {[
                    {
                      title: "Personal details",
                      items: [
                        [
                          "Employee",
                          `${values.firstName} ${values.lastName}`,
                        ],
                        [
                          "Email",
                          values.email,
                        ],
                        [
                          "Phone",
                          values.phone,
                        ],
                        [
                          "CNIC",
                          values.cnic ||
                            "Not provided",
                        ],
                      ],
                    },
                    {
                      title: "Employment",
                      items: [
                        [
                          "Employee ID",
                          values.employeeCode,
                        ],
                        [
                          "Joining date",
                          values.joinDate,
                        ],
                        [
                          "Employment type",
                          findOptionLabel(
                            EMPLOYMENT_TYPE_OPTIONS,
                            values.employmentType,
                          ),
                        ],
                      ],
                    },
                    {
                      title: "Work assignment",
                      items: [
                        [
                          "Branch",
                          branches.find(
                            (branch) =>
                              branch.id ===
                              values.branchId,
                          )?.name ??
                            "Not selected",
                        ],
                        [
                          "Department",
                          values.department,
                        ],
                        [
                          "Designation",
                          values.designation,
                        ],
                        [
                          "Shift",
                          findOptionLabel(
                            SHIFT_OPTIONS,
                            values.shiftId,
                          ),
                        ],
                      ],
                    },
                    {
                      title: "Payroll & access",
                      items: [
                        [
                          "Monthly salary",
                          `PKR ${Number(
                            values.monthlySalary ||
                              0,
                          ).toLocaleString()}`,
                        ],
                        [
                          "Payment method",
                          findOptionLabel(
                            PAYMENT_METHOD_OPTIONS,
                            values.paymentMethod,
                          ),
                        ],
                        [
                          "System role",
                          findOptionLabel(
                            SYSTEM_ROLE_OPTIONS,
                            values.systemRole,
                          ),
                        ],
                        [
                          "Invitation",
                          values.sendInvite
                            ? "Send after creation"
                            : "Send later",
                        ],
                      ],
                    },
                  ].map((section) => (
                    <section
                      key={section.title}
                      className="rounded-card border border-border"
                    >
                      <h3 className="border-b border-border px-5 py-4 text-sm font-bold">
                        {section.title}
                      </h3>

                      <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
                        {section.items.map(
                          ([label, value]) => (
                            <div key={label}>
                              <dt className="text-xs font-medium text-text-muted">
                                {label}
                              </dt>

                              <dd className="mt-1 text-sm font-semibold">
                                {value ||
                                  "Not provided"}
                              </dd>
                            </div>
                          ),
                        )}
                      </dl>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <footer className="flex flex-col-reverse justify-between gap-4 border-t border-border p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={saveDraft}
                >
                  <Save />
                  Save draft
                </Button>

                {draftSavedAt && (
                  <span className="text-xs text-text-muted">
                    Saved at {draftSavedAt}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={handleBack}
                  >
                    <ArrowLeft />
                    Back
                  </Button>
                )}

                {currentStep <
                ONBOARDING_STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Continue
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <UserPlus />
                    {isSubmitting
                      ? "Creating..."
                      : "Create employee"}
                  </Button>
                )}
              </div>
            </footer>
          </Card>
        </form>
      </div>
    </div>
  );
}
