import { Roadmap } from "@/lib/types/types";
import { useContext } from "react";
import { RoadmapContext } from "@/pages/_app";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";

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
      setRoadmap(await buildUserRoadmap(userData.onboardingData));
    }
  };

  return { roadmap };
};
