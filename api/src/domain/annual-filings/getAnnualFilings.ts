import { Business } from "@shared/business";
import { getCurrentBusiness, modifyCurrentBusiness } from "@shared/businessHelpers";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { UserDataPrime } from "@shared/userData";
import { calculateNextAnnualFilingDates } from "./calculateNextAnnualFilingDates";

export const getAnnualFilings = (userData: UserDataPrime): UserDataPrime => {
  const currentBusiness = getCurrentBusiness(userData);
  const filings = currentBusiness.taxFilingData.filings.filter((it) => {
    return it.identifier !== "ANNUAL_FILING";
  });

  let requiresPublicFiling = true;

  if (currentBusiness.profileData.legalStructureId) {
    requiresPublicFiling = LookupLegalStructureById(
      currentBusiness.profileData.legalStructureId
    ).requiresPublicFiling;
  }

  if (currentBusiness.profileData.dateOfFormation && requiresPublicFiling) {
    filings.push(
      ...calculateNextAnnualFilingDates(currentBusiness.profileData.dateOfFormation).map(
        (dueDate: string) => ({
          identifier: "ANNUAL_FILING",
          calendarEventType: "TAX-FILING" as const,
          dueDate,
        })
      )
    );
  }

  const updatedBusiness: Business = {
    ...currentBusiness,
    taxFilingData: { ...currentBusiness.taxFilingData, filings },
  };
  return modifyCurrentBusiness(userData, updatedBusiness);
};
