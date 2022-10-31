import { UserData } from "@shared/userData";

export const shouldAddToUserTesting = (userData: UserData): boolean => {
  return userData.user.userTesting && !userData.user.externalStatus.userTesting;
};
