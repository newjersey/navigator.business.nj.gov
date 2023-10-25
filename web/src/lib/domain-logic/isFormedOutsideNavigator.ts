import { Business } from "@businessnjgovnavigator/shared/userData";

export const isFormedOutsideNavigator = (business: Business | undefined): boolean => {
  if (!business) return false;
  if (
    (business.formationData.completedFilingPayment === false && business.profileData.dateOfFormation) ||
    business.profileData.businessPersona === "OWNING"
  ) {
    return true;
  }
  return false;
};
