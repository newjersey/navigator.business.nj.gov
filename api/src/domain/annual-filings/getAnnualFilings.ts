import { calculateNextAnnualFilingDates } from "@domain/annual-filings/calculateNextAnnualFilingDates";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { UserData } from "@shared/userData";

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
          dueDate,
        })
      )
    );
  }

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taxFilingData: { ...business.taxFilingData, filings },
  }));
};
