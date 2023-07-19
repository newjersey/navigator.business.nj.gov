import { getMergedConfig } from "@/contexts/configContext";
import { Business, LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (business: Business | undefined): string => {
  const Config = getMergedConfig();
  if (!business) return Config.navigationDefaults.navBarGuestText;

  const { businessName, tradeName, legalStructureId, industryId } = business.profileData;
  const determineName = (): string => {
    if (legalStructureId) {
      return LookupLegalStructureById(legalStructureId).hasTradeName ? tradeName : businessName;
    } else {
      return businessName || tradeName || "";
    }
  };

  const name = determineName();
  if (name) return name;

  if (!industryId) return Config.navigationDefaults.navBarGuestText;

  if (!legalStructureId)
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    }`;

  return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
    LookupIndustryById(business?.profileData?.industryId).name
  } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`;
};
