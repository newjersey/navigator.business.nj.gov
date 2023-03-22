import { ProfileContentField } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";

export const OPPORTUNITY_FIELDS: ProfileContentField[] = [
  "dateOfFormation",
  "existingEmployees",
  "municipality",
  "homeBasedBusiness",
  "ownershipTypeIds",
];

export const isFieldAnswered = (field: ProfileContentField, data: ProfileData): boolean => {
  switch (field) {
    case "dateOfFormation":
      return !!data.dateOfFormation;
    case "existingEmployees":
      return !!data.existingEmployees;
    case "municipality":
      return data.municipality !== undefined;
    case "homeBasedBusiness":
      return data.homeBasedBusiness !== undefined;
    case "ownershipTypeIds":
      return data.ownershipTypeIds.length > 0;
    default:
      return true;
  }
};
