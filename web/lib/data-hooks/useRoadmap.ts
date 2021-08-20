import { Roadmap } from "@/lib/types/types";
import { useContext, useEffect } from "react";
import { RoadmapContext } from "@/pages/_app";
import { buildRoadmap } from "@/lib/roadmap/buildRoadmap";
import { useUserData } from "./useUserData";

export const useRoadmap = (): { roadmap: Roadmap | undefined } => {
  const { roadmap, setRoadmap } = useContext(RoadmapContext);
  const { userData } = useUserData();

  //Refactor out of hooks
  const refreshRoadmap = async () => {
    if (userData?.formProgress === "COMPLETED") {
      setRoadmap(await buildRoadmap(userData.onboardingData));
    }
  };
  //Refactor out of hooks
  useEffect(() => {
    refreshRoadmap();
  }, [userData, userData?.onboardingData]);

  return { roadmap };
};
