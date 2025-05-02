import { Roadmap, Step } from "@/lib/types/types";
import { Business } from "@businessnjgovnavigator/shared/userData";

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
