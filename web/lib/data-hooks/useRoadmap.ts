import { Roadmap } from "@/lib/types/types";
import { useContext } from "react";
import { RoadmapContext } from "@/pages/_app";
import { buildRoadmap } from "@/lib/roadmap/buildRoadmap";
import { useUserData } from "./useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";

export const useRoadmap = (): { roadmap: Roadmap | undefined } => {
  const { roadmap, setRoadmap } = useContext(RoadmapContext);
  const { userData } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!roadmap) {
      buildAndSetRoadmap();
    }
  }, userData);

  const buildAndSetRoadmap = async () => {
    if (userData?.formProgress === "COMPLETED") {
      setRoadmap(await buildRoadmap(userData.onboardingData));
    }
  };

  return { roadmap };
};
