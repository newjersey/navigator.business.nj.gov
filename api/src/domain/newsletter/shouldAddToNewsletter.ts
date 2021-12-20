import { shouldAddToNewsletter as shouldAddToNewsletterBusinessUser } from "@shared/businessUser";
import { UserData } from "@shared/userData";

export const shouldAddToNewsletter = (userData: UserData): boolean =>
  shouldAddToNewsletterBusinessUser(userData.user);
