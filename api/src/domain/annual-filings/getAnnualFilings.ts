import { LookupLegalStructureById } from "@shared/legalStructure";
import { Business, UserData } from "@shared/userData";
import { calculateNextAnnualFilingDates } from "./calculateNextAnnualFilingDates";

export const getAnnualFilings = (userData: UserData): UserData => {
  const currentBusiness = userData.businesses[userData.currentBusinessID]
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
      ...calculateNextAnnualFilingDates(currentBusiness.profileData.dateOfFormation).map((dueDate: string) => ({
        identifier: "ANNUAL_FILING",
        calendarEventType: "TAX-FILING" as const,
        dueDate,
      }))
    );
  }
  const updatedBusiness: Business = {...currentBusiness, taxFilingData: {...currentBusiness.taxFilingData, filings}}
  const updatedBusinesses: Record<string, Business> =  {...userData.businesses, [userData.currentBusinessID]: updatedBusiness }

  return {
    ...userData,
    businesses: updatedBusinesses
  };
};
