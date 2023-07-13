import { Business } from "./business";
import { UserDataPrime } from "./userData";

export const modifyCurrentBusiness = (
  userData: UserDataPrime,
  updatedBusiness: Business
): UserDataPrime => {
  const updatedBusinesses = { ...userData.businesses, [userData.currentBusinessId]: updatedBusiness };
  return { ...userData, businesses: updatedBusinesses };
};
export const getCurrentBusiness = (userData: UserDataPrime): Business => {
  return userData.businesses[userData.currentBusinessId];
};
