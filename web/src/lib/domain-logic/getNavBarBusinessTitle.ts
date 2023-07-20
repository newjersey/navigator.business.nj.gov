import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Business, LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (
  business: Business | undefined,
  isAuthenticated: IsAuthenticated
): string => {
  const Config = getMergedConfig();
  if (!business || isAuthenticated === IsAuthenticated.FALSE) {
    return Config.navigationDefaults.navBarGuestText;
  }

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
    } else {
      return Config.navigationDefaults.navBarUnnamedOwnedBusinessText;
    }
  }

  if (legalStructureId && industryId) {
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`;
  }

  if (!legalStructureId && industryId) {
    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    }`;
  }

  return Config.navigationDefaults.navBarUnnamedOwnedBusinessText;
};
