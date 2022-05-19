import { Roadmap, SectionCompletion } from "@/lib/types/types";
import { createContext } from "react";

export interface RoadmapContextType {
  roadmap: Roadmap | undefined;
  sectionCompletion: SectionCompletion | undefined;
  setRoadmap: (roadmap: Roadmap | undefined) => void;
  setSectionCompletion: (sectionCompletion: SectionCompletion | undefined) => void;
}

export const RoadmapContext = createContext<RoadmapContextType>({
  roadmap: undefined,
  sectionCompletion: undefined,
  setRoadmap: () => {},
  setSectionCompletion: () => {},
});
