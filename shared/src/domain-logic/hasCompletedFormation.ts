import { UserData } from "../userData";

export const hasCompletedFormation = (userData: UserData): boolean => {
  return userData.businesses[userData.currentBusinessID].formationData.completedFilingPayment;
};
