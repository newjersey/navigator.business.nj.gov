import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { modifyCurrentBusiness } from "@shared/test";
import { UserData } from "@shared/userData";
import { calculateNextAnnualFilingDates } from "./calculateNextAnnualFilingDates";

export const getAnnualFilings = (userData: UserData): UserData => {
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
          dueDate
        })
      )
    );
  }

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taxFilingData: { ...business.taxFilingData, filings }
  }));
};
