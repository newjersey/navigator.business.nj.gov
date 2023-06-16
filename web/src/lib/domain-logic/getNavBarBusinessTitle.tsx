import { getMergedConfig } from "@/contexts/configContext";
import { LookupIndustryById, LookupLegalStructureById, Business } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (business: Business | undefined): string => {
  const Config = getMergedConfig();
  if (!business?.profileData.industryId || !business.profileData.legalStructureId) {
    return Config.navigationDefaults.navBarGuestText;
  }
  if (business?.profileData.businessName) {
    return business.profileData.businessName;
  } else {
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`;
  }
};
