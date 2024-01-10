import { determineForeignBusinessType } from "@businessnjgovnavigator/shared/domain-logic/determineForeignBusinessType";
import { Business } from "@businessnjgovnavigator/shared/userData";

export const isRemoteWorkerOrSellerBusiness = (business: Business | undefined): boolean => {
  if (!business || business.profileData.businessPersona !== "FOREIGN") return false;
  const foreignBusinessType = determineForeignBusinessType(business.profileData.foreignBusinessTypeIds);
  return foreignBusinessType === "REMOTE_SELLER" || foreignBusinessType === "REMOTE_WORKER";
};
export const isNexusBusiness = (business: Business | undefined): boolean => {
  if (!business || business.profileData.businessPersona !== "FOREIGN") return false;
  return determineForeignBusinessType(business.profileData.foreignBusinessTypeIds) === "NEXUS";
};

export const isStartingBusiness = (business: Business | undefined): boolean => {
  if (!business) return false;
  return business.profileData.businessPersona === "STARTING";
};

export const isOwningBusiness = (business: Business | undefined): boolean => {
  if (!business) return false;
  return business.profileData.businessPersona === "OWNING";
};
