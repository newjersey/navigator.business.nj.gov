import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Business } from "@businessnjgovnavigator/shared/userData";

const isFormedOutsideNavigator = (business: Business): boolean => {
  if (business.formationData.completedFilingPayment === false && business.profileData.dateOfFormation) {
    return true;
  }
  return false;
};

export const shouldShowDisclaimerForProfileNotSubmittingData = (
  business: Business | undefined,
  isAuthenticated: IsAuthenticated
): boolean => {
  if (!business || isAuthenticated === IsAuthenticated.UNKNOWN) return true;

  if (
    isFormedOutsideNavigator(business) ||
    business.profileData.businessPersona === "OWNING" ||
    isAuthenticated === IsAuthenticated.FALSE
  ) {
    return true;
  }
  return false;
};
