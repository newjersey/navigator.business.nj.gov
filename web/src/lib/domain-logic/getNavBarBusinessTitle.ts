import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Business, LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const getNavBarBusinessTitle = (
  business: Business | undefined,
  isAuthenticated: IsAuthenticated,
): string => {
  const Config = getMergedConfig();
  if (!business || isAuthenticated === IsAuthenticated.FALSE) {
    return Config.navigationDefaults.navBarGuestText;
  }

  const { businessName, tradeName, legalStructureId, industryId, businessPersona, foreignBusinessType } =
    business.profileData;

  const isRemoteWorkerOrSeller = (): boolean => {
    return foreignBusinessType === "REMOTE_SELLER" || foreignBusinessType === "REMOTE_WORKER";
  };

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

  if (businessPersona === "FOREIGN" && isRemoteWorkerOrSeller()) {
    return Config.navigationDefaults.navBarUnnamedForeignRemoteSellerWorkerText;
  }

  if (legalStructureId && industryId) {
    if (industryId === "generic") {
      return `${Config.navigationDefaults.navBarUnnamedOwnedBusinessText} ${
        LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation
      }`;
    }

    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`;
  }

  if (!legalStructureId && industryId) {
    if (industryId === "generic") {
      return Config.navigationDefaults.navBarUnnamedOwnedBusinessText;
    }

    return `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
      LookupIndustryById(business?.profileData?.industryId).name
    }`;
  }

  return Config.navigationDefaults.navBarUnnamedOwnedBusinessText;
};
