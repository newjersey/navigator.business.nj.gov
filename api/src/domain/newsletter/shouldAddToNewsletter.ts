import { UserData } from "../types";

export const shouldAddToNewsletter = (userData: UserData): boolean =>
  userData.user.receiveNewsletter && !userData.user.externalStatus.newsletter;
