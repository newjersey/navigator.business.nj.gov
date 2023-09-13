import { LookupLegalStructureById } from "../legalStructure";
import { ProfileData } from "../profileData";

const OPPORTUNITY_FIELDS: (keyof ProfileData)[] = [
  "existingEmployees",
  "municipality",
  "homeBasedBusiness",
  "ownershipTypeIds",
];

const REPORT_FIELDS: (keyof ProfileData)[] = ["dateOfFormation"];

const FIELDS_FOR_FOREIGN_NEXUS_NJ_LOCATION: (keyof ProfileData)[] = ["municipality"];
const FIELDS_FOR_FOREIGN_NEXUS_NOT_NJ_LOCATION: (keyof ProfileData)[] = ["homeBasedBusiness"];
const ALL_FIELDS_FOR_FOREIGN_NEXUS_NJ_LOCATION = [...FIELDS_FOR_FOREIGN_NEXUS_NJ_LOCATION, ...REPORT_FIELDS];
const ALL_FIELDS_FOR_FOREIGN_NEXUS_NOT_NJ_LOCATION = [
  ...FIELDS_FOR_FOREIGN_NEXUS_NOT_NJ_LOCATION,
  ...REPORT_FIELDS,
];
const FIELDS_FOR_PROFILE = [...REPORT_FIELDS, ...OPPORTUNITY_FIELDS];

export const getFieldsForProfile = (profileData: ProfileData): (keyof ProfileData)[] => {
  if (profileData.businessPersona === "FOREIGN" && profileData.foreignBusinessType === "NEXUS") {
    return profileData.nexusLocationInNewJersey
      ? filterByLegalStructure(ALL_FIELDS_FOR_FOREIGN_NEXUS_NJ_LOCATION, profileData.legalStructureId)
      : filterByLegalStructure(ALL_FIELDS_FOR_FOREIGN_NEXUS_NOT_NJ_LOCATION, profileData.legalStructureId);
  } else {
    return filterByLegalStructure(FIELDS_FOR_PROFILE, profileData.legalStructureId);
  }
};

const filterByLegalStructure = (
  profileKeys: (keyof ProfileData)[],
  legalStructureId?: string
): (keyof ProfileData)[] => {
  return profileKeys.filter((field) => {
    if (field === "dateOfFormation" && legalStructureId) {
      return LookupLegalStructureById(legalStructureId).elementsToDisplay.has("formationDate");
    }
    return true;
  });
};

export const isFieldAnswered = (field: keyof ProfileData, data: ProfileData): boolean => {
  switch (field) {
    case "dateOfFormation": {
      return !!data.dateOfFormation;
    }
    case "existingEmployees": {
      return !!data.existingEmployees;
    }
    case "municipality": {
      return data.municipality !== undefined;
    }
    case "homeBasedBusiness": {
      return data.homeBasedBusiness !== undefined;
    }
    case "ownershipTypeIds": {
      return data.ownershipTypeIds.length > 0;
    }
    default: {
      return true;
    }
  }
};
