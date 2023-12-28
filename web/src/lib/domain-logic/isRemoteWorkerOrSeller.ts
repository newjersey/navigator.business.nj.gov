import { Business } from "@businessnjgovnavigator/shared/";
import { determineForeignBusinessType } from "@businessnjgovnavigator/shared/domain-logic/determineForeignBusinessType";

export const isRemoteWorkerOrSeller = (business: Business | undefined): boolean => {
  if (!business) return false;

  const foreignBusinessType = determineForeignBusinessType(business.profileData.foreignBusinessTypeIds);
  return foreignBusinessType === "REMOTE_SELLER" || foreignBusinessType === "REMOTE_WORKER";
};
