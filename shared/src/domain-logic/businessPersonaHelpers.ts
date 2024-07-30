import { intersection } from "lodash";
import { ForeignBusinessTypeId, ProfileData } from "../profileData";
import { Business } from "../userData";

export const isRemoteWorkerOrSellerBusiness = (business?: Business | undefined): boolean => {
  if (!business) return false;
  return isRemoteWorkerOrSellerProfileData(business?.profileData);
};

export const isRemoteWorkerOrSellerProfileData = (profileData?: ProfileData | undefined): boolean => {
  if (!profileData || profileData.businessPersona !== "FOREIGN") return false;
  const foreignBusinessType = determineForeignBusinessType(profileData.foreignBusinessTypeIds);
  return foreignBusinessType === "REMOTE_SELLER" || foreignBusinessType === "REMOTE_WORKER";
};

export const isNexusBusiness = (business?: Business | undefined): boolean => {
  if (!business || business.profileData.businessPersona !== "FOREIGN") return false;
  return determineForeignBusinessType(business.profileData.foreignBusinessTypeIds) === "NEXUS";
};

export const isStartingBusiness = (business?: Business | undefined): boolean => {
  if (!business) return false;
  return business.profileData.businessPersona === "STARTING";
};

export const isOwningBusiness = (business?: Business | undefined): boolean => {
  if (!business) return false;
  return business.profileData.businessPersona === "OWNING";
};

export const isDomesticEmployerBusiness = (business?: Business | undefined): boolean => {
  if (!business) return false;
  return (
    business.profileData.businessPersona === "STARTING" &&
    business.profileData.industryId === "domestic-employer"
  );
};

export type ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

export const NexusBusinessTypeIds: ForeignBusinessTypeId[] = [
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
];
export const RemoteWorkerBusinessTypeIds: ForeignBusinessTypeId[] = ["employeesInNJ"];
export const RemoteSellerBusinessTypeIds: ForeignBusinessTypeId[] = ["revenueInNJ", "transactionsInNJ"];

export const determineForeignBusinessType = (ids: ForeignBusinessTypeId[]): ForeignBusinessType => {
  if (ids.includes("none")) return "NONE";
  if (intersection(ids, NexusBusinessTypeIds).length > 0) return "NEXUS";
  if (intersection(ids, RemoteWorkerBusinessTypeIds).length > 0) return "REMOTE_WORKER";
  if (intersection(ids, RemoteSellerBusinessTypeIds).length > 0) return "REMOTE_SELLER";
  return undefined;
};
