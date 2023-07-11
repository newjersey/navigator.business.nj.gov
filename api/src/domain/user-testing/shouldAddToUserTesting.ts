import { UserDataPrime } from "@shared/userData";

export const shouldAddToUserTesting = (userData: UserDataPrime): boolean => {
  return userData.user.userTesting && !userData.user.externalStatus.userTesting;
};
