import { getMergedConfig } from "@/contexts/configContext";
import { Business, LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (business: Business | undefined): string => {
  const Config = getMergedConfig();
  if (!business) return Config.navigationDefaults.navBarGuestText;

  const { businessName, tradeName, legalStructureId, industryId, businessPersona } = business.profileData;
  const determineName = (): string => {
    if (legalStructureId) {
      return LookupLegalStructureById(legalStructureId).hasTradeName ? tradeName : businessName;
    } else {
      return businessName || tradeName || "";
    }
  };

  const name = determineName();
  if (name) return name;

  if (businessPersona === "OWNING") {
    if (legalStructureId) {
      return `${Config.navigationDefaults.navBarUnnamedOwnedBusinessText} ${
        LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation
      }`;
    } else if (!legalStructureId && business.onboardingFormProgress === "COMPLETED") {
      return Config.navigationDefaults.navBarUnnamedOwnedBusinessText;
    } else {
      return Config.navigationDefaults.navBarGuestText;
    }
  }

  if (legalStructureId && industryId) {
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`;
  }

  if (!legalStructureId && industryId) {
    if (business.onboardingFormProgress === "COMPLETED") {
      return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
        LookupIndustryById(business?.profileData?.industryId).name
      }`;
    } else {
      return Config.navigationDefaults.navBarGuestText;
    }
  }

  return Config.navigationDefaults.navBarGuestText;
};
