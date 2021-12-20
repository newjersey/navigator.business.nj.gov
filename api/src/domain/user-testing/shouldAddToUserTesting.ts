import { shouldAddToUserTesting as shouldAddToUserTestingBusinessUser } from "@shared/businessUser";
import { UserData } from "@shared/userData";

export const shouldAddToUserTesting = (userData: UserData): boolean =>
  shouldAddToUserTestingBusinessUser(userData.user);
