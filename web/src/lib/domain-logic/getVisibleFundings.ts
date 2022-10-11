import { UserData } from "@businessnjgovnavigator/shared";
import { Funding } from "../types/types";

export const getVisibleFundings = (fundings: Funding[], userData: UserData) => {
  return fundings.filter((it) => !userData?.preferences.hiddenFundingIds.includes(it.id));
};
