import llcStructure from "../../roadmaps/llc.json";
import { Roadmap } from "../types/roadmaps";

export const addLegalStructureStep = (roadmap: Roadmap): Roadmap => {
  roadmap.steps.push(llcStructure);
  roadmap.steps.sort((a, b) => a.step_number - b.step_number);
  return roadmap;
};
