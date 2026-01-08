import { Business } from "@businessnjgovnavigator/shared/userData";

export const hasCompletedFormation = (business: Business | undefined): boolean => {
  if (!business) return false;
  return business.formationData.completedFilingPayment;
};
