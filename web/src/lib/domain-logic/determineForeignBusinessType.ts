import { ForeignBusinessType } from "@businessnjgovnavigator/shared";

export const determineForeignBusinessType = (foreignBusinessTypeIds: string[]): ForeignBusinessType => {
  if (foreignBusinessTypeIds.length === 0) {
    return undefined;
  }
  if (foreignBusinessTypeIds.includes("none")) {
    return "NONE";
  }
  if (foreignBusinessTypeIds.includes("operationsInNJ")) {
    return "NEXUS";
  }
  if (foreignBusinessTypeIds.includes("employeesInNJ")) {
    return "REMOTE_WORKER";
  }
  return "REMOTE_SELLER";
};
