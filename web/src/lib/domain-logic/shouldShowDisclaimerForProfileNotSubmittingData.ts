import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { isOwningBusiness, isRemoteWorkerOrSellerBusiness } from "@/lib/domain-logic/businessPersonaHelpers";
import { Business } from "@businessnjgovnavigator/shared/userData";

const isFormedOutsideNavigator = (business: Business): boolean => {
  return !!(!business.formationData.completedFilingPayment && business.profileData.dateOfFormation);
};

export const shouldShowDisclaimerForProfileNotSubmittingData = (
  business: Business | undefined,
  isAuthenticated: IsAuthenticated
): boolean => {
  if (!business || isAuthenticated === IsAuthenticated.UNKNOWN) return true;

  return (
    isFormedOutsideNavigator(business) ||
    isOwningBusiness(business) ||
    isAuthenticated === IsAuthenticated.FALSE ||
    isRemoteWorkerOrSellerBusiness(business)
  );
};
