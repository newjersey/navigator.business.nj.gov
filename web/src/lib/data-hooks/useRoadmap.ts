import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { Roadmap, SectionCompletion } from "@/lib/types/types";
import { getSectionCompletion, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { RoadmapContext } from "@/pages/_app";
import { useContext } from "react";

export const useRoadmap = (): {
  roadmap: Roadmap | undefined;
  sectionCompletion: SectionCompletion | undefined;
  updateStatus: (sectionCompletion?: SectionCompletion) => Promise<SectionCompletion>;
} => {
  const { roadmap, sectionCompletion, setRoadmap, setSectionCompletion } = useContext(RoadmapContext);
  const { userData } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!roadmap) {
      buildAndSetRoadmap();
    }
  }, userData);

  const buildAndSetRoadmap = async () => {
    if (userData?.formProgress === "COMPLETED") {
      const roadmap = await buildUserRoadmap(userData.profileData);
      setRoadmap(roadmap);
      setSectionCompletion(getSectionCompletion(roadmap, userData));
    }
  };

  const updateStatus = async (sectionCompletion?: SectionCompletion) => {
    const _roadmapStatus = sectionCompletion ?? getSectionCompletion(roadmap, userData);
    setSectionCompletion(_roadmapStatus);
    return _roadmapStatus;
  };

  return { roadmap, sectionCompletion, updateStatus };
};
