import { Roadmap } from "@businessnjgovnavigator/shared/types";
import { createContext } from "react";

export interface RoadmapContextType {
  roadmap: Roadmap | undefined;
  setRoadmap: (roadmap: Roadmap | undefined) => void;
}

export const RoadmapContext = createContext<RoadmapContextType>({
  roadmap: undefined,
  setRoadmap: () => {},
});
