import { Check } from "lucide-react";

import { ONBOARDING_STEPS } from "@/config/onboarding";
import { cn } from "@/lib/utils";

type OnboardingStepperProps = {
  currentStep: number;
};

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <ol className="space-y-2">
      {ONBOARDING_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <li key={step.id}>
            <div
              className={cn(
                "flex items-start gap-3 rounded-control p-3 transition",
                isCurrent && "bg-surface-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border",
                  isComplete && "border-success bg-success text-white",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  !isComplete && !isCurrent && "border-border bg-surface text-text-muted",
                )}
              >
                {isComplete ? <Check size={17} /> : <Icon size={17} />}
              </span>

              <span className="hidden min-w-0 lg:block">
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    isCurrent ? "text-text" : "text-text-muted",
                  )}
                >
                  {step.label}
                </span>

                <span className="mt-1 block text-xs leading-5 text-text-muted">
                  {step.description}
                </span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
