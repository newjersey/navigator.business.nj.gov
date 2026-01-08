import { Business, UserData } from "@businessnjgovnavigator/shared/userData";

export const getCurrentBusiness = (userData: UserData): Business => {
  return userData.businesses[userData.currentBusinessId];
};
