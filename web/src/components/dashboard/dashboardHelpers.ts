import { getMergedConfig } from "@/contexts/configContext";
import { ProfileTabs } from "@/lib/types/types";
import { Business } from "@businessnjgovnavigator/shared";
import {
  isDomesticEmployerBusiness,
  isRemoteWorkerOrSellerBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";

const Config = getMergedConfig();

export const getRoadmapHeadingText = (industryId?: string): string => {
  return industryId === "domestic-employer"
    ? Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText
    : Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText;
};

export const getPersonalizeTaskButtonTabValue = (business: Business | undefined): ProfileTabs => {
  if (!business) return "info";

  if (isDomesticEmployerBusiness(business) || isRemoteWorkerOrSellerBusiness(business))
    return "info";

  return "permits";
};
