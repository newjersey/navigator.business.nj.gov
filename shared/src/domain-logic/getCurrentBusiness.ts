import { Business, UserData } from "../userData";

export const getCurrentBusiness = (userData: UserData): Business => {
  return userData.businesses[userData.currentBusinessId];
};
