import { UserDataPrime } from "@shared/userData";

export const shouldAddToNewsletter = (userData: UserDataPrime): boolean => {
  return userData.user.receiveNewsletter && !userData.user.externalStatus.newsletter;
};
