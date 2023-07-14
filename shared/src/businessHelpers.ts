import { Business } from "./business";
import { UserDataPrime } from "./userData";

export const getCurrentBusiness = (userData: UserDataPrime): Business => {
  return userData.businesses[userData.currentBusinessId];
};
