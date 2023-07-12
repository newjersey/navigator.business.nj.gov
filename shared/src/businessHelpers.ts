import { Business } from "./business";
import { UserDataPrime } from "./userData";

export const modifyCurrentBusiness = (
  userData: UserDataPrime,
  updatedBusiness: Business
): UserDataPrime => {
  const updatedBusinesses = { ...userData.businesses, [userData.currentBusinessID]: updatedBusiness };
  return { ...userData, businesses: updatedBusinesses };
};
export const getCurrentBusiness = (userData: UserDataPrime): Business => {
  return userData.businesses[userData.currentBusinessID];
};
