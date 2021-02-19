import publicRecordFilingStructure from "../../roadmaps/structure-public-record-filing.json";
import tradeNameStructure from "../../roadmaps/structure-trade-name.json";
import { LegalStructure } from "../types/LegalStructure";
import { Roadmap, StepsEntity } from "../types/Roadmap";

const TradeNameGroup: LegalStructure[] = ["General Partnership", "Sole Proprietorship"];

const PublicRecordFilingGroup: LegalStructure[] = [
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "Limited Liability Company (LLC)",
  "C-Corporation",
  "S-Corporation",
  "B-Corporation",
];

export const addLegalStructureStep = (roadmap: Roadmap, legalStructure: LegalStructure): Roadmap => {
  if (PublicRecordFilingGroup.includes(legalStructure)) {
    roadmap.steps.push(publicRecordFilingStructure as StepsEntity);
  } else if (TradeNameGroup.includes(legalStructure)) {
    roadmap.steps.push(tradeNameStructure as StepsEntity);
  }
  roadmap.steps.sort((a, b) => a.step_number - b.step_number);
  return roadmap;
};
