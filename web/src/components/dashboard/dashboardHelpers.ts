import { getMergedConfig } from "@/contexts/configContext";

const Config = getMergedConfig();

export const getRoadmapHeadingText = (industryId?: string): string => {
  return industryId === "domestic-employer"
    ? Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText
    : Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText;
};
