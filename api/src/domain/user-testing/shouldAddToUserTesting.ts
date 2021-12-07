import { UserData } from "../types";

export const shouldAddToUserTesting = (userData: UserData): boolean =>
  userData.user.userTesting && !userData.user.externalStatus.userTesting;
