import { ForeignBusinessTypeId } from "../profileData";

export type ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

export const determineForeignBusinessType = (ids: ForeignBusinessTypeId[]): ForeignBusinessType => {
  if (ids.includes("none")) return "NONE";

  if (ids.includes("employeeOrContractorInNJ")) return "NEXUS";
  if (ids.includes("officeInNJ")) return "NEXUS";
  if (ids.includes("propertyInNJ")) return "NEXUS";
  if (ids.includes("companyOperatedVehiclesInNJ")) return "NEXUS";

  if (ids.includes("employeesInNJ")) return "REMOTE_WORKER";

  if (ids.includes("revenueInNJ")) return "REMOTE_SELLER";
  if (ids.includes("transactionsInNJ")) return "REMOTE_SELLER";

  return undefined;
};
