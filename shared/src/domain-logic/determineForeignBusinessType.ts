import { intersection } from "lodash";
import { ForeignBusinessTypeId } from "../profileData";

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
