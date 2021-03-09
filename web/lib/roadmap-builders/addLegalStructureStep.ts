import { LegalStructure } from "../types/LegalStructure";
import { Roadmap, StepsEntity, StepsFromFile, TasksLookup } from "../types/Roadmap";
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

const getStepByLegalStructure = (legalStructure: LegalStructure, allTasks: TasksLookup): StepsEntity => {
  let step;

  if (PublicRecordFilingGroup.includes(legalStructure)) {
    step = publicRecordFilingStructure as StepsFromFile;
  } else if (TradeNameGroup.includes(legalStructure)) {
    step = tradeNameStructure as StepsFromFile;
  } else {
    step = unsetStructure as StepsFromFile;
  }

  return {
    ...step,
    tasks: step.tasks.map((id) => allTasks[id]).filter((it) => it !== undefined),
  };
};

export const addLegalStructureStep = (
  roadmap: Roadmap,
  legalStructure: LegalStructure,
  allTasks: TasksLookup
): Roadmap => {
  const stepsEntity = getStepByLegalStructure(legalStructure, allTasks);
  roadmap.steps.push(stepsEntity);
  roadmap.steps.sort((a, b) => a.step_number - b.step_number);
  return roadmap;
};
