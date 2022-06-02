import { ForeignBusinessType } from "@businessnjgovnavigator/shared";

export const determineForeignBusinessType = (foreignBusinessTypeIds: string[]): ForeignBusinessType => {
  if (foreignBusinessTypeIds.length === 0) return undefined;
  return "REMOTE_SELLER";
};
