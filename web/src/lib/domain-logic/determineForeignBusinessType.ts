import { ForeignBusinessType } from "@businessnjgovnavigator/shared";

export const determineForeignBusinessType = (foreignBusinessTypeIds: string[]): ForeignBusinessType => {
  if (foreignBusinessTypeIds.length === 0) {
    return undefined;
  }
  if (foreignBusinessTypeIds.includes("none")) {
    return "NONE";
  }
  if (foreignBusinessTypeIds.includes("employeeOrContractorInNJ")) {
    return "NEXUS";
  }
  if (foreignBusinessTypeIds.includes("officeInNJ")) {
    return "NEXUS";
  }
  if (foreignBusinessTypeIds.includes("propertyInNJ")) {
    return "NEXUS";
  }
  if (foreignBusinessTypeIds.includes("companyOperatedVehiclesInNJ")) {
    return "NEXUS";
  }
  if (foreignBusinessTypeIds.includes("employeesInNJ")) {
    return "REMOTE_WORKER";
  }
  return "REMOTE_SELLER";
};
