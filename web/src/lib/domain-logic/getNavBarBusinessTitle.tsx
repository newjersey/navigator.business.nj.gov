import { getMergedConfig } from "@/contexts/configContext";
import { Business, LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (business: Business | undefined): string => {
  const Config = getMergedConfig();
  if (!business) return Config.navigationDefaults.navBarGuestText;

  const { businessName, tradeName, legalStructureId, industryId } = business.profileData;

  if (!industryId) return Config.navigationDefaults.navBarGuestText;

  if (!legalStructureId)
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    }`;

  const name = LookupLegalStructureById(legalStructureId).requiresPublicFiling ? businessName : tradeName;
  if (name) return name;

  return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
    LookupIndustryById(business?.profileData?.industryId).name
  } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`;
};
