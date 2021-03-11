import { LegalStructure } from "../types/types";
import { Roadmap, Step, StepFromFile, TaskLookup } from "../types/types";
import publicRecordFilingStructure from "../../roadmaps/steps/form-and-register-public-record-filing.json";
import tradeNameStructure from "../../roadmaps/steps/form-and-register-trade-name.json";
import unsetStructure from "../../roadmaps/steps/form-and-register-unset.json";

const TradeNameGroup: LegalStructure[] = ["General Partnership", "Sole Proprietorship"];

const PublicRecordFilingGroup: LegalStructure[] = [
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "Limited Liability Company (LLC)",
  "C-Corporation",
  "S-Corporation",
  "B-Corporation",
];

const getStepByLegalStructure = (legalStructure: LegalStructure, allTasks: TaskLookup): Step => {
  let step;

  if (PublicRecordFilingGroup.includes(legalStructure)) {
    step = publicRecordFilingStructure as StepFromFile;
  } else if (TradeNameGroup.includes(legalStructure)) {
    step = tradeNameStructure as StepFromFile;
  } else {
    step = unsetStructure as StepFromFile;
  }

  return {
    ...step,
    tasks: step.tasks.map((id) => allTasks[id]).filter((it) => it !== undefined),
  };
};

export const addLegalStructureStep = (
  roadmap: Roadmap,
  legalStructure: LegalStructure,
  allTasks: TaskLookup
): Roadmap => {
  const stepsEntity = getStepByLegalStructure(legalStructure, allTasks);
  roadmap.steps.push(stepsEntity);
  roadmap.steps.sort((a, b) => a.step_number - b.step_number);
  return roadmap;
};
