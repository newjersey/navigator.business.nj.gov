import {Business} from "../userData";

export const hasCompletedFormation = (business: Business | undefined): boolean => {
  if (!business) return false;
  return business.formationData.completedFilingPayment;
};
