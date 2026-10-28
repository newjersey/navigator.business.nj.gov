import type { Roadmap, Step } from "@businessnjgovnavigator/shared/types";
import type { Business } from "@businessnjgovnavigator/shared/userData";

export const isStepCompleted = (
  roadmap: Roadmap | undefined,
  step: Step,
  business: Business | undefined,
): boolean => {
  if (!roadmap) {
    return false;
  }

  return roadmap.tasks
    .filter((it) => it.stepNumber === step.stepNumber)
    .every((it) => business?.taskProgress[it.id] === "COMPLETED");
};
