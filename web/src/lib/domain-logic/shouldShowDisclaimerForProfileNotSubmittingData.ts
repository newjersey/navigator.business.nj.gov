import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { isRemoteWorkerOrSeller } from "@/lib/domain-logic/isRemoteWorkerOrSeller";
import { Business } from "@businessnjgovnavigator/shared/userData";

const isFormedOutsideNavigator = (business: Business): boolean => {
  return !!(!business.formationData.completedFilingPayment && business.profileData.dateOfFormation);
};

export const shouldShowDisclaimerForProfileNotSubmittingData = (
  business: Business | undefined,
  isAuthenticated: IsAuthenticated
): boolean => {
  if (!business || isAuthenticated === IsAuthenticated.UNKNOWN) return true;

  const { profileData } = business;
  const { businessPersona } = profileData;

  return (
    isFormedOutsideNavigator(business) ||
    businessPersona === "OWNING" ||
    isAuthenticated === IsAuthenticated.FALSE ||
    isRemoteWorkerOrSeller(business)
  );
};
