import { getMergedConfig } from "@/contexts/configContext";
import {
  OperatingPhase,
  OperatingPhaseId,
  UnknownOperatingPhase,
} from "@businessnjgovnavigator/shared/operatingPhase";

const Config = getMergedConfig();

export const getRoadmapHeadingText = (operatingPhase: OperatingPhase | UnknownOperatingPhase): string => {
  return operatingPhase.id === OperatingPhaseId.DOMESTIC_EMPLOYER
    ? Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText
    : Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText;
};
