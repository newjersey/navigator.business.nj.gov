import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import {
  Business,
  isNexusBusiness,
  LookupOperatingPhaseById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { nexusLocationInNewJersey } from "@businessnjgovnavigator/shared/domain-logic/nexusLocationInNewJersey";

export const displayHomedBaseBusinessQuestion = (
  profileData: ProfileData,
  business?: Business,
): boolean => {
  if (!business) return false;
  if (!profileData.industryId) {
    return true;
  }
  if (nexusLocationInNewJersey(profileData)) {
    return false;
  }
  return isHomeBasedBusinessApplicable(profileData.industryId);
};

export const displayAltHomeBasedBusinessDescription = (profileData: ProfileData): boolean =>
  LookupOperatingPhaseById(profileData.operatingPhase).displayAltHomeBasedBusinessDescription;

export const displayPlannedRenovationQuestion = (
  profileData: ProfileData,
  business?: Business,
): boolean => {
  return (
    profileData.homeBasedBusiness === false &&
    (isNexusBusiness(business) || profileData.businessPersona === "STARTING")
  );
};

export const displayElevatorQuestion = (profileData: ProfileData, business?: Business): boolean => {
  if (!business) return false;
  return profileData.homeBasedBusiness === false && profileData.businessPersona === "STARTING";
};

export const shouldLockMunicipality = (profileData: ProfileData, business?: Business): boolean => {
  return !!profileData.municipality && business?.taxFilingData.state === "SUCCESS";
};
