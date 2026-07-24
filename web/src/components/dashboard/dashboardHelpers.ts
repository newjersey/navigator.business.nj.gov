import { Business } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  isDomesticEmployerBusiness,
  isNexusBusiness,
  isRemoteWorkerOrSellerBusiness,
  isStartingBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { hasCompletedBusinessStructure } from "@businessnjgovnavigator/shared/domain-logic/hasCompletedBusinessStructure";
import { ProfileTabs } from "@businessnjgovnavigator/shared/types";

export const getRoadmapHeadingText = (industryId?: string): string => {
  const Config = getMergedConfig();
  return industryId === "domestic-employer"
    ? Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText
    : Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText;
};

export const getPersonalizeTaskButtonTabValue = (business: Business | undefined): ProfileTabs => {
  if (!business) {
    return "info";
  }

  if (isDomesticEmployerBusiness(business) || isRemoteWorkerOrSellerBusiness(business)) {
    return "info";
  }

  if (
    (isStartingBusiness(business) || isNexusBusiness(business)) &&
    hasCompletedBusinessStructure(business)
  ) {
    return "personalize";
  }

  if (
    business.profileData.operatingPhase === "UP_AND_RUNNING" ||
    business.profileData.operatingPhase === "UP_AND_RUNNING_OWNING"
  ) {
    return "personalize";
  }

  return "permits";
};
