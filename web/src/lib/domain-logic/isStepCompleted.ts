import { Roadmap, Step } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared/userData";

export const isStepCompleted = (
  roadmap: Roadmap | undefined,
  step: Step,
  userData: UserData | undefined
): boolean => {
  if (!roadmap) {
    return false;
  }

  return roadmap.tasks
    .filter((it) => {
      return it.stepNumber === step.stepNumber;
    })
    .every((it) => {
      return userData?.taskProgress[it.id] === "COMPLETED";
    });
};
