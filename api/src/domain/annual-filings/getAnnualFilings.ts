import { LookupLegalStructureById } from "@shared/legalStructure";
import { UserData } from "@shared/userData";
import { calculateNextAnnualFilingDates } from "./calculateNextAnnualFilingDates";

export const getAnnualFilings = (userData: UserData): UserData => {
  const filings = userData.taxFilingData.filings.filter((it) => {
    return it.identifier !== "ANNUAL_FILING";
  });

  let requiresPublicFiling = true;

  if (userData.profileData.legalStructureId) {
    requiresPublicFiling = LookupLegalStructureById(
      userData.profileData.legalStructureId
    ).requiresPublicFiling;
  }

  if (userData.profileData.dateOfFormation && requiresPublicFiling) {
    filings.push(
      ...calculateNextAnnualFilingDates(userData.profileData.dateOfFormation).map((dueDate: string) => ({
        identifier: "ANNUAL_FILING",
        dueDate,
      }))
    );
  }

  return {
    ...userData,
    taxFilingData: {
      ...userData.taxFilingData,
      filings,
    },
  };
};
