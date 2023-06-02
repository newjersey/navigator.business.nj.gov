import { Business } from "@businessnjgovnavigator/shared";
import { Funding } from "../types/types";

export const getVisibleFundings = (fundings: Funding[], business: Business): Funding[] => {
  return fundings.filter((it) => {
    return !business?.preferences.hiddenFundingIds.includes(it.id);
  });
};
