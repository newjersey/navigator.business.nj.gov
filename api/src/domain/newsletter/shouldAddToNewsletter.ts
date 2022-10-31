import { UserData } from "@shared/userData";

export const shouldAddToNewsletter = (userData: UserData): boolean => {
  return userData.user.receiveNewsletter && !userData.user.externalStatus.newsletter;
};
