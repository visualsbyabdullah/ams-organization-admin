"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_REVIEW_STATUS_CONFIG,
} from "@/config/performance";
import type {
  PerformanceReview,
  PerformanceReviewStatus,
} from "@/types/performance";

type Props = {
  review: PerformanceReview;
  onCancel: () => void;
  onSave: (review: PerformanceReview) => void;
};

export function PerformanceReviewForm({ review, onCancel, onSave }: Props) {
  const [status, setStatus] = useState<PerformanceReviewStatus>(review.status);
  const [selfRating, setSelfRating] = useState(String(review.selfRating ?? ""));
  const [managerRating, setManagerRating] = useState(String(review.managerRating ?? ""));
  const [finalRating, setFinalRating] = useState(String(review.finalRating ?? ""));
  const [goalScore, setGoalScore] = useState(String(review.goalScore));
  const [competencyScore, setCompetencyScore] = useState(String(review.competencyScore));
  const [strengths, setStrengths] = useState(review.strengths);
  const [developmentAreas, setDevelopmentAreas] = useState(review.developmentAreas);
  const [managerComments, setManagerComments] = useState(review.managerComments);

  function rating(value: string) {
    const result = Number(value);
    return result >= 1 && result <= 5 ? result : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const goal = Math.min(Math.max(Number(goalScore) || 0, 0), 100);
    const competency = Math.min(Math.max(Number(competencyScore) || 0, 0), 100);
    const overall = Math.round(goal * 0.6 + competency * 0.4);
    const completedAt = status === "completed"
      ? review.completedAt ?? new Date().toISOString().slice(0, 10)
      : undefined;

    onSave({
      ...review,
      status,
      selfRating: rating(selfRating),
      managerRating: rating(managerRating),
      finalRating: rating(finalRating),
      goalScore: goal,
      competencyScore: competency,
      overallScore: overall,
      completedAt,
      strengths: strengths.trim(),
      developmentAreas: developmentAreas.trim(),
      managerComments: managerComments.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Review status" htmlFor="performanceReviewStatus">
          <Select id="performanceReviewStatus" value={status} onChange={(event) => setStatus(event.target.value as PerformanceReviewStatus)}>
            {Object.entries(PERFORMANCE_REVIEW_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Self rating" htmlFor="performanceSelfRating" optional>
          <Input id="performanceSelfRating" type="number" min="1" max="5" value={selfRating} onChange={(event) => setSelfRating(event.target.value)} />
        </FormField>
        <FormField label="Manager rating" htmlFor="performanceManagerRating" optional>
          <Input id="performanceManagerRating" type="number" min="1" max="5" value={managerRating} onChange={(event) => setManagerRating(event.target.value)} />
        </FormField>
        <FormField label="Final rating" htmlFor="performanceFinalRating" optional>
          <Input id="performanceFinalRating" type="number" min="1" max="5" value={finalRating} onChange={(event) => setFinalRating(event.target.value)} />
        </FormField>
        <FormField label="Goal score" htmlFor="performanceGoalScore">
          <Input id="performanceGoalScore" type="number" min="0" max="100" value={goalScore} onChange={(event) => setGoalScore(event.target.value)} />
        </FormField>
        <FormField label="Competency score" htmlFor="performanceCompetencyScore">
          <Input id="performanceCompetencyScore" type="number" min="0" max="100" value={competencyScore} onChange={(event) => setCompetencyScore(event.target.value)} />
        </FormField>
      </div>
      <FormField label="Strengths" htmlFor="performanceStrengths" optional>
        <Textarea id="performanceStrengths" value={strengths} onChange={(event) => setStrengths(event.target.value)} />
      </FormField>
      <FormField label="Development areas" htmlFor="performanceDevelopmentAreas" optional>
        <Textarea id="performanceDevelopmentAreas" value={developmentAreas} onChange={(event) => setDevelopmentAreas(event.target.value)} />
      </FormField>
      <FormField label="Manager comments" htmlFor="performanceManagerComments" optional>
        <Textarea id="performanceManagerComments" value={managerComments} onChange={(event) => setManagerComments(event.target.value)} />
      </FormField>
      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>{PERFORMANCE_COPY.actions.cancel}</Button>
        <Button type="submit">{PERFORMANCE_COPY.actions.save}</Button>
      </div>
    </form>
  );
}
