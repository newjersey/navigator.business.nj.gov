import { LookupLegalStructureById } from "@shared/legalStructure";
import { UserData } from "@shared/userData";
import { calculateNextAnnualFilingDate } from "./calculateNextAnnualFilingDate";

export const getAnnualFilings = (userData: UserData) => {
  const filings = userData.taxFilingData.filings.filter((it) => it.identifier !== "ANNUAL_FILING");

  const legalStructure = LookupLegalStructureById(userData.profileData.legalStructureId);

  if (userData.profileData.dateOfFormation && legalStructure.requiresPublicFiling) {
    filings.push({
      identifier: "ANNUAL_FILING",
      dueDate: calculateNextAnnualFilingDate(userData.profileData.dateOfFormation),
    });
  }

  return {
    ...userData,
    taxFilingData: {
      ...userData.taxFilingData,
      filings,
    },
  };
};
