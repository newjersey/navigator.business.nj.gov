import { LegalStructure, RoadmapFromFile, StepFromFile } from "../types/types";
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

const getStepByLegalStructure = (legalStructure: LegalStructure | undefined): StepFromFile => {
  if (!legalStructure) {
    return unsetStructure as StepFromFile;
  } else if (PublicRecordFilingGroup.includes(legalStructure)) {
    return publicRecordFilingStructure as StepFromFile;
  } else if (TradeNameGroup.includes(legalStructure)) {
    return tradeNameStructure as StepFromFile;
  } else {
    return unsetStructure as StepFromFile;
  }
};

export const addLegalStructureStep = (
  roadmap: RoadmapFromFile,
  legalStructure: LegalStructure | undefined
): RoadmapFromFile => {
  const stepFromFile = getStepByLegalStructure(legalStructure);
  roadmap.steps.push(stepFromFile);
  roadmap.steps.sort((a, b) => a.step_number - b.step_number);
  return roadmap;
};
