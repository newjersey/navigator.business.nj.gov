import { UserData } from "@businessnjgovnavigator/shared";
import { Funding } from "../types/types";

export const getVisibleFundings = (fundings: Funding[], userData: UserData): Funding[] => {
  return fundings.filter((it) => {
    return !userData?.preferences.hiddenFundingIds.includes(it.id);
  });
};
