import { UserData } from "../userData";

export const hasCompletedFormation = (userData: UserData): boolean => {
  return userData.businesses[userData.currentBusinessId].formationData.completedFilingPayment;
};
