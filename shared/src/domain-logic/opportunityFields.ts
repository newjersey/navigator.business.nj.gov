import { ProfileData } from "../profileData";

export const OPPORTUNITY_FIELDS: (keyof ProfileData)[] = [
  "existingEmployees",
  "municipality",
  "homeBasedBusiness",
  "ownershipTypeIds",
];

export const REPORT_FIELDS: (keyof ProfileData)[] = ["dateOfFormation"];

export const FIELDS_FOR_PROFILE = [...OPPORTUNITY_FIELDS, ...REPORT_FIELDS];

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
