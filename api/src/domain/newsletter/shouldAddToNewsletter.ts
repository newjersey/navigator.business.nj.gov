import { UserData } from "@shared/userData";

export const shouldAddToNewsletter = (userData: UserData): boolean =>
  userData.user.receiveNewsletter && !userData.user.externalStatus.newsletter;
