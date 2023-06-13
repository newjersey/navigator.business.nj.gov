import { Roadmap } from "@/lib/types/types";
import { SectionType } from "@businessnjgovnavigator/shared/userData";
import { cloneDeep } from "lodash";

export const roadmapWithSectionSpecificTasks = (roadmap: Roadmap, section: SectionType): Roadmap => {
  const result: Roadmap = { steps: [], tasks: [] };
  const stepNumber = [];

  for (const step of roadmap.steps) {
    if (step.section === section) {
      stepNumber.push(step.stepNumber);
    }
    result.steps.push(cloneDeep(step));
  }

  for (const task of roadmap.tasks) {
    if (typeof task.stepNumber === "number" && stepNumber.includes(task.stepNumber)) {
      result.tasks.push(task);
    }
  }
  return result;
};
