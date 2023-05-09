import { UserData } from "../userData";

export const hasCompletedFormation = (userData: UserData): boolean => {
  return userData.formationData.completedFilingPayment;
};
