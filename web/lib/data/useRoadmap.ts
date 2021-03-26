import { Roadmap } from "../types/types";
import { useContext, useEffect } from "react";
import { RoadmapContext } from "../../pages/_app";
import { buildRoadmap } from "../roadmap/buildRoadmap";
import { useUserData } from "./useUserData";

export const useRoadmap = (): { roadmap: Roadmap | undefined } => {
  const { roadmap, setRoadmap } = useContext(RoadmapContext);
  const { userData } = useUserData();

  const refreshRoadmap = async () => {
    if (userData?.formData) {
      setRoadmap(await buildRoadmap(userData.formData));
    }
  };

  useEffect(() => {
    refreshRoadmap();
  }, [userData?.formData]);

  return { roadmap };
};
