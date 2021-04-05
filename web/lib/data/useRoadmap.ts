import { Roadmap } from "../types/types";
import { useContext, useEffect } from "react";
import { RoadmapContext } from "../../pages/_app";
import { buildRoadmap } from "../roadmap/buildRoadmap";
import { useUserData } from "./useUserData";

export const useRoadmap = (): { roadmap: Roadmap | undefined } => {
  const { roadmap, setRoadmap } = useContext(RoadmapContext);
  const { userData } = useUserData();

  const refreshRoadmap = async () => {
    if (userData?.onboardingData) {
      setRoadmap(await buildRoadmap(userData.onboardingData));
    }
  };

  useEffect(() => {
    refreshRoadmap();
  }, [userData?.onboardingData]);

  return { roadmap };
};
