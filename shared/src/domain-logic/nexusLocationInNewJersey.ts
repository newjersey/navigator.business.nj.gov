import { ProfileData } from "../profileData";
import { determineForeignBusinessType } from "./businessPersonaHelpers";

export const nexusLocationInNewJersey = (profileData: ProfileData): boolean | undefined => {
  const isForeignBusiness = profileData.businessPersona === "FOREIGN";
  const isNexusBusiness = determineForeignBusinessType(profileData.foreignBusinessTypeIds) === "NEXUS";
  const hasOfficeInNJ = profileData.foreignBusinessTypeIds.includes("officeInNJ");

  if (!isForeignBusiness) {
    return undefined;
  }
  return isForeignBusiness && isNexusBusiness && hasOfficeInNJ;
};
