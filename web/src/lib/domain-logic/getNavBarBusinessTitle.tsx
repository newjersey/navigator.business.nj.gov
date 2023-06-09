import { getMergedConfig } from "@/contexts/configContext";
import { LookupIndustryById, LookupLegalStructureById, UserData } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (userData: UserData | undefined): string => {
  const Config = getMergedConfig();
  if (!userData?.profileData.industryId || !userData.profileData.legalStructureId) {
    return Config.navigationDefaults.navBarGuestText;
  }
  if (userData?.profileData.businessName) {
    return userData.profileData.businessName;
  } else {
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} [${
      LookupIndustryById(userData?.profileData?.industryId).name
    }][${LookupLegalStructureById(userData?.profileData?.legalStructureId).abbreviation}]`;
  }
};
