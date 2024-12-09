import { getMergedConfig } from "@/contexts/configContext";
import { Business, LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { determineIfNexusDbaNameNeeded } from "@businessnjgovnavigator/shared/";
import {
  isOwningBusiness,
  isRemoteWorkerOrSellerBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";

export const getNavBarBusinessTitle = (business: Business | undefined, isAuthenticated: boolean): string => {
  const Config = getMergedConfig();
  if (!business || !isAuthenticated) {
    return Config.navigationDefaults.navBarGuestBusinessText;
  }

  const { businessName, tradeName, legalStructureId, industryId, nexusDbaName } = business.profileData;

  const determineName = (): string => {
    if (determineIfNexusDbaNameNeeded(business)) {
      if (nexusDbaName === "") {
        return Config.navigationDefaults.navBarUnnamedDbaBusinessText;
      }
      if (nexusDbaName !== "") {
        return nexusDbaName;
      }
    }

    if (legalStructureId) {
      return LookupLegalStructureById(legalStructureId).hasTradeName ? tradeName : businessName;
    }

    return businessName || tradeName || "";
  };

  const name = determineName();
  if (name) return name;

  if (isOwningBusiness(business)) {
    if (legalStructureId) {
      return `${Config.navigationDefaults.navBarUnnamedOwnedBusinessText} ${
        LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation
      }`;
    } else {
      return Config.navigationDefaults.navBarUnnamedOwnedBusinessText;
    }
  }

  if (isRemoteWorkerOrSellerBusiness(business)) {
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
