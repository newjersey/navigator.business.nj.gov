import { UserData } from "@shared/userData";

export const shouldAddToUserTesting = (userData: UserData): boolean =>
  userData.user.userTesting && !userData.user.externalStatus.userTesting;
